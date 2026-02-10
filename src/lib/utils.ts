import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build a GHL (GoHighLevel) CRM URL for viewing a record.
 *
 * @param locationId - The GHL location ID
 * @param objectType - The object type (contacts, companies, opportunities, or custom object key)
 * @param recordId - The record ID
 * @param options - Optional context for object-specific URLs (e.g. opportunity pipeline)
 * @returns URL string or null if no URL is available
 */
interface GhlRecordUrlOptions {
  pipelineId?: string | null;
}

export function getGhlRecordUrl(
  locationId: string,
  objectType: string,
  recordId: string,
  options?: GhlRecordUrlOptions
): string | null {
  if (!locationId || !recordId) return null;

  const baseUrl = "https://app.gohighlevel.com/v2/location";
  const encodedRecordId = encodeURIComponent(recordId);

  if (objectType === "contacts") {
    return `${baseUrl}/${locationId}/contacts/detail/${encodedRecordId}`;
  }

  if (objectType === "companies" || objectType === "business" || objectType === "businesses") {
    return `${baseUrl}/${locationId}/businesses?recordId=${encodedRecordId}`;
  }

  if (objectType === "opportunities") {
    const pipelineId = options?.pipelineId ? encodeURIComponent(options.pipelineId) : null;
    if (pipelineId) {
      return `${baseUrl}/${locationId}/opportunities/list/${pipelineId}?tab=Opportunity+Details&recordId=${encodedRecordId}`;
    }
    return `${baseUrl}/${locationId}/opportunities/list?recordId=${encodedRecordId}`;
  }

  if (objectType.startsWith("custom_objects.")) {
    const objectKey = objectType.slice("custom_objects.".length);
    if (!objectKey) return null;
    return `${baseUrl}/${locationId}/objects/${encodeURIComponent(objectKey)}/list?recordId=${encodedRecordId}`;
  }

  return null;
}
