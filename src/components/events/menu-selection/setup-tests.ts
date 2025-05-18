
// This file configures the test setup for Jest/Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock sessionStorage for testing
class MockSessionStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Set up a global mock for sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: new MockSessionStorage(),
  writable: true
});

// Mock for dialog implementation
Element.prototype.scrollIntoView = vi.fn();
