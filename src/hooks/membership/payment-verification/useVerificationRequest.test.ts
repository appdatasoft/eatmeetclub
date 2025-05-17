
/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVerificationRequest } from './useVerificationRequest'
import { VerificationParams, RequestOptions } from '../types'

// Test setup and execution
describe('useVerificationRequest', () => {
  // Setup and cleanup
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test case
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVerificationRequest())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.sendVerificationRequest).toBe('function')
  })
})
