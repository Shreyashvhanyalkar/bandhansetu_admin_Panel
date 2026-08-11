// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\Login.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import authReducer from '../features/auth/Authslice';
import { useLogin } from '../hooks/useAuthMutations';

// Mock useLogin mutation hook
vi.mock('../hooks/useAuthMutations', () => ({
  useLogin: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (ui, { preloadedState } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('Login Component', () => {
  let mockMutate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it('should render the Welcome back heading and logo', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByAltText('Bandhan Setu Logo')).toBeInTheDocument();
  });

  it('should render email input, password input, and Sign In button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('Email Address *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should allow typing into email and password fields', () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('Email Address *');
    const passwordInput = screen.getByPlaceholderText('Password *');

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('admin@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should trigger loginMutation.mutate with form data on form submit', () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('Email Address *');
    const passwordInput = screen.getByPlaceholderText('Password *');

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password123',
    });
  });

  it('should disable inputs and show "Signing in..." when login is pending', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });

    renderWithProviders(<Login />);

    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address *')).toBeDisabled();
    expect(screen.getByPlaceholderText('Password *')).toBeDisabled();
  });

  it('should display an error message when login fails', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: { message: 'Invalid credentials. Please try again.' },
    });

    renderWithProviders(<Login />);

    expect(screen.getByText('Invalid credentials. Please try again.')).toBeInTheDocument();
  });

  it('should navigate to /admin/requests when already authenticated', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { name: 'Admin' },
          token: 'valid-token',
        },
      },
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/requests');
  });
});