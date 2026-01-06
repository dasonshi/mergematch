import { describe, it, expect } from 'vitest'
import { createMockContact, createMockMatchRule, createMockMerge, resetFactories } from './factories'

describe('Test Infrastructure', () => {
  beforeEach(() => {
    resetFactories()
  })

  it('should create mock contacts', () => {
    const contact = createMockContact({ firstName: 'Jane' })
    expect(contact.firstName).toBe('Jane')
    expect(contact.email).toContain('@example.com')
    expect(contact.id).toBeDefined()
  })

  it('should create mock match rules', () => {
    const rule = createMockMatchRule({ name: 'Test Rule' })
    expect(rule.name).toBe('Test Rule')
    expect(rule.match_fields).toHaveLength(1)
    expect(rule.source_object).toBe('contacts')
  })

  it('should create mock merges', () => {
    const merge = createMockMerge({ status: 'rolled_back' })
    expect(merge.status).toBe('rolled_back')
    expect(merge.master_record_id).toBeDefined()
  })
})
