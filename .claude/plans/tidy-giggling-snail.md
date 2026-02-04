# Unify Rule Action Buttons (Remove 3-Dot Menu on Dashboard)

## Overview

Replace the 3-dot dropdown menu in the Dashboard's rule list with visible action buttons, matching the pattern already used on the MatchRules page. Extract a shared component for reuse.

---

## Current State

| Page | Pattern |
|------|---------|
| **Index.tsx (Dashboard)** | "Merge All" + 3-dot dropdown (View Details, Edit Rule, Delete Rule) |
| **MatchRules.tsx** | "Merge All" + View, Edit, Delete buttons (all visible) |
| **MatchRuleDetail.tsx** | Merge All, Scan Now, Schedule, Edit, Delete (full set) |

---

## Changes Required

### 1. Create Shared Component

**New File**: `src/components/rule-action-buttons.tsx`

Extract a reusable component that renders the action buttons:

```tsx
interface RuleActionButtonsProps {
  rule: { id: string };
  pendingCount: number;
  onDelete: () => void;
}

export function RuleActionButtons({ rule, pendingCount, onDelete }: RuleActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {pendingCount > 0 && (
        <Button size="sm" asChild>
          <Link to={`/match-rules/${rule.id}?action=merge-all`}>Merge All</Link>
        </Button>
      )}
      <Button variant="outline" size="sm" asChild>
        <Link to={`/match-rules/${rule.id}`}>View</Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link to={`/match-rules/${rule.id}/edit`}>Edit</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

---

### 2. Update Dashboard (Index.tsx)

**File**: `src/pages/Index.tsx`

**Remove imports**:
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`
- `MoreHorizontal`

**Add import**:
```tsx
import { RuleActionButtons } from "@/components/rule-action-buttons";
```

**Replace** lines 404-436 (Actions column) with:
```tsx
{
  header: "Actions",
  align: "right",
  accessor: (rule) => (
    <RuleActionButtons
      rule={rule}
      pendingCount={pendingByRule[rule.id] || 0}
      onDelete={() => setRuleToDelete(rule)}
    />
  ),
},
```

---

### 3. Update MatchRules.tsx

**File**: `src/pages/MatchRules.tsx`

**Add import**:
```tsx
import { RuleActionButtons } from "@/components/rule-action-buttons";
```

**Replace** lines 204-227 (Actions column) with:
```tsx
{
  header: "Actions",
  align: "right",
  accessor: (rule) => (
    <RuleActionButtons
      rule={rule}
      pendingCount={pendingByRule[rule.id] || 0}
      onDelete={() => setRuleToDelete(rule)}
    />
  ),
},
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/rule-action-buttons.tsx` | **NEW** - Shared action buttons component |
| `src/pages/Index.tsx` | Replace dropdown with shared component |
| `src/pages/MatchRules.tsx` | Use shared component (minor refactor) |

---

## Verification

1. **Dashboard** (`/`): Rule list shows View, Edit, Delete buttons (no 3-dot menu)
2. **Match Rules** (`/match-rules`): Same visible button pattern
3. **Button behavior**:
   - "Merge All" appears only when pending > 0
   - "View" navigates to rule detail
   - "Edit" navigates to rule edit form
   - "Delete" opens delete confirmation dialog
4. **Build check**: `npm run build` passes
