import { describe, expect, it } from 'vitest'
import {
  formatFieldLabel,
  getFieldValue,
  getMatchFieldDisplayItems,
  getFirstMatchFieldValue,
  getMatchFieldSubheading,
  getRecordName,
  normalizeDisplayValue,
  recordMatchesSearch,
} from './helpers'

describe('rule helpers', () => {
  it('formats object field values as readable text', () => {
    const record = {
      purchase_price: { value: 45000, currency: 'USD' },
    }

    expect(getFieldValue(record, 'purchase_price')).toBe('45000 USD')
  })

  it('resolves customField values from array containers', () => {
    const record = {
      customFields: [{ id: 'vehicle_type', value: { label: 'SUV' } }],
    }

    expect(getFieldValue(record, 'customField.vehicle_type')).toBe('SUV')
  })

  it('builds match subheadings without object coercion artifacts', () => {
    const record = {
      buyer_name: 'Maria Garcia',
      purchase_price: { value: 45000, currency: 'USD' },
    }
    const matchFields = [
      { field: 'buyer_name', algorithm: 'exact' },
      { field: 'purchase_price', algorithm: 'exact' },
    ]

    expect(getMatchFieldSubheading(record, matchFields)).toBe('Maria Garcia • 45000 USD')
  })

  it('returns per-value match display items with dynamic labels', () => {
    const record = {
      buyer_name: 'Maria Garcia',
      purchase_price: { value: 45000, currency: 'USD' },
    }
    const matchFields = [
      { field: 'buyer_name', algorithm: 'exact' },
      { field: 'customField.purchase_price', algorithm: 'exact' },
    ]

    expect(getMatchFieldDisplayItems(record, matchFields)).toEqual([
      { field: 'buyer_name', label: 'Buyer Name', value: 'Maria Garcia' },
      { field: 'customField.purchase_price', label: 'Purchase Price', value: '45000 USD' },
    ])
  })

  it('formats field labels for contact and custom object fields', () => {
    expect(formatFieldLabel('email')).toBe('Email')
    expect(formatFieldLabel('customField.vin_number')).toBe('Vin Number')
    expect(formatFieldLabel('VIN')).toBe('VIN')
  })

  it('uses display field values when naming custom object records', () => {
    const record = {
      vin: { label: '1HGBH41JXMN000010' },
      buyer_name: 'Maria Garcia',
    }
    const matchFields = [{ field: 'buyer_name', algorithm: 'exact' }]

    expect(getRecordName(record, matchFields, 'vin')).toBe('1HGBH41JXMN000010')
  })

  it('returns readable first match field values', () => {
    const record = {
      purchase_price: { value: 39000, currency: 'USD' },
    }
    const matchFields = [{ field: 'purchase_price', algorithm: 'exact' }]

    expect(getFirstMatchFieldValue(record, matchFields)).toBe('39000 USD')
  })

  it('searches through normalized object values', () => {
    const record = {
      purchase_price: { value: 45000, currency: 'USD' },
    }

    expect(recordMatchesSearch(record, '45000')).toBe(true)
    expect(recordMatchesSearch(record, 'usd')).toBe(true)
    expect(recordMatchesSearch(record, 'eur')).toBe(false)
  })

  it('normalizes nested arrays/objects for display tables', () => {
    const value = [
      { label: 'automatic' },
      { amount: 45000, currency: 'USD' },
    ]

    expect(normalizeDisplayValue(value)).toBe('automatic, 45000 USD')
  })
})
