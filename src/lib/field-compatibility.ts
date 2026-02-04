/**
 * GHL Custom Field Type Compatibility Matrix
 * Determines which source field types can be stored in which target custom field types
 *
 * Used by:
 * - MatchRuleForm.tsx (Step 3 - field preservation mappings)
 * - MatchReview.tsx (per-merge field preservation configuration)
 * - Settings.tsx (global field preservation defaults)
 */

// Target types that can accept text values
export const TEXT_ACCEPTING_TYPES = new Set([
  'TEXT',
  'LARGE_TEXT',
  'TEXTAREA',
]);

// Target types that require specific formats (not compatible with arbitrary text)
export const INCOMPATIBLE_TARGET_TYPES = new Set([
  'NUMERICAL',
  'NUMBER',
  'MONETARY',
  'CHECKBOX',
  'FILE_UPLOAD',
  'SIGNATURE',
  'DROPDOWN',
  'SINGLE_OPTIONS',
  'MULTIPLE_OPTIONS',
  'CHECKBOX_LIST',
  'RADIO',
  'TEXTBOX_LIST',
  'EMAIL',
  'PHONE',
  'URL',
  'DATE',
]);

/**
 * Check if a source field type can be stored in a target custom field type
 */
export function isTypeCompatible(sourceType: string, targetType: string): boolean {
  const normalizedTarget = targetType?.toUpperCase() || 'TEXT';
  const normalizedSource = sourceType?.toUpperCase() || 'TEXT';

  // Same type is always compatible (email→email, phone→phone, date→date)
  if (normalizedSource === normalizedTarget) {
    return true;
  }

  // If target is explicitly incompatible, block it (unless same type, handled above)
  if (INCOMPATIBLE_TARGET_TYPES.has(normalizedTarget)) {
    return false;
  }

  // TEXT sources can go to text-accepting types
  if (normalizedSource === 'TEXT') {
    return TEXT_ACCEPTING_TYPES.has(normalizedTarget);
  }

  // Specialized types (EMAIL, PHONE, URL, DATE) can only map to same type or text
  if (['EMAIL', 'PHONE', 'URL', 'DATE'].includes(normalizedSource)) {
    return TEXT_ACCEPTING_TYPES.has(normalizedTarget);
  }

  // Unknown source types - be permissive with text targets
  return TEXT_ACCEPTING_TYPES.has(normalizedTarget);
}

/**
 * Get human-readable reason why a type is incompatible
 */
export function getIncompatibilityReason(targetType: string): string {
  const normalized = targetType?.toUpperCase() || '';

  if (['NUMERICAL', 'NUMBER', 'MONETARY'].includes(normalized)) {
    return 'requires numeric value';
  }
  if (normalized === 'CHECKBOX') {
    return 'requires true/false';
  }
  if (normalized === 'FILE_UPLOAD') {
    return 'requires file upload';
  }
  if (normalized === 'SIGNATURE') {
    return 'requires signature';
  }
  if (['DROPDOWN', 'SINGLE_OPTIONS', 'RADIO'].includes(normalized)) {
    return 'requires predefined option';
  }
  if (['MULTIPLE_OPTIONS', 'CHECKBOX_LIST'].includes(normalized)) {
    return 'requires predefined options';
  }
  if (normalized === 'TEXTBOX_LIST') {
    return 'requires list format';
  }
  if (normalized === 'EMAIL') {
    return 'requires email address';
  }
  if (normalized === 'PHONE') {
    return 'requires phone number';
  }
  if (normalized === 'URL') {
    return 'requires URL';
  }
  if (normalized === 'DATE') {
    return 'requires date value';
  }
  return 'incompatible type';
}
