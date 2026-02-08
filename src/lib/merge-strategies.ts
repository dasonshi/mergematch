/**
 * Shared merge strategy utilities.
 *
 * Used by MatchReview, PendingMatches, and MatchRuleDetail to apply
 * strategy-aware field selections and master record choice.
 *
 * Works with any object type (contacts, companies, custom objects).
 * When fields are not provided, defaults to common contact fields.
 * For custom objects, callers should pass the match fields from the rule.
 */

type RecordData = Record<string, unknown>;

// Default fields for contacts when no specific fields are provided
const DEFAULT_CONTACT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "tags",
  "address1",
  "city",
  "state",
  "postalCode",
] as const;

/** Count non-blank fields on a record. */
function countNonBlank(record: RecordData, fields: readonly string[]): number {
  let count = 0;
  for (const f of fields) {
    const v = record[f];
    if (v !== undefined && v !== null && v !== "") {
      if (Array.isArray(v) && v.length === 0) continue;
      count++;
    }
  }
  return count;
}

/** Parse an ISO date string to a timestamp (ms). Returns 0 on failure. */
function parseDate(value: unknown): number {
  if (!value) return 0;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export type StrategyId = "standard" | "recent" | "oldest" | "manual";

interface StrategySelectionOpts {
  strategy: StrategyId;
  recordA: RecordData;
  recordB: RecordData;
  fields?: readonly string[];
  overwriteBlanks?: boolean;
}

/**
 * Compute per-field selections based on the merge strategy.
 *
 * Returns `Record<string, "a" | "b">`.
 * For "manual" strategy returns `{}` (no pre-selection).
 */
export function computeStrategySelections(
  opts: StrategySelectionOpts,
): Record<string, "a" | "b"> {
  const { strategy, recordA, recordB, overwriteBlanks = false } = opts;
  const fields = opts.fields ?? DEFAULT_CONTACT_FIELDS;

  if (strategy === "manual") {
    return {};
  }

  // Determine the "winner" record for the strategy
  let winnerIsA = true; // default tie-break: A wins

  if (strategy === "standard") {
    const countA = countNonBlank(recordA, fields);
    const countB = countNonBlank(recordB, fields);
    winnerIsA = countA >= countB; // tie -> A
  } else if (strategy === "recent") {
    const dateA = parseDate(recordA.dateUpdated);
    const dateB = parseDate(recordB.dateUpdated);
    winnerIsA = dateA >= dateB; // tie -> A
  } else if (strategy === "oldest") {
    const dateA = parseDate(recordA.dateAdded);
    const dateB = parseDate(recordB.dateAdded);
    winnerIsA = dateA <= dateB; // tie -> A (older wins)
  }

  const winner: "a" | "b" = winnerIsA ? "a" : "b";
  const loser: "a" | "b" = winnerIsA ? "b" : "a";
  const winnerRecord = winnerIsA ? recordA : recordB;
  const loserRecord = winnerIsA ? recordB : recordA;

  const selections: Record<string, "a" | "b"> = {};

  for (const field of fields) {
    const winnerVal = winnerRecord[field];
    const loserVal = loserRecord[field];

    const winnerBlank =
      winnerVal === undefined ||
      winnerVal === null ||
      winnerVal === "" ||
      (Array.isArray(winnerVal) && winnerVal.length === 0);

    const loserBlank =
      loserVal === undefined ||
      loserVal === null ||
      loserVal === "" ||
      (Array.isArray(loserVal) && loserVal.length === 0);

    if (winnerBlank && !loserBlank && !overwriteBlanks) {
      // Fallback: winner is blank, loser has a value -> use loser's value
      selections[field] = loser;
    } else {
      selections[field] = winner;
    }
  }

  return selections;
}

/**
 * Compute the ID of the record that should be kept (the master).
 * Uses the same winner logic as computeStrategySelections.
 */
export function computeMasterId(
  strategy: StrategyId,
  recordA: RecordData,
  recordB: RecordData,
  fields: readonly string[] | undefined,
  recordAId: string,
  recordBId: string,
): string {
  const resolvedFields = fields ?? DEFAULT_CONTACT_FIELDS;

  if (strategy === "manual" || strategy === "standard") {
    // standard: more complete record is master
    const countA = countNonBlank(recordA, resolvedFields);
    const countB = countNonBlank(recordB, resolvedFields);
    return countA >= countB ? recordAId : recordBId;
  }

  if (strategy === "recent") {
    const dateA = parseDate(recordA.dateUpdated);
    const dateB = parseDate(recordB.dateUpdated);
    return dateA >= dateB ? recordAId : recordBId;
  }

  if (strategy === "oldest") {
    const dateA = parseDate(recordA.dateAdded);
    const dateB = parseDate(recordB.dateAdded);
    return dateA <= dateB ? recordAId : recordBId;
  }

  return recordAId; // fallback
}
