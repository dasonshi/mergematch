from datetime import datetime, timezone

import pytest

from app.api.routes import cron

UTC = timezone.utc


def test_should_run_now_handles_offset_aware_last_scan_without_crashing() -> None:
    result = cron.should_run_now(
        schedule_frequency="daily",
        last_scan_at="2026-02-10T12:00:00-05:00",
        schedule_time="12:00",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 11, 18, 0, tzinfo=UTC),
    )

    assert result is True


def test_daily_schedule_catchup_after_missed_hour() -> None:
    # Last successful run covered the prior day slot. Cron is now late past today's slot.
    assert cron.should_run_now(
        schedule_frequency="daily",
        last_scan_at="2026-02-10T06:15:00+00:00",
        schedule_time="06:00",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 11, 9, 0, tzinfo=UTC),
    ) is True

    # Before today's scheduled slot, should not run.
    assert cron.should_run_now(
        schedule_frequency="daily",
        last_scan_at="2026-02-10T06:15:00+00:00",
        schedule_time="06:00",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 11, 5, 59, tzinfo=UTC),
    ) is False


def test_weekly_schedule_catchup_if_cron_missed_exact_hour() -> None:
    # Scheduled for Monday 06:00 (frontend day=1). A 07:00 cron run should still execute.
    assert cron.should_run_now(
        schedule_frequency="weekly",
        last_scan_at="2026-02-02T06:00:00+00:00",
        schedule_time="06:00",
        schedule_day="1",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 9, 7, 0, tzinfo=UTC),
    ) is True


def test_biweekly_schedule_catchup_after_missed_window() -> None:
    # Scheduled biweekly Monday 06:00 (frontend day=1).
    assert cron.should_run_now(
        schedule_frequency="biweekly",
        last_scan_at="2026-01-05T06:00:00+00:00",
        schedule_time="06:00",
        schedule_day="1",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 1, 19, 5, 0, tzinfo=UTC),
    ) is False

    # Missed the Monday slot; Tuesday should catch up.
    assert cron.should_run_now(
        schedule_frequency="biweekly",
        last_scan_at="2026-01-05T06:00:00+00:00",
        schedule_time="06:00",
        schedule_day="1",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 1, 20, 9, 0, tzinfo=UTC),
    ) is True


def test_monthly_schedule_catchup_behavior() -> None:
    # Scheduled monthly on day 15 at 06:00.
    assert cron.should_run_now(
        schedule_frequency="monthly",
        last_scan_at="2026-01-15T06:00:00+00:00",
        schedule_time="06:00",
        schedule_day="15",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 15, 5, 0, tzinfo=UTC),
    ) is False

    # Catch-up after missing the exact window.
    assert cron.should_run_now(
        schedule_frequency="monthly",
        last_scan_at="2026-01-15T06:00:00+00:00",
        schedule_time="06:00",
        schedule_day="15",
        schedule_timezone="UTC",
        now_utc=datetime(2026, 2, 16, 1, 0, tzinfo=UTC),
    ) is True


def test_first_run_enforces_schedule_day_and_time() -> None:
    created_at = "2026-02-02T09:00:00+00:00"  # Monday

    # Weekly schedule: Friday 06:00 (frontend day=5). Thursday should not run.
    assert cron.should_run_now(
        schedule_frequency="weekly",
        last_scan_at=None,
        schedule_time="06:00",
        schedule_day="5",
        schedule_timezone="UTC",
        created_at=created_at,
        now_utc=datetime(2026, 2, 5, 12, 0, tzinfo=UTC),
    ) is False

    # First valid Friday slot should run.
    assert cron.should_run_now(
        schedule_frequency="weekly",
        last_scan_at=None,
        schedule_time="06:00",
        schedule_day="5",
        schedule_timezone="UTC",
        created_at=created_at,
        now_utc=datetime(2026, 2, 6, 7, 0, tzinfo=UTC),
    ) is True


def test_schedule_timezone_is_applied_for_local_hour_evaluation() -> None:
    # Daily at 06:00 America/New_York.
    assert cron.should_run_now(
        schedule_frequency="daily",
        last_scan_at="2026-02-10T11:05:00+00:00",  # 06:05 EST
        schedule_time="06:00",
        schedule_timezone="America/New_York",
        now_utc=datetime(2026, 2, 11, 10, 30, tzinfo=UTC),  # 05:30 EST
    ) is False

    assert cron.should_run_now(
        schedule_frequency="daily",
        last_scan_at="2026-02-10T11:05:00+00:00",
        schedule_time="06:00",
        schedule_timezone="America/New_York",
        now_utc=datetime(2026, 2, 11, 11, 30, tzinfo=UTC),  # 06:30 EST
    ) is True


def test_resolve_schedule_timezone_prefers_rule_then_location_fallback() -> None:
    assert cron._resolve_schedule_timezone(
        {"schedule_timezone": "America/New_York"},
        {"settings": {"timezone": "America/Chicago"}},
    ) == "America/New_York"

    assert cron._resolve_schedule_timezone(
        {"merge_settings": {"schedule_timezone": "Invalid/Zone"}},
        {"settings": {"timezone": "America/Chicago"}},
    ) == "America/Chicago"

    assert cron._resolve_schedule_timezone({}, {"settings": {"timezone": "Invalid/Zone"}}) == "UTC"


class _FakeResult:
    def __init__(self, data):
        self.data = data


class _FakeQuery:
    def __init__(self, data):
        self._data = data

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def gte(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        return _FakeResult(self._data)


class _FakeSupabase:
    def __init__(self, matches):
        self._matches = matches

    def table(self, name):
        assert name == "match_pairs"
        return _FakeQuery(self._matches)


@pytest.mark.asyncio
async def test_auto_merge_path_passes_plan_to_execute_merge(monkeypatch: pytest.MonkeyPatch) -> None:
    captured = {}

    async def fake_execute_merge(**kwargs):
        captured.update(kwargs)
        return {"id": "merge-1"}

    monkeypatch.setattr(
        cron,
        "get_supabase",
        lambda: _FakeSupabase([
            {
                "id": "match-1",
                "record_a_data": {"id": "a"},
                "record_b_data": {"id": "b"},
            }
        ]),
    )
    monkeypatch.setattr(cron, "compute_merge_selections", lambda *args, **kwargs: ("a", {"email": "a"}))
    monkeypatch.setattr(cron, "execute_merge", fake_execute_merge)

    merged_count, failed_count = await cron._auto_merge_high_confidence_matches(
        rule={"id": "rule-1", "auto_merge_threshold": 0.95},
        access_token="token",
        ghl_location_id="ghl-loc",
        tenant_id="tenant-1",
        internal_location_id="loc-1",
        plan="pro",
    )

    assert merged_count == 1
    assert failed_count == 0
    assert captured["plan"] == "pro"
