// src/tests/register/BasicDetails.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BasicDetails from '../../pages/admin/register/BasicDetails';

// Mock all hooks used by BasicDetails
vi.mock('../../hooks/registerHooks/useBasicdetail', () => ({
  useReligions: vi.fn(() => ({ data: [{ id: 1, name: 'Hindu' }], isLoading: false })),
  useCastes: vi.fn(() => ({ data: [{ id: 1, name: 'Brahmin' }], isLoading: false })),
  useSubcastes: vi.fn(() => ({ data: [], isLoading: false })),
  useCountries: vi.fn(() => ({ data: [{ id: 1, name: 'India' }], isLoading: false })),
  useStates: vi.fn(() => ({ data: [{ id: 1, name: 'Maharashtra' }], isLoading: false })),
  useCities: vi.fn(() => ({ data: [{ id: 1, name: 'Mumbai' }], isLoading: false })),
  useMotherTongues: vi.fn(() => ({ data: [{ id: 1, name: 'Hindi' }], isLoading: false })),
  useMaritalStatuses: vi.fn(() => ({ data: [{ id: 1, name: 'Never Married' }], isLoading: false })),
  useSaveBasicDetails: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        registerData: {
          userId: 'user-123',
          platformId: 'BS-001',
          firstName: 'Rahul',
          lastName: 'Sharma',
        },
      },
    }),
  };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BasicDetails />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('BasicDetails – Step 2 form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('renders the Basic Details step heading', () => {
    renderWithProviders();
    expect(screen.getByText(/Basic Details/i)).toBeInTheDocument();
  });

  it('renders section labels for religion, location, and marital status', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Religion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Country/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Marital Status/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mother Tongue/i).length).toBeGreaterThan(0);
  });

  it('shows validation errors when submitting empty required fields', async () => {
    renderWithProviders();

    const saveButton = screen.getByRole('button', { name: /Save and Continue/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select religion/i)).toBeInTheDocument();
    });
  });
});
