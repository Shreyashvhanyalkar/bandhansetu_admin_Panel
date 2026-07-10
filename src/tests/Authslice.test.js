import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, { loginSuccess, logout, updateUser } from '../features/auth/Authslice';

describe('Auth Redux Slice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });
    expect(initialState).toEqual({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  });

  it('should handle loginSuccess and store credentials in localStorage', () => {
    const previousState = {
      isAuthenticated: false,
      user: null,
      token: null,
    };
    const payload = {
      token: 'test-token-123',
      user: { name: 'John Doe', email: 'john@example.com' },
    };

    const nextState = authReducer(previousState, loginSuccess(payload));

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.token).toBe('test-token-123');
    expect(nextState.user).toEqual({ name: 'John Doe', email: 'john@example.com' });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token-123');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(payload.user));
  });

  it('should handle logout and clear state and localStorage', () => {
    const previousState = {
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' },
      token: 'test-token-123',
    };

    const nextState = authReducer(previousState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should handle updateUser and update details in state and localStorage', () => {
    const previousState = {
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' },
      token: 'test-token-123',
    };
    const updatePayload = { name: 'Johnny Doe' };

    const nextState = authReducer(previousState, updateUser(updatePayload));

    expect(nextState.user.name).toBe('Johnny Doe');
    expect(nextState.user.email).toBe('john@example.com');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ name: 'Johnny Doe', email: 'john@example.com' })
    );
  });
});
