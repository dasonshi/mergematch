"""Integration tests for core flows: rules, scan, merge, rollback."""
from __future__ import annotations

import types
import unittest
from pathlib import Path
from types import SimpleNamespace

from backend_test_utils import (
    FakeSupabase,
    create_package,
    load_source_module,
    make_fastapi_stub,
    temporary_modules,
)

RULES_PATH = Path(__file__).resolve().parents[1] / "app" / "api" / "routes" / "rules.py"
MERGE_SERVICE_PATH = Path(__file__).resolve().parents[1] / "app" / "services" / "merge_service.py"
MATCHING_SERVICE_PATH = Path(__file__).resolve().parents[1] / "app" / "services" / "matching_service.py"

TENANT_ID = "tenant-1"
LOCATION_ID = "loc-1"
GHL_LOCATION_ID = "ghl-loc-1"


# ---------------------------------------------------------------------------
# FakeGHLClient
# ---------------------------------------------------------------------------

class FakeGHLClient:
    """Mock GHL API client that records all calls and returns configured data."""
    instances: list = []
    _contacts: dict = {}
    _companies: dict = {}
    _opportunities: dict = {}
    _custom_records: dict = {}
    _schemas: dict = {}
    _search_contacts_result: list = []

    def __init__(self, access_token, ghl_location_id):
        self.updated: list = []
        self.deleted: list = []
        self.created: list = []
        FakeGHLClient.instances.append(self)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    @classmethod
    def reset(cls):
        cls.instances = []
        cls._contacts = {}
        cls._companies = {}
        cls._opportunities = {}
        cls._custom_records = {}
        cls._schemas = {}
        cls._search_contacts_result = []

    # ── Contacts ──
    async def search_contacts(self, **kw):
        if kw.get("page", 1) == 1:
            return {"contacts": list(self._search_contacts_result)}
        return {"contacts": []}

    async def get_contact(self, cid):
        return {"contact": self._contacts.get(cid, {"id": cid})}

    async def update_contact(self, cid, data):
        self.updated.append(("contact", cid, data))
        return {"contact": {"id": cid}}

    async def delete_contact(self, cid):
        self.deleted.append(("contact", cid))

    async def create_contact(self, data):
        rid = f"restored-contact-{len(self.created) + 1}"
        self.created.append(("contact", data))
        return {"contact": {"id": rid}}

    # ── Companies ──
    async def get_companies(self):
        return {"businesses": list(self._companies.values())}

    async def get_company(self, cid):
        return {"business": self._companies.get(cid, {"id": cid})}

    async def update_company(self, cid, data):
        self.updated.append(("company", cid, data))
        return {"business": {"id": cid}}

    async def delete_company(self, cid):
        self.deleted.append(("company", cid))

    async def create_company(self, data):
        rid = f"restored-company-{len(self.created) + 1}"
        self.created.append(("company", data))
        return {"business": {"id": rid}}

    # ── Opportunities ──
    async def search_opportunities(self, **kw):
        if kw.get("page", 1) == 1:
            return {"opportunities": list(self._opportunities.values())}
        return {"opportunities": []}

    async def get_opportunity(self, oid):
        return {"opportunity": self._opportunities.get(oid, {"id": oid})}

    async def update_opportunity(self, oid, data):
        self.updated.append(("opportunity", oid, data))
        return {"opportunity": {"id": oid}}

    async def delete_opportunity(self, oid):
        self.deleted.append(("opportunity", oid))

    async def create_opportunity(self, data):
        rid = f"restored-opp-{len(self.created) + 1}"
        self.created.append(("opportunity", data))
        return {"opportunity": {"id": rid}}

    # ── Custom objects ──
    async def search_custom_objects(self, schema_key, **kw):
        if kw.get("page", 1) == 1:
            records = list(self._custom_records.values())
            return {"records": records, "total": len(records)}
        return {"records": [], "total": 0}

    async def get_custom_object_record(self, schema_key, record_id):
        return {"record": self._custom_records.get(
            record_id, {"id": record_id, "properties": {}}
        )}

    async def get_object_schema(self, schema_key, fetch_properties=True):
        return self._schemas.get(schema_key, {"primaryDisplayProperty": ""})

    async def update_custom_object_record(self, schema_key, record_id, properties):
        self.updated.append(("custom_object", record_id, properties))
        return {"record": {"id": record_id}}

    async def delete_custom_object_record(self, schema_key, record_id):
        self.deleted.append(("custom_object", record_id))
        return True

    async def create_custom_object_record(self, schema_key, properties):
        rid = f"restored-custom-{len(self.created) + 1}"
        self.created.append(("custom_object", properties))
        return {"record": {"id": rid}}

    # ── Related records (return empty by default) ──
    async def get_contact_notes(self, cid):
        return []

    async def get_contact_tasks(self, cid):
        return []

    async def get_contact_opportunities(self, cid):
        return []

    async def get_contact_appointments(self, cid):
        return []

    async def get_relations_for_record(self, rid, fail_on_error=False):
        return []

    async def create_relation(self, **kw):
        self.created.append(("relation", kw))
        return {"ok": True}

    async def reassign_contact_notes(self, from_id, to_id):
        return 0

    async def reassign_contact_tasks(self, from_id, to_id):
        return 0

    async def reassign_contact_opportunities(self, from_id, to_id, handling="keep_all"):
        return 0


# ---------------------------------------------------------------------------
# Module builders
# ---------------------------------------------------------------------------

def _make_merge_modules(supabase, ghl_cls):
    """Build temporary_modules dict for loading merge_service.py."""
    modules = {
        "app": create_package("app"),
        "app.core": create_package("app.core"),
        "app.db": create_package("app.db"),
        "app.services": create_package("app.services"),
    }

    httpx_mod = types.ModuleType("httpx")
    httpx_mod.HTTPStatusError = Exception
    modules["httpx"] = httpx_mod

    ghl_mod = types.ModuleType("app.core.ghl.client")
    ghl_mod.GHLClient = ghl_cls
    modules["app.core.ghl.client"] = ghl_mod

    db_mod = types.ModuleType("app.db.supabase")
    db_mod.get_supabase = lambda: supabase
    modules["app.db.supabase"] = db_mod

    matching_mod = types.ModuleType("app.services.matching_service")
    matching_mod.compare_records = lambda *_a, **_kw: (True, 100.0, {})
    modules["app.services.matching_service"] = matching_mod

    billing_mod = types.ModuleType("app.services.billing_service")
    billing_mod.get_plan_features = lambda _plan: SimpleNamespace(rollback_days=30)
    modules["app.services.billing_service"] = billing_mod

    return modules


def _make_rules_modules(supabase):
    """Build temporary_modules dict for loading rules.py."""

    class _FakeLimiter:
        def limit(self, *_a, **_kw):
            return lambda fn: fn

    modules = {
        "fastapi": make_fastapi_stub(),
        "app": create_package("app"),
        "app.core": create_package("app.core"),
        "app.db": create_package("app.db"),
        "app.services": create_package("app.services"),
    }

    db_mod = types.ModuleType("app.db.supabase")
    db_mod.get_supabase = lambda: supabase
    modules["app.db.supabase"] = db_mod

    matching_mod = types.ModuleType("app.services.matching_service")
    matching_mod.run_scan = None
    modules["app.services.matching_service"] = matching_mod

    billing_mod = types.ModuleType("app.services.billing_service")
    billing_mod.get_plan_features = lambda _plan: SimpleNamespace(
        company_matching=True,
        opportunity_matching=True,
        custom_object_matching=True,
        scheduled_scans=True,
    )
    modules["app.services.billing_service"] = billing_mod

    security_mod = types.ModuleType("app.core.security")
    security_mod.AuthenticatedUser = type("AuthenticatedUser", (), {})
    modules["app.core.security"] = security_mod

    deps_mod = types.ModuleType("app.core.deps")
    deps_mod.get_user = lambda: None
    deps_mod.get_auth_context = lambda: None
    deps_mod.AuthContext = type("AuthContext", (), {})
    modules["app.core.deps"] = deps_mod

    rate_limit_mod = types.ModuleType("app.core.rate_limit")
    rate_limit_mod.limiter = _FakeLimiter()
    modules["app.core.rate_limit"] = rate_limit_mod

    return modules


def _make_scan_modules(supabase, ghl_cls):
    """Build temporary_modules dict for loading matching_service.py."""
    modules = {
        "app": create_package("app"),
        "app.core": create_package("app.core"),
        "app.db": create_package("app.db"),
        "app.services": create_package("app.services"),
    }

    ghl_mod = types.ModuleType("app.core.ghl.client")
    ghl_mod.GHLClient = ghl_cls
    modules["app.core.ghl.client"] = ghl_mod

    db_mod = types.ModuleType("app.db.supabase")
    db_mod.get_supabase = lambda: supabase
    modules["app.db.supabase"] = db_mod

    blocking_mod = types.ModuleType("app.services.blocking_service")
    blocking_mod.should_use_blocking = lambda _mf: False
    blocking_mod.clear_contact_blocks = lambda _lid: None
    blocking_mod.stream_contacts_to_blocks = lambda _lid, _c: 0
    blocking_mod.populate_contact_blocks = lambda _lid, _c: 0
    blocking_mod.get_candidate_pairs_sql = lambda _lid, _mf: []
    modules["app.services.blocking_service"] = blocking_mod

    return modules


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------

class TestCoreFlows(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        FakeGHLClient.reset()

    # ── helpers ──────────────────────────────────────────────────────────────

    def _user(self, plan="pro"):
        return SimpleNamespace(
            location_id=LOCATION_ID,
            tenant_id=TENANT_ID,
            ghl_location_id=GHL_LOCATION_ID,
            plan=plan,
        )

    def _seed_merge_tables(self, source_object, record_a, record_b):
        return FakeSupabase({
            "match_rules": [{
                "id": "rule-1",
                "location_id": LOCATION_ID,
                "tenant_id": TENANT_ID,
                "source_object": source_object,
                "match_fields": [
                    {"field": "email", "algorithm": "exact", "weight": 1.0, "operator": "AND"},
                ],
                "review_threshold": 0.70,
                "auto_merge_threshold": 0.95,
                "merge_strategy": "standard",
                "merge_settings": {},
            }],
            "match_pairs": [{
                "id": "pair-1",
                "location_id": LOCATION_ID,
                "tenant_id": TENANT_ID,
                "rule_id": "rule-1",
                "record_a_id": record_a["id"],
                "record_b_id": record_b["id"],
                "record_a_data": record_a,
                "record_b_data": record_b,
                "status": "pending",
                "confidence_score": 0.95,
            }],
            "merges": [],
            "snapshots": [],
        })

    def _seed_rollback_tables(self, source_object, master, duplicate):
        snapshots = [
            {
                "id": "snap-master",
                "merge_id": "merge-1",
                "record_type": "master",
                "data": master,
            },
            {
                "id": "snap-dup",
                "merge_id": "merge-1",
                "record_type": "duplicate",
                "data": duplicate,
            },
        ]
        # Non-contact objects need an associations snapshot
        if not source_object == "contacts":
            snapshots.append({
                "id": "snap-assoc",
                "merge_id": "merge-1",
                "record_type": "duplicate_associations",
                "data": {"associations": []},
            })
        return FakeSupabase({
            "merges": [{
                "id": "merge-1",
                "location_id": LOCATION_ID,
                "status": "completed",
                "master_record_id": master["id"],
                "duplicate_record_id": duplicate["id"],
                "match_pair_id": "pair-1",
                "master_record_type": source_object,
            }],
            "snapshots": snapshots,
            "match_pairs": [{
                "id": "pair-1",
                "location_id": LOCATION_ID,
                "status": "merged",
                "record_a_id": master["id"],
                "record_b_id": duplicate["id"],
                "record_a_data": {"id": master["id"]},
                "record_b_data": {"id": duplicate["id"]},
            }],
        })

    # ══════════════════════════════════════════════════════════════════════════
    # 1. Rule Creation (4 tests)
    # ══════════════════════════════════════════════════════════════════════════

    async def _assert_create_rule(self, source_object, match_fields):
        supabase = FakeSupabase({"match_rules": []})
        modules = _make_rules_modules(supabase)

        with temporary_modules(modules):
            mod = load_source_module(f"rules_create_{source_object}", RULES_PATH)
            body = mod.MatchRuleCreate(
                name=f"Test {source_object}",
                source_object=source_object,
                match_fields=match_fields,
                auto_merge_threshold=95.0,
                review_threshold=70.0,
            )
            result = await mod.create_rule(rule=body, user=self._user())

        self.assertEqual(result["source_object"], source_object)
        self.assertEqual(result["name"], f"Test {source_object}")
        self.assertEqual(len(result["match_fields"]), len(match_fields))
        self.assertAlmostEqual(result["auto_merge_threshold"], 0.95)
        self.assertAlmostEqual(result["review_threshold"], 0.70)
        self.assertEqual(result["schedule_frequency"], "manual")

        stored = supabase.tables["match_rules"]
        self.assertEqual(len(stored), 1)
        self.assertEqual(stored[0]["source_object"], source_object)
        self.assertAlmostEqual(stored[0]["auto_merge_threshold"], 0.95)

    async def test_create_rule_contacts(self):
        await self._assert_create_rule(
            "contacts", [{"field": "email", "algorithm": "exact"}],
        )

    async def test_create_rule_companies(self):
        await self._assert_create_rule(
            "companies", [{"field": "name", "algorithm": "fuzzy"}],
        )

    async def test_create_rule_opportunities(self):
        await self._assert_create_rule(
            "opportunities", [{"field": "name", "algorithm": "exact"}],
        )

    async def test_create_rule_custom_objects(self):
        await self._assert_create_rule(
            "custom_objects.vehicles", [{"field": "vin", "algorithm": "exact"}],
        )

    # ══════════════════════════════════════════════════════════════════════════
    # 2. Scan Execution (1 test)
    # ══════════════════════════════════════════════════════════════════════════

    async def test_scan_rule(self):
        contacts = [
            {"id": "c1", "email": "alice@example.com", "firstName": "Alice", "lastName": "A"},
            {"id": "c2", "email": "bob@example.com", "firstName": "Bob", "lastName": "B"},
            {"id": "c3", "email": "alice@example.com", "firstName": "Alicia", "lastName": "A"},
            {"id": "c4", "email": "charlie@example.com", "firstName": "Charlie", "lastName": "C"},
        ]
        FakeGHLClient._search_contacts_result = contacts

        supabase = FakeSupabase({
            "match_rules": [{
                "id": "rule-1",
                "location_id": LOCATION_ID,
                "tenant_id": TENANT_ID,
                "source_object": "contacts",
                "match_fields": [
                    {"field": "email", "algorithm": "exact", "weight": 1.0, "operator": "AND"},
                ],
                "review_threshold": 0.70,
                "auto_merge_threshold": 0.95,
            }],
            "match_pairs": [],
        })

        modules = _make_scan_modules(supabase, FakeGHLClient)

        with temporary_modules(modules):
            mod = load_source_module("matching_scan_test", MATCHING_SERVICE_PATH)
            result = await mod.run_scan(
                ghl_location_id=GHL_LOCATION_ID,
                rule_id="rule-1",
                access_token="token",
                tenant_id=TENANT_ID,
                internal_location_id=LOCATION_ID,
                plan="pro",
            )

        self.assertGreaterEqual(result["records_scanned"], 4)
        self.assertGreaterEqual(result["matches_found"], 1)

        pairs = supabase.tables.get("match_pairs", [])
        self.assertGreaterEqual(len(pairs), 1)
        pair = pairs[0]
        self.assertEqual(pair["status"], "pending")
        self.assertIn(pair["record_a_id"], ("c1", "c3"))
        self.assertIn(pair["record_b_id"], ("c1", "c3"))
        self.assertGreater(pair["confidence_score"], 0)

    # ══════════════════════════════════════════════════════════════════════════
    # 3. Rule Editing (1 test)
    # ══════════════════════════════════════════════════════════════════════════

    async def test_edit_rule(self):
        supabase = FakeSupabase({
            "match_rules": [{
                "id": "rule-1",
                "location_id": LOCATION_ID,
                "tenant_id": TENANT_ID,
                "name": "Original",
                "source_object": "contacts",
                "match_fields": [
                    {"field": "email", "algorithm": "exact", "weight": 1.0, "operator": "AND"},
                ],
                "auto_merge_threshold": 0.70,
                "review_threshold": 0.50,
                "merge_strategy": "standard",
                "schedule_frequency": "manual",
                "is_active": True,
            }],
        })

        modules = _make_rules_modules(supabase)

        with temporary_modules(modules):
            mod = load_source_module("rules_edit_test", RULES_PATH)
            body = mod.MatchRuleCreate(
                name="Updated Rule",
                source_object="contacts",
                match_fields=[
                    {"field": "email", "algorithm": "exact"},
                    {"field": "phone", "algorithm": "phone"},
                ],
                auto_merge_threshold=90.0,
                review_threshold=60.0,
            )
            result = await mod.update_rule(
                rule_id="rule-1", rule=body, user=self._user(),
            )

        self.assertEqual(result["name"], "Updated Rule")
        self.assertAlmostEqual(result["auto_merge_threshold"], 0.90)
        self.assertAlmostEqual(result["review_threshold"], 0.60)
        self.assertEqual(len(result["match_fields"]), 2)

        stored = supabase.tables["match_rules"][0]
        self.assertEqual(stored["name"], "Updated Rule")
        self.assertEqual(stored["source_object"], "contacts")
        self.assertEqual(stored["location_id"], LOCATION_ID)

    # ══════════════════════════════════════════════════════════════════════════
    # 4. Merge Execution (4 tests)
    # ══════════════════════════════════════════════════════════════════════════

    async def _run_merge(self, source_object, record_a, record_b, module_suffix):
        supabase = self._seed_merge_tables(source_object, record_a, record_b)

        # Populate FakeGHLClient response data based on object type
        is_custom = source_object.startswith("custom_objects.")
        if source_object == "contacts":
            FakeGHLClient._contacts = {r["id"]: r for r in (record_a, record_b)}
        elif source_object == "companies":
            FakeGHLClient._companies = {r["id"]: r for r in (record_a, record_b)}
        elif source_object == "opportunities":
            FakeGHLClient._opportunities = {r["id"]: r for r in (record_a, record_b)}
        elif is_custom:
            FakeGHLClient._custom_records = {r["id"]: r for r in (record_a, record_b)}
            FakeGHLClient._schemas = {
                source_object: {"primaryDisplayProperty": ""},
            }

        # Build field_selections from first few fields of record_a
        skip = {"id", "_raw", "dateAdded", "dateUpdated", "properties"}
        fields = [k for k in record_a if k not in skip and not k.startswith("_")]
        field_selections = {f: "a" for f in fields}

        modules = _make_merge_modules(supabase, FakeGHLClient)

        with temporary_modules(modules):
            mod = load_source_module(f"merge_{module_suffix}", MERGE_SERVICE_PATH)
            result = await mod.execute_merge(
                match_id="pair-1",
                master_record_id=record_a["id"],
                field_selections=field_selections,
                access_token="token",
                ghl_location_id=GHL_LOCATION_ID,
                tenant_id=TENANT_ID,
                internal_location_id=LOCATION_ID,
                plan="pro",
            )

        return result, supabase

    def _assert_merge_completed(self, result, supabase, expected_type, master_id, dup_id):
        self.assertEqual(result["status"], "completed")

        merges = supabase.tables["merges"]
        self.assertEqual(len(merges), 1)
        self.assertEqual(merges[0]["status"], "completed")

        snapshots = supabase.tables["snapshots"]
        self.assertGreaterEqual(len(snapshots), 2)

        pair = supabase.tables["match_pairs"][0]
        self.assertEqual(pair["status"], "merged")

        # Two GHLClient instances: prefetch + merge operations
        self.assertEqual(len(FakeGHLClient.instances), 2)
        merge_client = FakeGHLClient.instances[1]

        self.assertTrue(
            any(d[0] == expected_type and d[1] == dup_id for d in merge_client.deleted),
            f"Expected delete_{expected_type}({dup_id})",
        )
        self.assertTrue(
            any(u[0] == expected_type and u[1] == master_id for u in merge_client.updated),
            f"Expected update_{expected_type}({master_id})",
        )

    async def test_merge_contact_pair(self):
        a = {"id": "ca", "firstName": "Alice", "lastName": "Smith", "email": "a@x.com"}
        b = {"id": "cb", "firstName": "Alicia", "lastName": "Smith", "email": "a@x.com"}
        result, supabase = await self._run_merge("contacts", a, b, "contact")
        self._assert_merge_completed(result, supabase, "contact", "ca", "cb")

    async def test_merge_company_pair(self):
        a = {"id": "coa", "name": "Acme Corp", "email": "info@acme.com"}
        b = {"id": "cob", "name": "Acme Corporation", "email": "info@acme.com"}
        result, supabase = await self._run_merge("companies", a, b, "company")
        self._assert_merge_completed(result, supabase, "company", "coa", "cob")

    async def test_merge_opportunity_pair(self):
        a = {"id": "oa", "name": "Deal A", "monetaryValue": 1000, "status": "open"}
        b = {"id": "ob", "name": "Deal A Copy", "monetaryValue": 500, "status": "open"}
        result, supabase = await self._run_merge("opportunities", a, b, "opp")
        self._assert_merge_completed(result, supabase, "opportunity", "oa", "ob")

    async def test_merge_custom_object_pair(self):
        # GHL API shape: properties nested
        a = {"id": "xa", "properties": {"vin": "ABC", "make": "Toyota"},
             "createdAt": "2024-01-01", "updatedAt": "2024-01-02"}
        b = {"id": "xb", "properties": {"vin": "ABC", "make": "Honda"},
             "createdAt": "2024-01-01", "updatedAt": "2024-01-01"}

        # match_pair data uses normalized (flattened) form
        a_norm = {"id": "xa", "vin": "ABC", "make": "Toyota",
                  "dateAdded": "2024-01-01", "dateUpdated": "2024-01-02", "_raw": a}
        b_norm = {"id": "xb", "vin": "ABC", "make": "Honda",
                  "dateAdded": "2024-01-01", "dateUpdated": "2024-01-01", "_raw": b}

        supabase = self._seed_merge_tables("custom_objects.vehicles", a_norm, b_norm)
        FakeGHLClient._custom_records = {"xa": a, "xb": b}
        FakeGHLClient._schemas = {
            "custom_objects.vehicles": {"primaryDisplayProperty": ""},
        }

        modules = _make_merge_modules(supabase, FakeGHLClient)

        with temporary_modules(modules):
            mod = load_source_module("merge_custom", MERGE_SERVICE_PATH)
            result = await mod.execute_merge(
                match_id="pair-1",
                master_record_id="xa",
                field_selections={"vin": "a", "make": "a"},
                access_token="token",
                ghl_location_id=GHL_LOCATION_ID,
                tenant_id=TENANT_ID,
                internal_location_id=LOCATION_ID,
                plan="pro",
            )

        self._assert_merge_completed(result, supabase, "custom_object", "xa", "xb")

    # ══════════════════════════════════════════════════════════════════════════
    # 5. Merge Rollback (4 tests)
    # ══════════════════════════════════════════════════════════════════════════

    async def _run_rollback(self, source_object, master, duplicate, module_suffix):
        supabase = self._seed_rollback_tables(source_object, master, duplicate)
        modules = _make_merge_modules(supabase, FakeGHLClient)

        with temporary_modules(modules):
            mod = load_source_module(f"rollback_{module_suffix}", MERGE_SERVICE_PATH)
            result = await mod.rollback_merge(
                merge_id="merge-1",
                access_token="token",
                ghl_location_id=GHL_LOCATION_ID,
                internal_location_id=LOCATION_ID,
            )

        return result, supabase

    def _assert_rollback_ok(self, result, supabase, expected_create_type):
        self.assertIn(result["status"], ("rolled_back", "rolled_back_partial"))
        self.assertIsNotNone(result["restored_record_id"])

        merge_row = supabase.tables["merges"][0]
        self.assertIn(merge_row["status"], ("rolled_back", "rolled_back_partial"))

        client = FakeGHLClient.instances[0]
        self.assertTrue(
            any(c[0] == expected_create_type for c in client.created),
            f"Expected create_{expected_create_type}() call",
        )

    async def test_rollback_contact_merge(self):
        master = {"id": "ca", "firstName": "Alice", "email": "a@x.com"}
        dup = {"id": "cb", "firstName": "Alicia", "email": "a@x.com"}
        result, supabase = await self._run_rollback("contacts", master, dup, "contact")
        self._assert_rollback_ok(result, supabase, "contact")

    async def test_rollback_company_merge(self):
        master = {"id": "coa", "name": "Acme Corp", "email": "info@acme.com"}
        dup = {"id": "cob", "name": "Acme Corporation", "email": "info@acme.com"}
        result, supabase = await self._run_rollback("companies", master, dup, "company")
        self._assert_rollback_ok(result, supabase, "company")

    async def test_rollback_opportunity_merge(self):
        master = {"id": "oa", "name": "Deal A", "monetaryValue": 1000}
        dup = {"id": "ob", "name": "Deal A Copy", "monetaryValue": 500}
        result, supabase = await self._run_rollback("opportunities", master, dup, "opp")
        self._assert_rollback_ok(result, supabase, "opportunity")

    async def test_rollback_custom_object_merge(self):
        master = {"id": "xa", "_raw": {"properties": {"vin": "ABC", "make": "Toyota"}}}
        dup = {"id": "xb", "_raw": {"properties": {"vin": "ABC", "make": "Honda"}}}
        result, supabase = await self._run_rollback(
            "custom_objects.vehicles", master, dup, "custom",
        )
        self._assert_rollback_ok(result, supabase, "custom_object")

    # ══════════════════════════════════════════════════════════════════════════
    # 6. End-to-End Merge → Rollback (4 tests)
    # ══════════════════════════════════════════════════════════════════════════

    async def _run_merge_then_rollback(
        self, source_object, record_a, record_b,
        ghl_setup, field_selections, expected_ghl_type,
    ):
        """Execute a real merge, then rollback using the snapshots it created."""
        supabase = self._seed_merge_tables(source_object, record_a, record_b)
        ghl_setup()

        modules = _make_merge_modules(supabase, FakeGHLClient)

        with temporary_modules(modules):
            mod = load_source_module(f"e2e_{source_object}", MERGE_SERVICE_PATH)

            # Step 1: Execute merge
            merge_result = await mod.execute_merge(
                match_id="pair-1",
                master_record_id=record_a["id"],
                field_selections=field_selections,
                access_token="token",
                ghl_location_id=GHL_LOCATION_ID,
                tenant_id=TENANT_ID,
                internal_location_id=LOCATION_ID,
                plan="pro",
            )

            # Verify merge completed
            self._assert_merge_completed(
                merge_result, supabase, expected_ghl_type,
                record_a["id"], record_b["id"],
            )

            # Step 2: Reset GHL client instances so rollback gets a fresh one
            FakeGHLClient.instances = []

            # Step 3: Rollback using the merge ID created by execute_merge
            merge_id = supabase.tables["merges"][0]["id"]
            rollback_result = await mod.rollback_merge(
                merge_id=merge_id,
                access_token="token",
                ghl_location_id=GHL_LOCATION_ID,
                internal_location_id=LOCATION_ID,
            )

        return merge_result, rollback_result, supabase

    def _assert_e2e_rollback(self, rollback_result, supabase, expected_create_type):
        """Assert rollback succeeded using real snapshot data from the merge."""
        self.assertIn(
            rollback_result["status"], ("rolled_back", "rolled_back_partial"),
        )
        self.assertIsNotNone(rollback_result["restored_record_id"])

        merge_row = supabase.tables["merges"][0]
        self.assertIn(merge_row["status"], ("rolled_back", "rolled_back_partial"))
        self.assertIsNotNone(merge_row.get("restored_record_id"))

        # GHL create was called to restore the duplicate
        client = FakeGHLClient.instances[0]
        self.assertTrue(
            any(c[0] == expected_create_type for c in client.created),
            f"Expected create_{expected_create_type}() call",
        )

        # Match pair status reverted from "merged" to "pending"
        pair = supabase.tables["match_pairs"][0]
        self.assertEqual(pair["status"], "pending")

    async def test_merge_then_rollback_contact(self):
        a = {"id": "ca", "firstName": "Alice", "lastName": "Smith", "email": "a@x.com"}
        b = {"id": "cb", "firstName": "Alicia", "lastName": "Smith", "email": "a@x.com"}

        def setup():
            FakeGHLClient._contacts = {r["id"]: r for r in (a, b)}

        _, rollback, supabase = await self._run_merge_then_rollback(
            "contacts", a, b, setup,
            {"firstName": "a", "lastName": "a", "email": "a"}, "contact",
        )
        self._assert_e2e_rollback(rollback, supabase, "contact")

    async def test_merge_then_rollback_company(self):
        a = {"id": "coa", "name": "Acme Corp", "email": "info@acme.com",
             "customFields": [{"key": "secondary_website", "valueString": "https://old.acme.com"}]}
        b = {"id": "cob", "name": "Acme Corporation", "email": "info@acme.com",
             "customFields": [{"key": "secondary_website", "valueString": "https://copy.acme.com"}]}

        def setup():
            FakeGHLClient._companies = {r["id"]: r for r in (a, b)}

        _, rollback, supabase = await self._run_merge_then_rollback(
            "companies", a, b, setup,
            {"name": "a", "email": "a"}, "company",
        )
        self._assert_e2e_rollback(rollback, supabase, "company")

        # Verify custom fields were restored via Objects API (not business API)
        client = FakeGHLClient.instances[0]
        co_updates = [u for u in client.updated if u[0] == "custom_object" and u[1] != "coa"]
        self.assertTrue(
            any("secondary_website" in (u[2] or {}) for u in co_updates),
            "Expected update_custom_object_record() to restore custom fields on duplicate company",
        )
        master_cf_updates = [u for u in client.updated if u[0] == "custom_object" and u[1] == "coa"]
        self.assertTrue(
            any("secondary_website" in (u[2] or {}) for u in master_cf_updates),
            "Expected update_custom_object_record() to restore custom fields on master company",
        )

    async def test_merge_then_rollback_opportunity(self):
        a = {"id": "oa", "name": "Deal A", "monetaryValue": 1000, "status": "open"}
        b = {"id": "ob", "name": "Deal A Copy", "monetaryValue": 500, "status": "open"}

        def setup():
            FakeGHLClient._opportunities = {r["id"]: r for r in (a, b)}

        _, rollback, supabase = await self._run_merge_then_rollback(
            "opportunities", a, b, setup,
            {"name": "a", "monetaryValue": "a", "status": "a"}, "opportunity",
        )
        self._assert_e2e_rollback(rollback, supabase, "opportunity")

    async def test_merge_then_rollback_custom_object(self):
        # GHL API shape: properties nested
        a_ghl = {"id": "xa", "properties": {"vin": "ABC", "make": "Toyota"},
                 "createdAt": "2024-01-01", "updatedAt": "2024-01-02"}
        b_ghl = {"id": "xb", "properties": {"vin": "ABC", "make": "Honda"},
                 "createdAt": "2024-01-01", "updatedAt": "2024-01-01"}

        # match_pair data uses normalized (flattened) form
        a_norm = {"id": "xa", "vin": "ABC", "make": "Toyota",
                  "dateAdded": "2024-01-01", "dateUpdated": "2024-01-02", "_raw": a_ghl}
        b_norm = {"id": "xb", "vin": "ABC", "make": "Honda",
                  "dateAdded": "2024-01-01", "dateUpdated": "2024-01-01", "_raw": b_ghl}

        def setup():
            FakeGHLClient._custom_records = {"xa": a_ghl, "xb": b_ghl}
            FakeGHLClient._schemas = {
                "custom_objects.vehicles": {"primaryDisplayProperty": ""},
            }

        _, rollback, supabase = await self._run_merge_then_rollback(
            "custom_objects.vehicles", a_norm, b_norm, setup,
            {"vin": "a", "make": "a"}, "custom_object",
        )
        self._assert_e2e_rollback(rollback, supabase, "custom_object")

        # Verify schema key was passed to create_custom_object_record
        client = FakeGHLClient.instances[0]
        self.assertTrue(
            any(c[0] == "custom_object" for c in client.created),
            "Expected create_custom_object_record() call",
        )


if __name__ == "__main__":
    unittest.main()
