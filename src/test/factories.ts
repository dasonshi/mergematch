import type { MatchRule, MatchPair, Merge, Contact, Company } from '@/lib/api'

/**
 * Factory functions for creating test data
 */

let idCounter = 0

function generateId() {
  return `test-id-${++idCounter}`
}

export function createMockContact(overrides: Partial<Contact> = {}): Contact {
  const id = generateId()
  return {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${id}@example.com`,
    phone: '+1234567890',
    companyName: 'Acme Inc',
    tags: ['customer'],
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockCompany(overrides: Partial<Company> = {}): Company {
  const id = generateId()
  return {
    id,
    name: `Company ${id}`,
    email: `contact@company-${id}.com`,
    phone: '+1234567890',
    website: `https://company-${id}.com`,
    ...overrides,
  }
}

export function createMockMatchRule(overrides: Partial<MatchRule> = {}): MatchRule {
  return {
    id: generateId(),
    name: 'Email Match Rule',
    source_object: 'contacts',
    match_fields: [
      { field: 'email', algorithm: 'exact', weight: 1.0, operator: 'AND' as const },
    ],
    auto_merge_threshold: 0.95,
    review_threshold: 0.70,
    merge_strategy: 'standard',
    schedule_frequency: 'manual',
    is_active: true,
    last_scan_at: undefined,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockMatchPair(overrides: Partial<MatchPair & { rule_id: string }> = {}): MatchPair & { rule_id: string } {
  const contactA = createMockContact({ firstName: 'John', lastName: 'Smith' })
  const contactB = createMockContact({ firstName: 'John', lastName: 'Smith' })

  return {
    id: generateId(),
    record_a_id: contactA.id,
    record_a_data: contactA,
    record_b_id: contactB.id,
    record_b_data: contactB,
    confidence_score: 0.92,
    field_scores: { email: 1.0, firstName: 1.0, lastName: 1.0 },
    status: 'pending',
    rule_id: generateId(),
    ...overrides,
  }
}

export function createMockMerge(overrides: Partial<Merge> = {}): Merge {
  return {
    id: generateId(),
    master_record_id: generateId(),
    master_record_name: 'John Doe',
    duplicate_record_id: generateId(),
    status: 'completed',
    created_at: new Date().toISOString(),
    rule_name: 'Email Match Rule',
    ...overrides,
  }
}

/**
 * Create multiple items
 */
export function createMockContacts(count: number): Contact[] {
  return Array.from({ length: count }, () => createMockContact())
}

export function createMockRules(count: number): MatchRule[] {
  return Array.from({ length: count }, (_, i) =>
    createMockMatchRule({ name: `Rule ${i + 1}` })
  )
}

export function createMockMatches(count: number, ruleId?: string): (MatchPair & { rule_id: string })[] {
  return Array.from({ length: count }, () =>
    createMockMatchPair({ rule_id: ruleId || generateId() })
  )
}

export function createMockMerges(count: number): Merge[] {
  return Array.from({ length: count }, (_, i) =>
    createMockMerge({
      master_record_name: `Contact ${i + 1}`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    })
  )
}

/**
 * Reset ID counter (call in beforeEach)
 */
export function resetFactories() {
  idCounter = 0
}
