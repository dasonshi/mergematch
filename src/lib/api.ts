const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private locationId: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  setLocationId(id: string) {
    this.locationId = id;
    localStorage.setItem('location_id', id);
  }

  getLocationId(): string | null {
    if (!this.locationId) {
      this.locationId = localStorage.getItem('location_id');
    }
    return this.locationId;
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  async fetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const locationId = this.getLocationId();

    // Add location_id to query params
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (locationId) {
      url.searchParams.set('location_id', locationId);
    }

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));

      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }

      throw new Error(error.detail || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Contacts
  async getContacts(limit = 100, query?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (query) params.set('query', query);
    return this.fetch<{ contacts: Contact[]; meta: any }>(`/v1/contacts/?${params}`);
  }

  async getContact(id: string) {
    return this.fetch<Contact>(`/v1/contacts/${id}`);
  }

  // Companies
  async getCompanies(limit = 100) {
    return this.fetch<{ companies: Company[]; total: number }>(`/v1/companies/?limit=${limit}`);
  }

  // Match Rules
  async getMatchRules() {
    return this.fetch<{ data: MatchRule[]; total: number }>('/v1/rules/');
  }

  async getMatchRule(id: string) {
    return this.fetch<MatchRule>(`/v1/rules/${id}`);
  }

  async createMatchRule(rule: Partial<MatchRule>) {
    return this.fetch<MatchRule>('/v1/rules/', { method: 'POST', body: rule });
  }

  async updateMatchRule(id: string, rule: Partial<MatchRule>) {
    return this.fetch<MatchRule>(`/v1/rules/${id}`, { method: 'PUT', body: rule });
  }

  async deleteMatchRule(id: string) {
    return this.fetch<{ deleted: boolean }>(`/v1/rules/${id}`, { method: 'DELETE' });
  }

  async scanRule(id: string, limit = 100) {
    return this.fetch<{ matches_found: number; records_scanned: number; matches_stored: number }>(`/v1/rules/${id}/scan?limit=${limit}`, { method: 'POST' });
  }

  async toggleRuleStatus(id: string) {
    return this.fetch<{ id: string; is_active: boolean }>(`/v1/rules/${id}/toggle`, { method: 'PATCH' });
  }

  // Matches
  async getMatches(status?: string, ruleId?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (ruleId) params.set('rule_id', ruleId);
    return this.fetch<{ data: MatchPair[]; total: number }>(`/v1/matches/?${params}`);
  }

  async approveMatch(id: string) {
    return this.fetch<MatchPair>(`/v1/matches/${id}/approve`, { method: 'POST' });
  }

  async rejectMatch(id: string, reason?: string) {
    return this.fetch<MatchPair>(`/v1/matches/${id}/reject`, { method: 'POST', body: { reason } });
  }

  // Merges
  async getMerges(limit = 50) {
    return this.fetch<{ data: Merge[]; total: number }>(`/v1/merges/?limit=${limit}`);
  }

  async executeMerge(matchId: string, masterRecordId: string, fieldSelections: Record<string, string>) {
    return this.fetch<Merge>('/v1/merges/', {
      method: 'POST',
      body: { match_id: matchId, master_record_id: masterRecordId, field_selections: fieldSelections },
    });
  }

  async rollbackMerge(id: string) {
    return this.fetch<{ id: string; status: string; restored_record_id?: string }>(`/v1/merges/${id}/rollback`, { method: 'POST' });
  }

  // Auth
  async checkAuth() {
    const locationId = this.getLocationId();
    if (!locationId) return null;
    return this.fetch<{ location_id: string; location_name: string; tenant_id: string; authenticated: boolean; plan: string; billing_status: string }>(`/auth/me`);
  }
}

// Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  tags: string[];
  dateAdded: string;
  dateUpdated: string;
  [key: string]: unknown;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  [key: string]: unknown;
}

export interface MatchRule {
  id: string;
  name: string;
  source_object: string;
  match_fields: MatchField[];
  auto_merge_threshold: number;
  review_threshold: number;
  merge_strategy: string;
  schedule_frequency: string;
  is_active: boolean;
  last_scan_at?: string;
  created_at?: string;
}

export interface MatchField {
  field: string;
  algorithm: string;
  weight: number;
  operator: 'AND' | 'OR';
}

export interface MatchPair {
  id: string;
  record_a_id: string;
  record_a_data: Record<string, unknown>;
  record_b_id: string;
  record_b_data: Record<string, unknown>;
  confidence_score: number;
  field_scores: Record<string, number>;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
}

export interface Merge {
  id: string;
  master_record_id: string;
  master_record_name?: string;
  duplicate_record_id: string;
  status: string;
  created_at: string;
  rule_name?: string;
}

export const api = new ApiClient();
