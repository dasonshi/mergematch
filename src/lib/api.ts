const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private locationId: string | null = null; // Legacy fallback
  private refreshPromise: Promise<void> | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    // Load tokens from localStorage on init
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.locationId = localStorage.getItem('location_id'); // Legacy
  }

  // JWT Token Management
  setTokens(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.locationId = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('location_id');
  }

  hasTokens(): boolean {
    return !!this.accessToken || !!this.locationId;
  }

  // Legacy location ID support (for backward compatibility)
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

  // Token refresh logic
  private async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        this.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async fetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const makeRequest = async (retry = false): Promise<T> => {
      const url = new URL(`${API_BASE_URL}${endpoint}`);

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add JWT Authorization header if we have a token
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      } else if (this.locationId) {
        // Legacy fallback: add location_id as query param
        url.searchParams.set('location_id', this.locationId);
      }

      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle 401 - try token refresh once
      if (response.status === 401 && !retry && this.refreshToken) {
        try {
          await this.refreshTokens();
          return makeRequest(true); // Retry with new token
        } catch {
          // Refresh failed - clear tokens and notify
          this.clearTokens();
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error('Session expired. Please re-authenticate.');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));

        // Handle other 401s
        if (response.status === 401 && this.onUnauthorized) {
          this.onUnauthorized();
        }

        throw new Error(error.detail || `API error: ${response.status}`);
      }

      return response.json();
    };

    return makeRequest();
  }

  // Contacts
  async getContacts(limit = 100, query?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (query) params.set('query', query);
    return this.fetch<{ contacts: Contact[]; meta: any }>(`/v1/contacts/?${params}`);
  }

  async getContactsStats() {
    return this.fetch<{ total: number }>('/v1/contacts/stats');
  }

  async getContact(id: string) {
    return this.fetch<Contact>(`/v1/contacts/${id}`);
  }

  // Companies
  async getCompanies() {
    return this.fetch<{ companies: Company[]; total: number }>(`/v1/companies/`);
  }

  // Fields (for match rule creation)
  async getObjectFields(objectType: string) {
    return this.fetch<ObjectField[]>(`/v1/fields/${objectType}`);
  }

  async getAvailableObjects() {
    return this.fetch<ObjectType[]>('/v1/fields/');
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

  async getMatch(id: string) {
    return this.fetch<MatchPair>(`/v1/matches/${id}`);
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

  async getMerge(id: string) {
    return this.fetch<Merge & { master_snapshot?: Record<string, unknown>; duplicate_snapshot?: Record<string, unknown>; field_selections?: Record<string, string>; rolled_back_at?: string; restored_record_id?: string; ghl_location_id?: string }>(`/v1/merges/${id}`);
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
    if (!this.accessToken && !this.locationId) return null;
    return this.fetch<{
      location_id: string;
      location_name: string;
      tenant_id: string;
      authenticated: boolean;
      plan: string;
      billing_status: string
    }>('/auth/me');
  }

  async logout() {
    try {
      await this.fetch('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  // Notifications
  async getNotifications(limit = 50, offset = 0, unreadOnly = false) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      unread_only: String(unreadOnly),
    });
    return this.fetch<{ data: Notification[]; total: number; unread_count: number }>(`/v1/notifications/?${params}`);
  }

  async getUnreadNotificationCount() {
    return this.fetch<{ count: number }>('/v1/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.fetch<{ success: boolean }>(`/v1/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.fetch<{ success: boolean; marked_count: number }>('/v1/notifications/mark-all-read', { method: 'POST' });
  }

  async createBulkMergeNotification(ruleId: string, ruleName: string, successCount: number, failCount: number) {
    return this.fetch<Notification>('/v1/notifications/', {
      method: 'POST',
      body: {
        rule_id: ruleId,
        rule_name: ruleName,
        success_count: successCount,
        fail_count: failCount,
      },
    });
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

export interface ObjectField {
  id: string;
  name: string;
  fieldKey: string;
  dataType: string;
  isCustom: boolean;
}

export interface ObjectType {
  id: string;
  name: string;
  standard: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  metadata?: {
    rule_id?: string;
    rule_name?: string;
    success_count?: number;
    fail_count?: number;
    total_count?: number;
    [key: string]: unknown;
  };
  read: boolean;
  created_at: string;
}

export const api = new ApiClient();
