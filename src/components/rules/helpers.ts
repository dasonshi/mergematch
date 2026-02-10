/**
 * Shared helper functions for rule-related components.
 * Extracted from MatchRuleDetail, PendingMatches, AllPendingMatches.
 */

export function formatFieldLabel(field: string): string {
  if (!field) return "";

  const withoutCustomPrefix = field.replace(/^customField\./, "");
  const dottedParts = withoutCustomPrefix.split(".");
  const leaf = dottedParts[dottedParts.length - 1] || withoutCustomPrefix;
  const words = leaf
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return withoutCustomPrefix;
  if (words.length === 1 && words[0].length <= 4) return words[0].toUpperCase();

  return words
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export interface MatchFieldDisplayItem {
  field: string;
  label: string;
  value: string;
}

const DISPLAY_OBJECT_KEYS = [
  "displayName",
  "display_name",
  "name",
  "label",
  "title",
  "text",
  "value",
  "amount",
  "email",
  "phone",
  "url",
  "id",
] as const;

const CURRENCY_OBJECT_KEYS = [
  "currency",
  "currencyCode",
  "currency_code",
  "symbol",
  "currencySymbol",
] as const;

export function normalizeDisplayValue(
  value: unknown,
  depth = 0,
  seen: WeakSet<object> = new WeakSet()
): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    if (depth > 2) return "";
    return value
      .map((item) => normalizeDisplayValue(item, depth + 1, seen))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    if (depth > 2) return "";
    if (seen.has(value as object)) return "";
    seen.add(value as object);

    const objectValue = value as Record<string, unknown>;

    const amountRaw = objectValue.amount ?? objectValue.value;
    const currencyRaw = CURRENCY_OBJECT_KEYS.map((key) => objectValue[key]).find((candidate) => candidate !== undefined && candidate !== null);
    const amountText = normalizeDisplayValue(amountRaw, depth + 1, seen);
    const currencyText = normalizeDisplayValue(currencyRaw, depth + 1, seen);
    if (amountText && currencyText) {
      return `${amountText} ${currencyText}`;
    }

    for (const key of DISPLAY_OBJECT_KEYS) {
      const text = normalizeDisplayValue(objectValue[key], depth + 1, seen);
      if (text) return text;
    }

    const summarizedEntries = Object.entries(objectValue)
      .map(([key, raw]) => [key, normalizeDisplayValue(raw, depth + 1, seen)] as const)
      .filter(([, text]) => text);

    if (summarizedEntries.length === 1) {
      return summarizedEntries[0][1];
    }

    if (summarizedEntries.length > 1) {
      return summarizedEntries
        .slice(0, 2)
        .map(([key, text]) => `${key}: ${text}`)
        .join(", ");
    }
  }

  return "";
}

function getNestedValue(record: Record<string, unknown>, fieldPath: string): unknown {
  const keys = fieldPath.split(".");
  let current: unknown = record;

  for (const key of keys) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function getCustomFieldValue(record: Record<string, unknown>, field: string): unknown {
  const customFields = record.customFields ?? record.customField;
  if (!customFields) return undefined;

  if (Array.isArray(customFields)) {
    for (const item of customFields) {
      if (!item || typeof item !== "object") continue;

      const customField = item as Record<string, unknown>;
      const identifier = customField.id ?? customField.key ?? customField.fieldKey;
      if (typeof identifier !== "string") continue;

      const normalizedIdentifier = identifier.replace(/^customField\./, "");
      if (
        normalizedIdentifier !== field &&
        !normalizedIdentifier.endsWith(`.${field}`)
      ) {
        continue;
      }

      if ("value" in customField) return customField.value;
      if ("fieldValue" in customField) return customField.fieldValue;
      if ("field_value" in customField) return customField.field_value;
    }

    return undefined;
  }

  if (typeof customFields === "object") {
    const customFieldMap = customFields as Record<string, unknown>;
    if (field in customFieldMap) return customFieldMap[field];

    const fullyQualifiedKey = Object.keys(customFieldMap).find((key) => key.endsWith(`.${field}`));
    if (fullyQualifiedKey) return customFieldMap[fullyQualifiedKey];
  }

  return undefined;
}

/**
 * Get field value from record, handling nested custom fields.
 */
export function getFieldValue(record: Record<string, unknown>, field: string): string {
  if (!record || !field) return "";

  const candidates: unknown[] = [];

  if (field.startsWith("customField.")) {
    const customKey = field.replace("customField.", "");
    candidates.push(getCustomFieldValue(record, customKey));
    candidates.push(record[customKey]);
    candidates.push(getNestedValue(record, customKey));
  } else {
    candidates.push(record[field]);
    candidates.push(getCustomFieldValue(record, field));
    if (field.includes(".")) {
      candidates.push(getNestedValue(record, field));
    }
  }

  for (const candidate of candidates) {
    const text = normalizeDisplayValue(candidate);
    if (text) return text;
  }

  return "";
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
  if (displayField) {
    const displayValue = getFieldValue(record, displayField);
    if (displayValue) return displayValue;
  }

  // Try standard contact fields
  const firstName = getFieldValue(record, "firstName");
  const lastName = getFieldValue(record, "lastName");
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;

  // Try common display/identifier fields for custom objects
  for (const key of ["name", "title", "label", "displayName"]) {
    const value = getFieldValue(record, key);
    if (value) return value;
  }

  // Try email for contacts
  const email = getFieldValue(record, "email");
  if (email) return email;

  // For custom objects without standard name fields: use first match field as title
  if (matchFields && matchFields.length > 0) {
    const firstValue = getFieldValue(record, matchFields[0].field);
    if (firstValue) return firstValue;
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
  return getMatchFieldDisplayItems(record, matchFields)
    .map((item) => item.value)
    .join(" • ");
}

/**
 * Get match field values paired with labels (up to 3 fields), for UI tooltips.
 */
export function getMatchFieldDisplayItems(
  record: Record<string, unknown>,
  matchFields: Array<{ field: string; algorithm: string }>
): MatchFieldDisplayItem[] {
  const fields = matchFields.slice(0, 3);
  const items = fields
    .map((field) => {
      const value = getFieldValue(record, field.field);
      if (!value) return null;

      return {
        field: field.field,
        label: formatFieldLabel(field.field),
        value,
      };
    })
    .filter((item): item is MatchFieldDisplayItem => Boolean(item));

  if (items.length > 0) return items;

  const email = getFieldValue(record, "email");
  if (email) return [{ field: "email", label: "Email", value: email }];

  const phone = getFieldValue(record, "phone");
  if (phone) return [{ field: "phone", label: "Phone", value: phone }];

  return [];
}

/**
 * Get FIRST match field value only (for clickable subheading links).
 */
export function getFirstMatchFieldValue(
  record: Record<string, unknown>,
  matchFields: Array<{ field: string; algorithm: string }>
): string {
  if (!matchFields || matchFields.length === 0) {
    return getFieldValue(record, "email") || getFieldValue(record, "phone") || "";
  }
  const firstField = matchFields[0];
  const value = getFieldValue(record, firstField.field);
  return value || getFieldValue(record, "email") || getFieldValue(record, "phone") || "";
}

/**
 * Search a record's fields to see if any value contains the search query.
 * Uses match fields if provided, otherwise searches common fields and all string values.
 */
export function recordMatchesSearch(
  record: Record<string, unknown>,
  query: string,
  matchFields?: Array<{ field: string; algorithm: string }>
): boolean {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();

  // If we have match fields, search those first
  if (matchFields && matchFields.length > 0) {
    for (const mf of matchFields) {
      const value = getFieldValue(record, mf.field);
      if (value && String(value).toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }
  }

  // Also search common display fields
  const commonFields = ["firstName", "lastName", "email", "phone", "name", "title", "companyName"];
  for (const field of commonFields) {
    const value = getFieldValue(record, field);
    if (value && value.toLowerCase().includes(lowerQuery)) {
      return true;
    }
  }

  // Fallback: search any top-level displayable values in the record
  for (const value of Object.values(record)) {
    const normalized = normalizeDisplayValue(value).toLowerCase();
    if (normalized.includes(lowerQuery)) {
      return true;
    }
  }

  return false;
}
