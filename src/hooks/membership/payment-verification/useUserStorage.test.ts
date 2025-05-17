/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { useUserStorage } from '../useUserStorage'

let container: HTMLElement
let root: ReturnType<typeof createRoot>

const TestComponent = ({ email }: { email?: string }) => {
  const user = useUserStorage()
  return (
    <div>
      <div data-testid="name">{user.name}</div>
      <div data-testid="email">{user.email}</div>
    </div>
  )
}

describe('useUserStorage', () => {
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    root.unmount()
    container.remove()
  })

  it('should get user details from localStorage', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Member',
        email: 'local@example.com',
        phone: '1234567890',
        stripeCustomerId: 'cus_123',
      })
    )

    act(() => {
      root.render(<TestComponent />)
    })

    expect(container.querySelector('[data-testid="email"]')?.textContent).toBe('local@example.com')
    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('Member')
  })

  it('should return empty strings if no data exists', () => {
    act(() => {
      root.render(<TestComponent />)
    })

    expect(container.querySelector('[data-testid="email"]')?.textContent).toBe('')
    expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('')
  })
})
