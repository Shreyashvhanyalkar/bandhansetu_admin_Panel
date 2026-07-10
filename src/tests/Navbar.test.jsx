import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../pages/layout/Navbar';
import authReducer from '../features/auth/Authslice';

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

describe('Navbar Component', () => {
  it('should render the default Page Title', () => {
    renderWithProviders(<Navbar onMenuClick={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should trigger onMenuClick when the mobile menu button is clicked', () => {
    const handleMenuClick = vi.fn();
    renderWithProviders(<Navbar onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /open sidebar/i });
    fireEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should display the admin name when user is logged in', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Shreyash Admin' },
        token: 'token',
      },
    };
    renderWithProviders(<Navbar onMenuClick={() => {}} />, { preloadedState });

    expect(screen.getByText('Shreyash Admin')).toBeInTheDocument();
  });

  it('should fallback to Admin when user name is not defined', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: null,
        token: 'token',
      },
    };
    renderWithProviders(<Navbar onMenuClick={() => {}} />, { preloadedState });

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
