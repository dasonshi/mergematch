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
    return this.fetch<{ contacts: Contact[]; meta: { total?: number; startAfterId?: string; startAfter?: number } }>(`/v1/contacts/?${params}`);
  }

  async getContactsStats() {
    return this.fetch<{ total: number }>('/v1/contacts/stats');
  }

  async getObjectStats(objectType: string) {
    return this.fetch<{ total: number }>(`/v1/fields/${objectType}/stats`);
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

  async getObjectAssociations(objectType: string) {
    return this.fetch<ObjectAssociation[]>(`/v1/fields/${objectType}/associations`);
  }

  async getPipelines() {
    return this.fetch<Pipeline[]>('/v1/fields/pipelines');
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

  async scanRule(id: string) {
    return this.fetch<{ matches_found: number; records_scanned: number; matches_stored: number }>(`/v1/rules/${id}/scan`, { method: 'POST' });
  }

  async toggleRuleStatus(id: string) {
    return this.fetch<{ id: string; is_active: boolean }>(`/v1/rules/${id}/toggle`, { method: 'PATCH' });
  }

  async runRuleManually(id: string) {
    return this.fetch<{
      job_id: string;
      status: string;
      matches_found: number;
      records_scanned: number;
      matches_stored: number;
      auto_merged?: number;
    }>(`/v1/rules/${id}/run`, { method: 'POST' });
  }

  // Jobs
  async getJobs(ruleId?: string, status?: string, limit = 20, offset = 0) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (ruleId) params.set('rule_id', ruleId);
    if (status) params.set('status', status);
    return this.fetch<{ data: JobExecution[]; total: number; limit: number; offset: number }>(`/v1/jobs/?${params}`);
  }

  async getJob(id: string) {
    return this.fetch<JobExecution>(`/v1/jobs/${id}`);
  }

  // Matches
  async getMatches(status?: string, ruleId?: string, limit?: number, offset?: number, search?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (ruleId) params.set('rule_id', ruleId);
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    if (search) params.set('search', search);
    return this.fetch<{ data: MatchPair[]; total: number; unique_contacts?: number }>(`/v1/matches/?${params}`);
  }

  async getMatchCounts(status?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    return this.fetch<{ total: number; unique_contacts: number; by_rule: Record<string, number> }>(`/v1/matches/counts?${params}`);
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

  async validateMatches(ruleId: string): Promise<{ valid: string[]; stale: string[] }> {
    return this.fetch<{ valid: string[]; stale: string[] }>(`/v1/matches/validate?rule_id=${ruleId}`, { method: 'POST' });
  }

  async cleanupStaleMatches(matchIds: string[]): Promise<{ cleaned: number }> {
    return this.fetch<{ cleaned: number }>('/v1/matches/cleanup-stale', {
      method: 'POST',
      body: { match_ids: matchIds },
    });
  }

  // Merges
  async getMergeStats() {
    return this.fetch<{ completed: number; failed: number; rolled_back: number; total: number }>('/v1/merges/stats');
  }

  async getDetailedMergeStats(days = 30) {
    return this.fetch<DetailedMergeStats>(`/v1/merges/stats/detailed?days=${days}`);
  }

  async getMergeQuota() {
    return this.fetch<MergeQuota>('/v1/merges/quota');
  }

  async getMerges(limit = 50, status?: string, ruleId?: string, offset = 0, search?: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (status && status !== 'all') params.append('status', status);
    if (ruleId) params.append('rule_id', ruleId);
    if (search) params.append('search', search);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return this.fetch<{ data: Merge[]; total: number }>(`/v1/merges/?${params}`);
  }

  async getMerge(id: string) {
    return this.fetch<Merge & { master_snapshot?: Record<string, unknown>; duplicate_snapshot?: Record<string, unknown>; field_selections?: Record<string, string>; rolled_back_at?: string; restored_record_id?: string; ghl_location_id?: string }>(`/v1/merges/${id}`);
  }

  async executeMerge(
    matchId: string,
    masterRecordId: string,
    fieldSelections: Record<string, string>,
    preserveAlternates = false,
    fieldPreservationMappings?: FieldPreservationMapping[]
  ) {
    return this.fetch<Merge>('/v1/merges/', {
      method: 'POST',
      body: {
        match_id: matchId,
        master_record_id: masterRecordId,
        field_selections: fieldSelections,
        preserve_alternates: preserveAlternates,
        ...(fieldPreservationMappings && { field_preservation_mappings: fieldPreservationMappings }),
      },
    });
  }

  async rollbackMerge(id: string) {
    return this.fetch<{ id: string; status: string; restored_record_id?: string }>(`/v1/merges/${id}/rollback`, { method: 'POST' });
  }

  // Bulk Operations
  async startBulkMerge(matchIds: string[], ruleId?: string) {
    return this.fetch<BulkJobStatus>('/v1/bulk/merge', {
      method: 'POST',
      body: { match_ids: matchIds, rule_id: ruleId },
    });
  }

  async getBulkJobStatus(jobId: string) {
    return this.fetch<BulkJobStatus>(`/v1/bulk/${jobId}/status`);
  }

  async cancelBulkJob(jobId: string) {
    return this.fetch<{ message: string; job_id: string }>(`/v1/bulk/${jobId}/cancel`, { method: 'POST' });
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
      billing_status: string;
      is_on_trial?: boolean;
      trial_ends_at?: string | null;
      upgrade_url?: string | null;
      last_webhook_at?: string | null;
      features?: Record<string, boolean>;
    }>('/auth/me');
  }

  async logout() {
    try {
      await this.fetch('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  // Convenience methods for HTTP verbs
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
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

  // Sync
  async getSyncStatus() {
    return this.fetch<SyncStatus>('/v1/sync/status');
  }

  async triggerSync() {
    return this.fetch<SyncTriggerResponse>('/v1/sync/trigger', { method: 'POST' });
  }

  async forceResync() {
    return this.fetch<ForceResyncResponse>('/v1/sync/force-resync', { method: 'POST' });
  }

  // Settings - Merge Strategy
  async getMergeStrategy() {
    return this.fetch<MergeStrategySettings>('/v1/settings/merge-strategy');
  }

  async updateMergeStrategy(settings: MergeStrategySettings) {
    return this.fetch<MergeStrategySettings>('/v1/settings/merge-strategy', {
      method: 'PUT',
      body: settings,
    });
  }

  async getCustomFields() {
    return this.fetch<CustomField[]>('/v1/settings/custom-fields');
  }

  async createCustomField(name: string, dataType = 'TEXT') {
    return this.fetch<CustomField>('/v1/settings/custom-fields', {
      method: 'POST',
      body: { name, data_type: dataType },
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

export interface RelatedRecordsSettings {
  notes?: "copy_to_master" | "dont_copy";
  tasks?: "copy_to_master" | "dont_copy";
  opportunities?: "keep_all" | "keep_master_only" | "keep_highest_value" | "custom_logic";
  opportunities_custom_logic?: {
    operator: "AND" | "OR";
    conditions: {
      id: string;
      field: string;
      operator: string;
      value: string;
      valueType: "field_reference" | "static";
    }[];
  };
}

export interface RuleMergeSettings {
  overwrite_blanks?: boolean;
  field_preservation?: FieldPreservationSettings;
  related_records?: RelatedRecordsSettings;
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
  schedule_time?: string;  // HH:MM format (e.g., "06:00")
  schedule_day?: string;   // Day of week (0-6) or day of month (1-28)
  is_active: boolean;
  last_scan_at?: string;
  last_merge_at?: string;
  created_at?: string;
  merge_settings?: RuleMergeSettings;
}

export interface MatchField {
  field: string;
  algorithm: string;
  weight: number;
  operator: 'AND' | 'OR';
  match_against?: string;
}

export interface MatchPair {
  id: string;
  rule_id: string;
  record_a_id: string;
  record_a_type?: string;
  record_a_data: Record<string, unknown>;
  record_b_id: string;
  record_b_type?: string;
  record_b_data: Record<string, unknown>;
  confidence_score: number;
  field_scores: Record<string, number>;
  status: 'pending' | 'approved' | 'rejected' | 'merged' | 'stale';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Merge {
  id: string;
  master_record_id: string;
  master_record_name?: string;
  master_record_display_name?: string;
  master_pipeline_id?: string;
  master_record_type?: string;
  duplicate_record_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  rolled_back_at?: string;
  rule_name?: string;
  source_object?: string;
  error_message?: string;
  master_snapshot?: Record<string, unknown>;
  duplicate_snapshot?: Record<string, unknown>;
  field_selections?: Record<string, string>;
  restored_record_id?: string;
}

export interface JobExecution {
  id: string;
  rule_id: string;
  tenant_id?: string;
  location_id?: string;
  trigger_type: 'scheduled' | 'manual';
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  records_scanned: number;
  matches_found: number;
  matches_stored: number;
  auto_merged?: number;
  error_message?: string;
  created_at?: string;
  match_rules?: { name: string };
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
  displayField?: string;  // Primary display property field name for custom objects
}

export interface ObjectAssociation {
  id: string;
  name: string;
  objectKey: string;
  associationId?: string;
  relationshipType?: string;
  canReassign: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  pipelineId: string;
  pipelineName: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
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

export interface SyncStatus {
  can_sync: boolean;
  last_synced_at: string | null;
  cooldown_remaining: number;
}

export interface SyncTriggerResponse {
  success: boolean;
  last_synced_at: string;
}

export interface ForceResyncResponse {
  success: boolean;
  message: string;
  rules_scanned: number;
  total_matches_found: number;
  total_records_scanned: number;
}

export interface FieldPreservationMapping {
  source: string;
  target: string;
}

export interface FieldPreservationSettings {
  enabled: boolean;
  auto_create_fields: boolean;
  mappings: FieldPreservationMapping[];
}

export interface MergeStrategySettings {
  field_preservation: FieldPreservationSettings;
}

export interface CustomField {
  id: string;
  name: string;
  fieldKey: string;
  dataType: string;
}

export interface DetailedMergeStats {
  summary: {
    completed: number;
    failed: number;
    rolled_back: number;
    total: number;
  };
  time_series: Array<{
    date: string;
    completed: number;
    failed: number;
    rolled_back: number;
  }>;
  by_rule: Array<{
    rule_id: string;
    name: string;
    completed: number;
    failed: number;
    rolled_back: number;
  }>;
  success_rate: number;
}

export interface MergeQuota {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export interface BulkJobStatus {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  cancel_requested?: boolean;
  started_at?: string;
  completed_at?: string;
  failed_items?: Array<{ match_id?: string; error?: string }>;
}

export const api = new ApiClient();
