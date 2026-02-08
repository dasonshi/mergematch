import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build a GHL (GoHighLevel) CRM URL for viewing a record.
 * Returns null for custom objects since they don't have direct URLs.
 *
 * @param locationId - The GHL location ID
 * @param objectType - The object type (contacts, companies, or custom object key)
 * @param recordId - The record ID
 * @returns URL string or null if no URL is available
 */
export function getGhlRecordUrl(
  locationId: string,
  objectType: string,
  recordId: string
): string | null {
  if (!locationId || !recordId) return null;

  const baseUrl = "https://app.gohighlevel.com/v2/location";

  if (objectType === "contacts") {
    return `${baseUrl}/${locationId}/contacts/detail/${recordId}`;
  }

  if (objectType === "companies") {
    return `${baseUrl}/${locationId}/companies/detail/${recordId}`;
  }

  // Custom objects don't have direct CRM URLs (yet)
  // Return null so the UI can handle this gracefully
  return null;
}
