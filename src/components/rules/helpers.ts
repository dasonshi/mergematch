/**
 * Shared helper functions for rule-related components.
 * Extracted from MatchRuleDetail, PendingMatches, AllPendingMatches.
 */

/**
 * Get field value from record, handling nested custom fields.
 */
export function getFieldValue(record: Record<string, unknown>, field: string): string {
  if (field.startsWith("customField.")) {
    const customKey = field.replace("customField.", "");
    const customFields = record.customFields || record.customField || {};
    return customFields[customKey] || record[customKey] || "";
  }
  return record[field] || "";
}

/**
 * Get the record's display name (first + last name, or fallback).
 * For custom objects without standard name fields, uses match fields.
 */
export function getRecordName(
  record: Record<string, unknown>,
  matchFields?: Array<{ field: string; algorithm: string }>
): string {
  // Try standard contact fields first
  if (record.firstName && record.lastName) {
    return `${record.firstName} ${record.lastName}`;
  }
  if (record.firstName) return String(record.firstName);
  if (record.name) return String(record.name);
  if (record.email) return String(record.email);

  // For custom objects: use first match field value as the title
  if (matchFields && matchFields.length > 0) {
    const firstValue = getFieldValue(record, matchFields[0].field);
    if (firstValue) return String(firstValue);
  }

  return "—";
}

/**
 * Get match field values as subheading (up to 3 fields).
 */
export function getMatchFieldSubheading(
  record: Record<string, unknown>,
  matchFields: Array<{ field: string; algorithm: string }>
): string {
  const fields = matchFields.slice(0, 3);
  const values = fields
    .map((f) => getFieldValue(record, f.field))
    .filter((v) => v);

  if (values.length === 0) {
    return record.email || record.phone || "";
  }

  return values.join(" • ");
}

/**
 * Get FIRST match field value only (for clickable subheading links).
 */
export function getFirstMatchFieldValue(
  record: Record<string, unknown>,
  matchFields: Array<{ field: string; algorithm: string }>
): string {
  if (!matchFields || matchFields.length === 0) {
    return record.email || record.phone || "";
  }
  const firstField = matchFields[0];
  const value = getFieldValue(record, firstField.field);
  return value || record.email || record.phone || "";
}
