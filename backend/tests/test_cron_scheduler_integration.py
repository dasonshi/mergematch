from __future__ import annotations

import types
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

from backend_test_utils import (
    FakeSupabase,
    create_package,
    load_source_module,
    make_fastapi_stub,
    temporary_modules,
)


CRON_PATH = (
    Path(__file__).resolve().parents[1] / "app" / "api" / "routes" / "cron.py"
)


class CronSchedulerIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def test_process_scheduled_scans_runs_due_rule_and_auto_merges(self):
        now = datetime.utcnow()
        due_scan = (now - timedelta(hours=3)).isoformat() + "Z"

        supabase = FakeSupabase(
            {
                "match_rules": [
                    {
                        "id": "rule-due",
                        "name": "Vehicles hourly",
                        "is_active": True,
                        "schedule_frequency": "hourly",
                        "last_scan_at": due_scan,
                        "schedule_time": None,
                        "schedule_day": None,
                        "source_object": "custom_objects.vehicles",
                        "merge_strategy": "recent",
                        "auto_merge_threshold": 0.9,
                        "merge_settings": {"overwrite_blanks": False},
                        "locations": {
                            "id": "loc-1",
                            "tenant_id": "tenant-1",
                            "ghl_location_id": "ghl-loc-1",
                            "tenants": {"plan": "pro"},
                        },
                    }
                ],
                "match_pairs": [
                    {
                        "id": "match-1",
                        "location_id": "loc-1",
                        "rule_id": "rule-due",
                        "status": "pending",
                        "confidence_score": 0.95,
                        "record_a_data": {"id": "rec-a", "vehicle_name": "Model X"},
                        "record_b_data": {"id": "rec-b", "vehicle_name": "Model X"},
                    }
                ],
                "job_executions": [],
            }
        )

        merge_calls: list[dict] = []

        async def run_scan(**_kwargs):
            return {"records_scanned": 4, "matches_found": 1, "matches_stored": 1}

        async def get_location_tokens_with_refresh(_ghl_location_id: str):
            return {"access_token": "token"}

        def get_plan_features(_plan: str):
            return SimpleNamespace(scheduled_scans=True, auto_merge=True)

        def compute_merge_selections(*_args, **_kwargs):
            return "rec-a", {"vehicle_name": "a"}

        async def execute_merge(**kwargs):
            merge_calls.append(kwargs)
            return {"id": "merge-1"}

        modules = {
            "fastapi": make_fastapi_stub(),
            "app": create_package("app"),
            "app.db": create_package("app.db"),
            "app.services": create_package("app.services"),
        }

        config_mod = types.ModuleType("app.config")
        config_mod.settings = SimpleNamespace(CRON_SECRET="secret", ENVIRONMENT="production")
        modules["app.config"] = config_mod

        db_mod = types.ModuleType("app.db.supabase")
        db_mod.get_supabase = lambda: supabase
        modules["app.db.supabase"] = db_mod

        matching_mod = types.ModuleType("app.services.matching_service")
        matching_mod.run_scan = run_scan
        modules["app.services.matching_service"] = matching_mod

        auth_mod = types.ModuleType("app.services.auth_service")
        auth_mod.get_location_tokens_with_refresh = get_location_tokens_with_refresh
        modules["app.services.auth_service"] = auth_mod

        billing_mod = types.ModuleType("app.services.billing_service")
        billing_mod.get_plan_features = get_plan_features
        modules["app.services.billing_service"] = billing_mod

        bulk_mod = types.ModuleType("app.services.bulk_merge_service")
        bulk_mod.compute_merge_selections = compute_merge_selections
        modules["app.services.bulk_merge_service"] = bulk_mod

        merge_mod = types.ModuleType("app.services.merge_service")
        merge_mod.execute_merge = execute_merge
        modules["app.services.merge_service"] = merge_mod

        with temporary_modules(modules):
            cron_module = load_source_module("cron_test_module", CRON_PATH)
            result = await cron_module.process_scheduled_scans(x_cron_secret="secret")

        self.assertEqual(result["processed"], 1)
        self.assertEqual(result["errors"], 0)
        self.assertEqual(result["details"]["processed"][0]["auto_merged"], 1)
        self.assertEqual(result["details"]["processed"][0]["auto_merge_failed"], 0)
        self.assertEqual(len(merge_calls), 1)
        self.assertEqual(merge_calls[0]["plan"], "pro")

        self.assertEqual(len(supabase.tables["job_executions"]), 1)
        self.assertEqual(supabase.tables["job_executions"][0]["status"], "completed")
        self.assertEqual(supabase.tables["job_executions"][0]["auto_merged"], 1)
        self.assertIn("last_scan_at", supabase.tables["match_rules"][0])

    async def test_should_run_now_honors_schedule_frequency(self):
        modules = {
            "fastapi": make_fastapi_stub(),
            "app": create_package("app"),
            "app.db": create_package("app.db"),
            "app.services": create_package("app.services"),
        }

        config_mod = types.ModuleType("app.config")
        config_mod.settings = SimpleNamespace(CRON_SECRET="secret", ENVIRONMENT="production")
        modules["app.config"] = config_mod

        dummy = types.ModuleType("app.db.supabase")
        dummy.get_supabase = lambda: FakeSupabase()
        modules["app.db.supabase"] = dummy

        for module_name in (
            "app.services.matching_service",
            "app.services.auth_service",
            "app.services.billing_service",
            "app.services.bulk_merge_service",
            "app.services.merge_service",
        ):
            stub = types.ModuleType(module_name)
            if module_name.endswith("matching_service"):
                async def _run_scan(**_kwargs):
                    return {}

                stub.run_scan = _run_scan
            if module_name.endswith("auth_service"):
                async def _tokens(_ghl_id):
                    return {"access_token": "x"}

                stub.get_location_tokens_with_refresh = _tokens
            if module_name.endswith("billing_service"):
                stub.get_plan_features = lambda _plan: SimpleNamespace(
                    scheduled_scans=True, auto_merge=False
                )
            if module_name.endswith("bulk_merge_service"):
                stub.compute_merge_selections = lambda *_args, **_kwargs: ("", {})
            if module_name.endswith("merge_service"):
                async def _execute_merge(**_kwargs):
                    return {}

                stub.execute_merge = _execute_merge
            modules[module_name] = stub

        with temporary_modules(modules):
            cron_module = load_source_module("cron_schedule_only_module", CRON_PATH)

        self.assertFalse(cron_module.should_run_now("manual", None))
        self.assertTrue(cron_module.should_run_now("hourly", None))

        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0, hour=10)
        last_week = (now - timedelta(days=8)).isoformat() + "Z"
        due_this_hour = f"{now.hour:02d}:00"
        self.assertTrue(
            cron_module.should_run_now(
                "weekly", last_week, schedule_time=due_this_hour, schedule_day=None
            )
        )

        wrong_hour = "23:00"
        last_scan_after_wrong_slot = (
            (now - timedelta(days=7)).replace(hour=23, minute=30).isoformat() + "Z"
        )
        self.assertFalse(
            cron_module.should_run_now(
                "weekly",
                last_scan_after_wrong_slot,
                schedule_time=wrong_hour,
                schedule_day=None,
            )
        )


if __name__ == "__main__":
    unittest.main()
