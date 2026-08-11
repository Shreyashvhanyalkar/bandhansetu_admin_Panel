// src/tests/register/ProfessionalDetails.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfessionalDetails from '../../pages/admin/register/ProfessionalDetails';

vi.mock('../../hooks/registerHooks/useProfessionaldetails', () => ({
  useEducationLevels: vi.fn(() => ({ data: [{ id: 1, name: 'Graduate' }], isLoading: false })),
  useEducationFields: vi.fn(() => ({ data: [{ id: 1, name: 'Engineering' }], isLoading: false })),
  useIncomes: vi.fn(() => ({ data: [{ id: 1, name: '5-10 LPA' }], isLoading: false })),
  useWorkingWith: vi.fn(() => ({ data: [{ id: 1, name: 'Private Sector' }], isLoading: false })),
  useWorkingCategories: vi.fn(() => ({ data: [{ id: 1, name: 'IT/Software' }], isLoading: false })),
  useWorkingSubcategories: vi.fn(() => ({ data: [{ id: 1, name: 'Software Engineer' }], isLoading: false })),
  useSaveProfessionalDetails: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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
        basicDetails: { religionId: '1' },
      },
    }),
  };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfessionalDetails />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('ProfessionalDetails – Step 3 form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('renders the Professional Details step heading', () => {
    renderWithProviders();
    expect(screen.getByText(/Professional Details/i)).toBeInTheDocument();
  });

  it('renders key section labels', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Education Level/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Annual Income/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Working With/i).length).toBeGreaterThan(0);
  });

  it('shows validation errors when Save is clicked without required fields', async () => {
    renderWithProviders();

    const saveButton = screen.getByRole('button', { name: /Save and Continue/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select education level/i)).toBeInTheDocument();
    });
  });

  it('renders a college name text field', () => {
    renderWithProviders();
    expect(screen.getByPlaceholderText(/College name \(optional\)/i)).toBeInTheDocument();
  });

  it('renders employer name text field', () => {
    renderWithProviders();
    expect(screen.getByPlaceholderText(/Employer name \(optional\)/i)).toBeInTheDocument();
  });
});
