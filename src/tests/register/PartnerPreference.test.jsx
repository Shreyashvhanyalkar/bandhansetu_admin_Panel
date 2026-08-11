// src/tests/register/PartnerPreference.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PartenerPreference from '../../pages/admin/register/PartenerPreference';

vi.mock('../../hooks/registerHooks/usePartenerDetails', () => ({
  useMaritalStatuses: vi.fn(() => ({ data: [{ id: 1, name: 'Never Married' }], isLoading: false })),
  useReligions: vi.fn(() => ({ data: [{ id: 1, name: 'Hindu' }], isLoading: false })),
  useCastes: vi.fn(() => ({ data: [], isLoading: false })),
  useSubcastes: vi.fn(() => ({ data: [], isLoading: false })),
  useMotherTongues: vi.fn(() => ({ data: [{ id: 1, name: 'Hindi' }], isLoading: false })),
  useCountries: vi.fn(() => ({ data: [{ id: 1, name: 'India' }], isLoading: false })),
  useStates: vi.fn(() => ({ data: [], isLoading: false })),
  useCities: vi.fn(() => ({ data: [], isLoading: false })),
  useEducationLevels: vi.fn(() => ({ data: [{ id: 1, name: 'Graduate' }], isLoading: false })),
  useEducationFields: vi.fn(() => ({ data: [], isLoading: false })),
  useWorkingWith: vi.fn(() => ({ data: [{ id: 1, name: 'Private Sector' }], isLoading: false })),
  useWorkingCategories: vi.fn(() => ({ data: [], isLoading: false })),
  useWorkingSubcategories: vi.fn(() => ({ data: [], isLoading: false })),
  useSavePartnerPreferences: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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
          gender: 'Male',
        },
        basicDetails: { religionId: '1' },
        professionalDetails: { educationLevelId: '1' },
        personalDetails: { dietId: '1' },
      },
    }),
  };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PartenerPreference />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('PartnerPreference – Step 5 form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('renders the Partner Preference step heading', () => {
    renderWithProviders();
    expect(screen.getByText(/Partner Preference/i)).toBeInTheDocument();
  });

  it('renders age range slider section', () => {
    renderWithProviders();
    expect(screen.getByText(/Preferred age range/i)).toBeInTheDocument();
  });

  it('renders Marital Status section', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Marital Status/i).length).toBeGreaterThan(0);
  });

  it('renders Religion section', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Religion/i).length).toBeGreaterThan(0);
  });

  it('renders Education Level section', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Education/i).length).toBeGreaterThan(0);
  });

  it('renders the Save & Complete button', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /Save and Continue/i })).toBeInTheDocument();
  });
});
