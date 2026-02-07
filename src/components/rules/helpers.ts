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
 * For custom objects, uses the schema's displayField if provided,
 * otherwise falls back to common display fields or match fields.
 *
 * @param record - The record data
 * @param matchFields - Optional match fields for fallback
 * @param displayField - Optional primary display field from object schema (e.g., "pet_name")
 */
export function getRecordName(
  record: Record<string, unknown>,
  matchFields?: Array<{ field: string; algorithm: string }>,
  displayField?: string
): string {
  // If schema specifies a display field, try that first
  if (displayField && record[displayField]) {
    return String(record[displayField]);
  }

  // Try standard contact fields
  if (record.firstName && record.lastName) {
    return `${record.firstName} ${record.lastName}`;
  }
  if (record.firstName) return String(record.firstName);

  // Try common display/identifier fields for custom objects
  if (record.name) return String(record.name);
  if (record.title) return String(record.title);
  if (record.label) return String(record.label);
  if (record.displayName) return String(record.displayName);

  // Try email for contacts
  if (record.email) return String(record.email);

  // For custom objects without standard name fields: use first match field as title
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
