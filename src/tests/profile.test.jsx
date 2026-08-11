// src/tests/profile.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import AdminProfile from '../pages/admin/profile';
import authReducer from '../features/auth/Authslice';

const renderWithProviders = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AdminProfile />
      </MemoryRouter>
    </Provider>
  );
};

describe('AdminProfile Component', () => {
  it('renders the admin profile card', () => {
    renderWithProviders({ auth: { user: { name: 'Super Admin' }, token: 'tok', isAuthenticated: true } });
    expect(screen.getAllByText('Super Admin').length).toBeGreaterThan(0);
  });

  it('falls back to "Admin User" when user name is not in state', () => {
    renderWithProviders({ auth: { user: null, token: null, isAuthenticated: false } });
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
  });

  it('renders the role badge "Administrator"', () => {
    renderWithProviders();
    expect(screen.getAllByText('Administrator').length).toBeGreaterThan(0);
  });

  it('renders the department', () => {
    renderWithProviders();
    expect(screen.getByText('Admin Management')).toBeInTheDocument();
  });

  it('renders the email and phone details', () => {
    renderWithProviders();
    expect(screen.getByText('admin@bandhan.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
  });

  it('renders the location', () => {
    renderWithProviders();
    expect(screen.getByText('Mumbai, India')).toBeInTheDocument();
  });

  it('renders the join date', () => {
    renderWithProviders();
    expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
  });

  it('renders a Back to Dashboard link', () => {
    renderWithProviders();
    const backLink = screen.getByRole('link', { name: /Back to Dashboard/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/admin/dashboard');
  });

  it('renders an avatar image', () => {
    renderWithProviders({ auth: { user: { name: 'Super Admin' }, token: 'tok', isAuthenticated: true } });
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Super Admin');
  });
});
