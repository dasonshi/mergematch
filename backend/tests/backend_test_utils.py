from __future__ import annotations

import importlib.util
import sys
import types
import uuid
from contextlib import contextmanager
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable


def create_package(name: str) -> types.ModuleType:
    module = types.ModuleType(name)
    module.__path__ = []  # type: ignore[attr-defined]
    return module


@dataclass
class FakeResponse:
    data: Any = None
    count: int | None = None


def _get_field_value(row: dict[str, Any], field: str) -> Any:
    current: Any = row
    for part in field.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(part)
    return current


class FakeQuery:
    def __init__(self, supabase: "FakeSupabase", table_name: str):
        self.supabase = supabase
        self.table_name = table_name
        self.action = "select"
        self._filters: list[Callable[[dict[str, Any]], bool]] = []
        self._insert_payload: Any = None
        self._update_payload: dict[str, Any] | None = None
        self._select_count: str | None = None
        self._single = False
        self._order_field: str | None = None
        self._order_desc = False
        self._range_start: int | None = None
        self._range_end: int | None = None

    def select(self, *_args: Any, count: str | None = None, **_kwargs: Any) -> "FakeQuery":
        self.action = "select"
        self._select_count = count
        return self

    def insert(self, payload: Any) -> "FakeQuery":
        self.action = "insert"
        self._insert_payload = payload
        return self

    def upsert(self, payload: Any, on_conflict: str = "") -> "FakeQuery":
        self.action = "upsert"
        self._insert_payload = payload
        self._on_conflict = [c.strip() for c in on_conflict.split(",") if c.strip()]
        return self

    def update(self, payload: dict[str, Any]) -> "FakeQuery":
        self.action = "update"
        self._update_payload = payload
        return self

    def delete(self) -> "FakeQuery":
        self.action = "delete"
        return self

    def single(self) -> "FakeQuery":
        self._single = True
        return self

    def eq(self, field: str, value: Any) -> "FakeQuery":
        self._filters.append(lambda row: _get_field_value(row, field) == value)
        return self

    def neq(self, field: str, value: Any) -> "FakeQuery":
        self._filters.append(lambda row: _get_field_value(row, field) != value)
        return self

    def gte(self, field: str, value: Any) -> "FakeQuery":
        self._filters.append(lambda row: (_get_field_value(row, field) or 0) >= value)
        return self

    def lt(self, field: str, value: Any) -> "FakeQuery":
        self._filters.append(lambda row: (_get_field_value(row, field) or "") < value)
        return self

    def in_(self, field: str, values: list[Any]) -> "FakeQuery":
        value_set = set(values)
        self._filters.append(lambda row: _get_field_value(row, field) in value_set)
        return self

    def ilike(self, field: str, pattern: str) -> "FakeQuery":
        token = pattern.strip("%").lower()
        self._filters.append(
            lambda row: token in str(_get_field_value(row, field) or "").lower()
        )
        return self

    def or_(self, expression: str) -> "FakeQuery":
        checks: list[Callable[[dict[str, Any]], bool]] = []
        for raw_clause in expression.split(","):
            clause = raw_clause.strip()
            if not clause:
                continue
            parts = clause.split(".", 2)
            if len(parts) != 3:
                continue
            field, operator, raw_value = parts
            if operator == "eq":
                checks.append(
                    lambda row, f=field, v=raw_value: str(_get_field_value(row, f)) == v
                    or _get_field_value(row, f) == v
                )
            elif operator == "neq":
                checks.append(
                    lambda row, f=field, v=raw_value: str(_get_field_value(row, f)) != v
                    and _get_field_value(row, f) != v
                )
        if checks:
            self._filters.append(lambda row: any(check(row) for check in checks))
        return self

    def range(self, start: int, end: int) -> "FakeQuery":
        self._range_start = start
        self._range_end = end
        return self

    def order(self, field: str, desc: bool = False) -> "FakeQuery":
        self._order_field = field
        self._order_desc = desc
        return self

    def execute(self) -> FakeResponse:
        table = self.supabase.tables.setdefault(self.table_name, [])
        matched = [row for row in table if all(check(row) for check in self._filters)]

        if self.action == "select":
            selected = [deepcopy(row) for row in matched]
            if self._order_field:
                selected.sort(
                    key=lambda row: _get_field_value(row, self._order_field),
                    reverse=self._order_desc,
                )
            if self._range_start is not None and self._range_end is not None:
                selected = selected[self._range_start : self._range_end + 1]
            if self._single:
                return FakeResponse(data=selected[0] if selected else None)
            count = len(matched) if self._select_count == "exact" else None
            return FakeResponse(data=selected, count=count)

        if self.action == "insert":
            payload = self._insert_payload
            rows = payload if isinstance(payload, list) else [payload]
            inserted = []
            for row in rows:
                stored = deepcopy(row)
                stored.setdefault("id", str(uuid.uuid4()))
                table.append(stored)
                inserted.append(deepcopy(stored))
            return FakeResponse(data=inserted)

        if self.action == "upsert":
            payload = self._insert_payload
            rows = payload if isinstance(payload, list) else [payload]
            conflict_cols = getattr(self, "_on_conflict", [])
            result_rows = []
            for row in rows:
                existing = None
                if conflict_cols:
                    for tbl_row in table:
                        if all(tbl_row.get(c) == row.get(c) for c in conflict_cols):
                            existing = tbl_row
                            break
                if existing is not None:
                    existing.update(deepcopy(row))
                    result_rows.append(deepcopy(existing))
                else:
                    stored = deepcopy(row)
                    stored.setdefault("id", str(uuid.uuid4()))
                    table.append(stored)
                    result_rows.append(deepcopy(stored))
            return FakeResponse(data=result_rows)

        if self.action == "update":
            update_payload = deepcopy(self._update_payload or {})
            updated = []
            for row in table:
                if all(check(row) for check in self._filters):
                    row.update(deepcopy(update_payload))
                    updated.append(deepcopy(row))
            return FakeResponse(data=updated)

        if self.action == "delete":
            removed = []
            kept = []
            for row in table:
                if all(check(row) for check in self._filters):
                    removed.append(deepcopy(row))
                else:
                    kept.append(row)
            self.supabase.tables[self.table_name] = kept
            return FakeResponse(data=removed)

        return FakeResponse(data=None)


class FakeSupabase:
    def __init__(self, tables: dict[str, list[dict[str, Any]]] | None = None):
        self.tables = {
            name: [deepcopy(row) for row in rows]
            for name, rows in (tables or {}).items()
        }

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self, name)


class _FakeAPIRouter:
    def _decorator(self, *_args: Any, **_kwargs: Any):
        def wrapper(func):
            return func

        return wrapper

    get = post = put = patch = delete = _decorator


class _FakeHTTPException(Exception):
    def __init__(self, status_code: int, detail: Any = None):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"HTTP {status_code}: {detail}")


def make_fastapi_stub() -> types.ModuleType:
    mod = types.ModuleType("fastapi")
    mod.APIRouter = _FakeAPIRouter
    mod.HTTPException = _FakeHTTPException
    mod.Header = lambda default=None, **_kwargs: default
    mod.Query = lambda default=None, **_kwargs: default
    mod.Depends = lambda dep=None: dep

    class Request:  # pragma: no cover - shape stub
        pass

    class BackgroundTasks:  # pragma: no cover - shape stub
        def __init__(self):
            self.tasks = []

        def add_task(self, fn, *args, **kwargs):
            self.tasks.append((fn, args, kwargs))

    mod.Request = Request
    mod.BackgroundTasks = BackgroundTasks
    return mod


@contextmanager
def temporary_modules(modules: dict[str, types.ModuleType]):
    previous: dict[str, types.ModuleType | None] = {}
    try:
        for name, module in modules.items():
            previous[name] = sys.modules.get(name)
            sys.modules[name] = module
        yield
    finally:
        for name, old in previous.items():
            if old is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = old


def load_source_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module at {file_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module
