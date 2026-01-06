import { vi } from 'vitest'
import type { MatchRule, MatchPair, Merge, Contact, Company } from '@/lib/api'

/**
 * Mock API client with all methods
 * Import this in tests and configure return values as needed
 */
export const mockApi = {
  // Token management
  setTokens: vi.fn(),
  getAccessToken: vi.fn(() => 'mock-access-token'),
  getRefreshToken: vi.fn(() => 'mock-refresh-token'),
  clearTokens: vi.fn(),
  hasTokens: vi.fn(() => true),
  setLocationId: vi.fn(),
  getLocationId: vi.fn(() => 'mock-location-id'),
  setOnUnauthorized: vi.fn(),

  // Contacts
  getContacts: vi.fn(),
  getContactsStats: vi.fn(),
  getContact: vi.fn(),

  // Companies
  getCompanies: vi.fn(),

  // Match Rules
  getMatchRules: vi.fn(),
  getMatchRule: vi.fn(),
  createMatchRule: vi.fn(),
  updateMatchRule: vi.fn(),
  deleteMatchRule: vi.fn(),
  scanRule: vi.fn(),
  toggleRuleStatus: vi.fn(),

  // Matches
  getMatches: vi.fn(),
  getMatch: vi.fn(),
  approveMatch: vi.fn(),
  rejectMatch: vi.fn(),

  // Merges
  getMerges: vi.fn(),
  getMerge: vi.fn(),
  executeMerge: vi.fn(),
  rollbackMerge: vi.fn(),

  // Auth
  checkAuth: vi.fn(),
  logout: vi.fn(),

  // Generic fetch
  fetch: vi.fn(),
}

/**
 * Reset all mock functions
 */
export function resetApiMocks() {
  Object.values(mockApi).forEach(fn => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      fn.mockReset()
    }
  })
}

/**
 * Setup default successful responses
 */
export function setupDefaultMocks() {
  mockApi.getContactsStats.mockResolvedValue({ total: 150 })
  mockApi.getCompanies.mockResolvedValue({ companies: [], total: 0 })
  mockApi.getMatchRules.mockResolvedValue({ data: [], total: 0 })
  mockApi.getMatches.mockResolvedValue({ data: [], total: 0 })
  mockApi.getMerges.mockResolvedValue({ data: [], total: 0 })
  mockApi.checkAuth.mockResolvedValue({
    location_id: 'mock-location-id',
    location_name: 'Test Location',
    tenant_id: 'mock-tenant-id',
    authenticated: true,
    plan: 'free',
    billing_status: 'active',
  })
}

// Auto-mock the api module
vi.mock('@/lib/api', () => ({
  api: mockApi,
}))
