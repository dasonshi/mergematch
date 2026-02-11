from __future__ import annotations

import types
import unittest
from pathlib import Path

from backend_test_utils import (
    FakeSupabase,
    create_package,
    load_source_module,
    temporary_modules,
)


BULK_SERVICE_PATH = (
    Path(__file__).resolve().parents[1] / "app" / "services" / "bulk_merge_service.py"
)
MERGE_TASKS_PATH = (
    Path(__file__).resolve().parents[1] / "app" / "tasks" / "merge_tasks.py"
)


def _seed_bulk_tables() -> dict[str, list[dict]]:
    return {
        "bulk_jobs": [
            {
                "id": "job-1",
                "location_id": "loc-1",
                "rule_id": None,
                "status": "pending",
                "total_count": 2,
                "processed_count": 0,
                "success_count": 0,
                "failed_count": 0,
                "cancel_requested": False,
            }
        ],
        "match_pairs": [
            {
                "id": "match-1",
                "location_id": "loc-1",
                "rule_id": "rule-contacts",
                "status": "pending",
                "record_a_data": {"id": "a-1", "firstName": "Alpha"},
                "record_b_data": {"id": "b-1", "firstName": "Beta"},
            },
            {
                "id": "match-2",
                "location_id": "loc-1",
                "rule_id": "rule-custom",
                "status": "pending",
                "record_a_data": {"id": "a-2", "_raw": {"properties": {"vin": "VIN-A"}}},
                "record_b_data": {"id": "b-2", "_raw": {"properties": {"vin": "VIN-B"}}},
            },
        ],
        "match_rules": [
            {
                "id": "rule-contacts",
                "location_id": "loc-1",
                "merge_strategy": "recent",
                "source_object": "contacts",
                "merge_settings": {"overwrite_blanks": False},
            },
            {
                "id": "rule-custom",
                "location_id": "loc-1",
                "merge_strategy": "oldest",
                "source_object": "custom_objects.vehicles",
                "merge_settings": {
                    "overwrite_blanks": True,
                    "field_preservation": {
                        "enabled": True,
                        "mappings": [
                            {"source": "customField.vin", "target": "customField.alt_vin"}
                        ],
                    },
                },
            },
        ],
    }


class BulkMixedRuleParityIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def test_background_bulk_merge_uses_per_match_rule_context(self):
        compute_calls: list[dict] = []
        merge_calls: list[dict] = []

        def compute_merge_selections(
            record_a, record_b, strategy, overwrite_blanks=False, source_object="contacts"
        ):
            compute_calls.append(
                {
                    "record_a_id": record_a.get("id"),
                    "record_b_id": record_b.get("id"),
                    "strategy": strategy,
                    "overwrite_blanks": overwrite_blanks,
                    "source_object": source_object,
                }
            )
            return record_a.get("id"), {"selected_strategy": strategy}

        async def execute_merge(**kwargs):
            merge_calls.append(kwargs)
            return {"id": f"merge-{kwargs['match_id']}"}

        async def check_merge_quota(_location_id: str, _plan: str):
            return {"allowed": True, "used": 0, "limit": 1000, "remaining": 1000}

        async def get_location_tokens(_ghl_location_id: str):
            return {"access_token": "fresh-token"}

        async def refresh_ghl_token(_ghl_location_id: str):
            return None

        supabase = FakeSupabase(_seed_bulk_tables())

        modules = {
            "app": create_package("app"),
            "app.db": create_package("app.db"),
            "app.services": create_package("app.services"),
        }

        db_mod = types.ModuleType("app.db.supabase")
        db_mod.get_supabase = lambda: supabase
        modules["app.db.supabase"] = db_mod

        merge_mod = types.ModuleType("app.services.merge_service")
        merge_mod.compute_merge_selections = compute_merge_selections
        merge_mod.execute_merge = execute_merge
        modules["app.services.merge_service"] = merge_mod

        billing_mod = types.ModuleType("app.services.billing_service")
        billing_mod.check_merge_quota = check_merge_quota
        modules["app.services.billing_service"] = billing_mod

        auth_mod = types.ModuleType("app.services.auth_service")
        auth_mod.get_location_tokens = get_location_tokens
        auth_mod.refresh_ghl_token = refresh_ghl_token
        modules["app.services.auth_service"] = auth_mod

        with temporary_modules(modules):
            bulk_module = load_source_module("bulk_merge_test_module", BULK_SERVICE_PATH)
            await bulk_module.execute_bulk_merge(
                job_id="job-1",
                tenant_id="tenant-1",
                location_id="loc-1",
                rule_id=None,
                match_ids=["match-1", "match-2"],
                access_token="seed-token",
                ghl_location_id="ghl-loc-1",
                plan="pro",
            )

        self.assertEqual(len(compute_calls), 2)
        compute_by_record = {call["record_a_id"]: call for call in compute_calls}
        self.assertEqual(compute_by_record["a-1"]["strategy"], "recent")
        self.assertEqual(compute_by_record["a-1"]["source_object"], "contacts")
        self.assertFalse(compute_by_record["a-1"]["overwrite_blanks"])

        self.assertEqual(compute_by_record["a-2"]["strategy"], "oldest")
        self.assertEqual(compute_by_record["a-2"]["source_object"], "custom_objects.vehicles")
        self.assertTrue(compute_by_record["a-2"]["overwrite_blanks"])

        self.assertEqual(len(merge_calls), 2)
        merge_by_match = {call["match_id"]: call for call in merge_calls}
        self.assertFalse(merge_by_match["match-1"]["preserve_alternates"])
        self.assertIsNone(merge_by_match["match-1"]["field_preservation_mappings"])
        self.assertEqual(merge_by_match["match-1"]["field_selections"]["selected_strategy"], "recent")

        self.assertTrue(merge_by_match["match-2"]["preserve_alternates"])
        self.assertEqual(
            merge_by_match["match-2"]["field_preservation_mappings"],
            [{"source": "customField.vin", "target": "customField.alt_vin"}],
        )
        self.assertEqual(merge_by_match["match-2"]["field_selections"]["selected_strategy"], "oldest")

        job = supabase.tables["bulk_jobs"][0]
        self.assertEqual(job["status"], "completed")
        self.assertEqual(job["processed_count"], 2)
        self.assertEqual(job["success_count"], 2)
        self.assertEqual(job["failed_count"], 0)


class BulkCeleryParityIntegrationTests(unittest.TestCase):
    def test_celery_bulk_task_matches_background_mixed_rule_behavior(self):
        compute_calls: list[dict] = []
        merge_calls: list[dict] = []

        def compute_merge_selections(
            record_a, record_b, strategy, overwrite_blanks=False, source_object="contacts"
        ):
            compute_calls.append(
                {
                    "record_a_id": record_a.get("id"),
                    "strategy": strategy,
                    "overwrite_blanks": overwrite_blanks,
                    "source_object": source_object,
                }
            )
            return record_a.get("id"), {"selected_strategy": strategy}

        async def execute_merge(**kwargs):
            merge_calls.append(kwargs)
            return {"id": f"merge-{kwargs['match_id']}"}

        async def check_merge_quota(_location_id: str, _plan: str):
            return {"allowed": True, "used": 0, "limit": 1000, "remaining": 1000}

        async def get_location_tokens(_ghl_location_id: str):
            return {"access_token": "fresh-token"}

        async def refresh_ghl_token(_ghl_location_id: str):
            return None

        supabase = FakeSupabase(_seed_bulk_tables())

        modules = {
            "app": create_package("app"),
            "app.core": create_package("app.core"),
            "app.db": create_package("app.db"),
            "app.services": create_package("app.services"),
            "app.tasks": create_package("app.tasks"),
        }

        db_mod = types.ModuleType("app.db.supabase")
        db_mod.get_supabase = lambda: supabase
        modules["app.db.supabase"] = db_mod

        merge_mod = types.ModuleType("app.services.merge_service")
        merge_mod.compute_merge_selections = compute_merge_selections
        merge_mod.execute_merge = execute_merge
        modules["app.services.merge_service"] = merge_mod

        billing_mod = types.ModuleType("app.services.billing_service")
        billing_mod.check_merge_quota = check_merge_quota
        modules["app.services.billing_service"] = billing_mod

        auth_mod = types.ModuleType("app.services.auth_service")
        auth_mod.get_location_tokens = get_location_tokens
        auth_mod.refresh_ghl_token = refresh_ghl_token
        modules["app.services.auth_service"] = auth_mod

        celery_mod = create_package("celery")
        celery_exceptions_mod = types.ModuleType("celery.exceptions")

        class SoftTimeLimitExceeded(Exception):
            pass

        celery_exceptions_mod.SoftTimeLimitExceeded = SoftTimeLimitExceeded
        modules["celery"] = celery_mod
        modules["celery.exceptions"] = celery_exceptions_mod

        celery_app_mod = types.ModuleType("app.core.celery_app")

        class _FakeCeleryApp:
            def task(self, *_args, **_kwargs):
                def decorator(func):
                    return func

                return decorator

        celery_app_mod.celery_app = _FakeCeleryApp()
        modules["app.core.celery_app"] = celery_app_mod

        with temporary_modules(modules):
            bulk_module = load_source_module("bulk_merge_task_parity_module", BULK_SERVICE_PATH)
            bulk_service_mod = types.ModuleType("app.services.bulk_merge_service")
            bulk_service_mod.process_single_merge = bulk_module.process_single_merge
            modules["app.services.bulk_merge_service"] = bulk_service_mod

            with temporary_modules({"app.services.bulk_merge_service": bulk_service_mod}):
                tasks_module = load_source_module("merge_tasks_test_module", MERGE_TASKS_PATH)
                result = tasks_module.execute_bulk_merge_task(
                    None,
                    "job-1",
                    "tenant-1",
                    "loc-1",
                    None,
                    ["match-1", "match-2"],
                    "ghl-loc-1",
                    "pro",
                )

        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["processed"], 2)
        self.assertEqual(result["success"], 2)
        self.assertEqual(result["failed"], 0)

        self.assertEqual(len(compute_calls), 2)
        compute_by_record = {call["record_a_id"]: call for call in compute_calls}
        self.assertEqual(compute_by_record["a-1"]["strategy"], "recent")
        self.assertEqual(compute_by_record["a-2"]["strategy"], "oldest")
        self.assertEqual(compute_by_record["a-2"]["source_object"], "custom_objects.vehicles")

        merge_by_match = {call["match_id"]: call for call in merge_calls}
        self.assertFalse(merge_by_match["match-1"]["preserve_alternates"])
        self.assertTrue(merge_by_match["match-2"]["preserve_alternates"])

        job = supabase.tables["bulk_jobs"][0]
        self.assertEqual(job["status"], "completed")
        self.assertEqual(job["processed_count"], 2)
        self.assertEqual(job["success_count"], 2)
        self.assertEqual(job["failed_count"], 0)


if __name__ == "__main__":
    unittest.main()
