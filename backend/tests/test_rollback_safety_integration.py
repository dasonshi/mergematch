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


MERGE_SERVICE_PATH = (
    Path(__file__).resolve().parents[1] / "app" / "services" / "merge_service.py"
)


class _FakeGHLClient:
    instances: list["_FakeGHLClient"] = []

    def __init__(self, _access_token: str, _ghl_location_id: str):
        self.created_custom_records: list[dict] = []
        self.created_relations: list[dict] = []
        self.updated_custom_records: list[dict] = []
        _FakeGHLClient.instances.append(self)

    async def __aenter__(self) -> "_FakeGHLClient":
        return self

    async def __aexit__(self, *_args):
        return False

    async def create_custom_object_record(self, schema_key: str, properties: dict):
        self.created_custom_records.append(
            {"schema_key": schema_key, "properties": properties}
        )
        return {"record": {"id": "dup-restored-1"}}

    async def create_relation(
        self,
        *,
        source_object_key: str,
        source_record_id: str,
        target_object_key: str,
        target_record_id: str,
        association_id: str,
        pipeline_id: str = None,
    ):
        self.created_relations.append(
            {
                "source_object_key": source_object_key,
                "source_record_id": source_record_id,
                "target_object_key": target_object_key,
                "target_record_id": target_record_id,
                "association_id": association_id,
                "pipeline_id": pipeline_id,
            }
        )
        return {"ok": True}

    async def update_custom_object_record(
        self, schema_key: str, record_id: str, properties: dict
    ):
        self.updated_custom_records.append(
            {"schema_key": schema_key, "record_id": record_id, "properties": properties}
        )
        return {"ok": True}


class RollbackSafetyIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def test_custom_object_rollback_remaps_pairs_and_safely_restores_only_related_associations(
        self,
    ):
        _FakeGHLClient.instances = []
        supabase = FakeSupabase(
            {
                "merges": [
                    {
                        "id": "merge-1",
                        "location_id": "loc-1",
                        "status": "completed",
                        "master_record_id": "master-1",
                        "duplicate_record_id": "dup-old-1",
                        "match_pair_id": "pair-main",
                        "master_record_type": "custom_objects.vehicles",
                    }
                ],
                "snapshots": [
                    {
                        "id": "snap-master",
                        "merge_id": "merge-1",
                        "record_type": "master",
                        "data": {
                            "id": "master-1",
                            "_raw": {"properties": {"vehicle_name": "Master Model"}},
                        },
                    },
                    {
                        "id": "snap-dup",
                        "merge_id": "merge-1",
                        "record_type": "duplicate",
                        "data": {
                            "id": "dup-old-1",
                            "_raw": {"properties": {"vehicle_name": "Duplicate Model"}},
                        },
                    },
                    {
                        "id": "snap-assoc",
                        "merge_id": "merge-1",
                        "record_type": "duplicate_associations",
                        "data": {
                            "associations": [
                                {
                                    "firstObjectKey": "custom_objects.vehicles",
                                    "firstRecordId": "dup-old-1",
                                    "secondObjectKey": "contacts",
                                    "secondRecordId": "contact-1",
                                    "associationId": "assoc-1",
                                },
                                {
                                    "firstObjectKey": "custom_objects.vehicles",
                                    "firstRecordId": "other-record",
                                    "secondObjectKey": "contacts",
                                    "secondRecordId": "contact-2",
                                    "associationId": "assoc-2",
                                },
                            ]
                        },
                    },
                ],
                "match_pairs": [
                    {
                        "id": "pair-main",
                        "location_id": "loc-1",
                        "status": "merged",
                        "record_a_id": "master-1",
                        "record_b_id": "dup-old-1",
                        "record_a_data": {"id": "master-1"},
                        "record_b_data": {"id": "dup-old-1"},
                    },
                    {
                        "id": "pair-related",
                        "location_id": "loc-1",
                        "status": "stale",
                        "record_a_id": "dup-old-1",
                        "record_b_id": "third-1",
                        "record_a_data": {"id": "dup-old-1"},
                        "record_b_data": {"id": "third-1"},
                    },
                ],
            }
        )

        modules = {
            "app": create_package("app"),
            "app.core": create_package("app.core"),
            "app.db": create_package("app.db"),
            "app.services": create_package("app.services"),
        }

        httpx_mod = types.ModuleType("httpx")
        httpx_mod.HTTPStatusError = Exception
        modules["httpx"] = httpx_mod

        ghl_client_mod = types.ModuleType("app.core.ghl.client")
        ghl_client_mod.GHLClient = _FakeGHLClient
        modules["app.core.ghl.client"] = ghl_client_mod

        db_mod = types.ModuleType("app.db.supabase")
        db_mod.get_supabase = lambda: supabase
        modules["app.db.supabase"] = db_mod

        matching_mod = types.ModuleType("app.services.matching_service")
        matching_mod.compare_records = lambda *_args, **_kwargs: {}
        modules["app.services.matching_service"] = matching_mod

        billing_mod = types.ModuleType("app.services.billing_service")
        billing_mod.get_plan_features = lambda _plan: types.SimpleNamespace(rollback_days=30)
        modules["app.services.billing_service"] = billing_mod

        with temporary_modules(modules):
            merge_module = load_source_module(
                "merge_service_rollback_test_module", MERGE_SERVICE_PATH
            )
            result = await merge_module.rollback_merge(
                merge_id="merge-1",
                access_token="token",
                ghl_location_id="ghl-loc-1",
                internal_location_id="loc-1",
            )

        self.assertEqual(result["id"], "merge-1")
        self.assertEqual(result["restored_record_id"], "dup-restored-1")
        self.assertEqual(result["status"], "rolled_back_partial")
        self.assertTrue(
            any(
                "Association restore skipped because restored duplicate ID was absent."
                in message
                for message in result["partial_failures"]
            )
        )

        self.assertEqual(len(_FakeGHLClient.instances), 1)
        client = _FakeGHLClient.instances[0]
        self.assertEqual(len(client.created_custom_records), 1)
        self.assertEqual(len(client.created_relations), 1)
        self.assertEqual(client.created_relations[0]["source_record_id"], "dup-restored-1")
        self.assertEqual(len(client.updated_custom_records), 1)
        self.assertEqual(client.updated_custom_records[0]["record_id"], "master-1")

        merge_row = supabase.tables["merges"][0]
        self.assertEqual(merge_row["status"], "rolled_back_partial")
        self.assertEqual(merge_row["restored_record_id"], "dup-restored-1")
        self.assertIn("Association restore skipped", merge_row["error_message"])

        pairs_by_id = {pair["id"]: pair for pair in supabase.tables["match_pairs"]}
        self.assertEqual(pairs_by_id["pair-main"]["status"], "pending")
        self.assertEqual(pairs_by_id["pair-main"]["record_b_id"], "dup-restored-1")
        self.assertEqual(pairs_by_id["pair-main"]["record_b_data"]["id"], "dup-restored-1")
        self.assertEqual(pairs_by_id["pair-related"]["status"], "stale")
        self.assertEqual(pairs_by_id["pair-related"]["record_a_id"], "dup-restored-1")
        self.assertEqual(pairs_by_id["pair-related"]["record_a_data"]["id"], "dup-restored-1")


if __name__ == "__main__":
    unittest.main()
