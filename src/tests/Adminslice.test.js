import { describe, it, expect, beforeEach, vi } from 'vitest';
import adminReducer, {
  updateUserStatus,
  clearAdminError,
  fetchPendingUsers,
  approveUser,
  updateUser,
  deleteUser,
} from '../features/Admin/Adminslice';

// Mock import.meta.env
vi.stubEnv('VITE_BASE_URL', 'http://api.test');

describe('Admin Redux Slice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should return initial state', () => {
    const state = adminReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      users: [],
      loading: false,
      error: null,
      actionLoadingId: null,
      updateLoadingId: null,
      deleteLoadingId: null,
      actionError: null,
    });
  });

  it('should handle updateUserStatus', () => {
    const initialState = {
      users: [{ id: 1, name: 'John Doe', status: 'pending' }],
    };
    const nextState = adminReducer(initialState, updateUserStatus({ id: 1, status: 'approved' }));
    expect(nextState.users[0].status).toBe('approved');
  });

  it('should handle clearAdminError', () => {
    const initialState = {
      error: 'Some error',
      actionError: 'Action error',
    };
    const nextState = adminReducer(initialState, clearAdminError());
    expect(nextState.error).toBeNull();
    expect(nextState.actionError).toBeNull();
  });

  describe('Async Thunks Reducers', () => {
    it('fetchPendingUsers pending', () => {
      const state = adminReducer(undefined, fetchPendingUsers.pending());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('fetchPendingUsers fulfilled', () => {
      const usersPayload = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
      const state = adminReducer(
        undefined,
        fetchPendingUsers.fulfilled(usersPayload, 'requestId', undefined)
      );
      expect(state.loading).toBe(false);
      expect(state.users).toEqual([
        { id: 1, name: 'User 1', status: 'pending' },
        { id: 2, name: 'User 2', status: 'pending' },
      ]);
    });

    it('fetchPendingUsers rejected', () => {
      const state = adminReducer(
        undefined,
        fetchPendingUsers.rejected(null, 'requestId', undefined, 'Failed to fetch')
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });

    it('approveUser fulfilled', () => {
      const initialState = {
        users: [{ id: 1, name: 'User 1', status: 'pending' }],
        actionLoadingId: 1,
      };
      const state = adminReducer(
        initialState,
        approveUser.fulfilled(1, 'requestId', 1)
      );
      expect(state.actionLoadingId).toBeNull();
      expect(state.users[0].status).toBe('approved');
    });

    it('updateUser fulfilled', () => {
      const initialState = {
        users: [{ id: 1, name: 'User 1', email: 'user1@example.com' }],
        updateLoadingId: 1,
      };
      const updateData = { id: 1, name: 'Updated User 1', email: 'updated@example.com', mobile: '123' };
      const state = adminReducer(
        initialState,
        updateUser.fulfilled(updateData, 'requestId', updateData)
      );
      expect(state.updateLoadingId).toBeNull();
      expect(state.users[0]).toEqual({
        id: 1,
        name: 'Updated User 1',
        email: 'updated@example.com',
        mobile: '123',
      });
    });

    it('deleteUser fulfilled', () => {
      const initialState = {
        users: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ],
        deleteLoadingId: 1,
      };
      const state = adminReducer(
        initialState,
        deleteUser.fulfilled(1, 'requestId', 1)
      );
      expect(state.deleteLoadingId).toBeNull();
      expect(state.users).toHaveLength(1);
      expect(state.users[0].id).toBe(2);
    });
  });
});
