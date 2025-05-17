
import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStorage } from './useUserStorage';

// Mock LocalStorage
const mockLocalStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key) => mockLocalStorageData[key] ?? null),
  setItem: vi.fn((key, value) => { mockLocalStorageData[key] = value; }),
  removeItem: vi.fn((key) => { delete mockLocalStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(mockLocalStorageData).forEach(key => delete mockLocalStorageData[key]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock SessionStorage
const mockSessionStorageData: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key) => mockSessionStorageData[key] ?? null),
  setItem: vi.fn((key, value) => { mockSessionStorageData[key] = value; }),
  removeItem: vi.fn((key) => { delete mockSessionStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(mockSessionStorageData).forEach(key => delete mockSessionStorageData[key]); }),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('useUserStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockLocalStorageData).forEach(key => delete mockLocalStorageData[key]);
    Object.keys(mockSessionStorageData).forEach(key => delete mockSessionStorageData[key]);
  });

  it('should get user details from localStorage', () => {
    // Set up test data
    mockLocalStorageData['signup_email'] = 'test@example.com';
    mockLocalStorageData['signup_name'] = 'Test User';
    mockLocalStorageData['signup_phone'] = '123456';
    mockLocalStorageData['signup_address'] = '123 Test St';
    
    const { result } = renderHook(() => useUserStorage());
    
    expect(result.current.getUserDetails()).toEqual({
      email: 'test@example.com',
      name: 'Test User',
      phone: '123456',
      address: '123 Test St'
    });
  });

  it('should get user details from sessionStorage if not in localStorage', () => {
    // Set up test data
    mockSessionStorageData['signup_email'] = 'session@example.com';
    mockSessionStorageData['signup_name'] = 'Session User';
    
    const { result } = renderHook(() => useUserStorage());
    
    expect(result.current.getUserDetails()).toEqual({
      email: 'session@example.com',
      name: 'Session User',
      phone: '',
      address: ''
    });
  });

  it('should prefer localStorage over sessionStorage if both exist', () => {
    // Set up test data in both storages
    mockLocalStorageData['signup_email'] = 'local@example.com';
    mockSessionStorageData['signup_email'] = 'session@example.com';
    
    const { result } = renderHook(() => useUserStorage());
    
    expect(result.current.getUserDetails().email).toBe('local@example.com');
  });

  it('should return empty strings if no data exists', () => {
    const { result } = renderHook(() => useUserStorage());
    
    expect(result.current.getUserDetails()).toEqual({
      email: '',
      name: '',
      phone: '',
      address: ''
    });
  });

  it('should clear user details from both storages', () => {
    // Set up test data in both storages
    mockLocalStorageData['signup_email'] = 'local@example.com';
    mockLocalStorageData['signup_name'] = 'Local User';
    mockSessionStorageData['signup_email'] = 'session@example.com';
    
    const { result } = renderHook(() => useUserStorage());
    
    result.current.clearUserDetails();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('signup_email');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('signup_name');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('signup_phone');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('signup_address');
    
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('signup_email');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('signup_name');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('signup_phone');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('signup_address');
  });

  it('should store user details in both storages', () => {
    const { result } = renderHook(() => useUserStorage());
    
    result.current.storeUserDetails({
      email: 'new@example.com',
      name: 'New User',
      phone: '987654',
      address: '456 New St'
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('signup_email', 'new@example.com');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('signup_name', 'New User');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('signup_phone', '987654');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('signup_address', '456 New St');
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('signup_email', 'new@example.com');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('signup_name', 'New User');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('signup_phone', '987654');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('signup_address', '456 New St');
  });
});
