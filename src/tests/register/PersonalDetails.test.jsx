// src/tests/register/PersonalDetails.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PersonalDetails from '../../pages/admin/register/PersonalDetails';

vi.mock('../../hooks/registerHooks/usePersonalDetails', () => ({
  useDiets: vi.fn(() => ({
    data: [{ id: 1, name: 'Vegetarian' }, { id: 2, name: 'Non-Vegetarian' }],
    isLoading: false,
  })),
  useBodyTypes: vi.fn(() => ({
    data: [{ id: 1, name: 'Slim' }, { id: 2, name: 'Athletic' }],
    isLoading: false,
  })),
  useSkinTones: vi.fn(() => ({
    data: [{ id: 1, name: 'Fair' }, { id: 2, name: 'Dusky' }],
    isLoading: false,
  })),
  useSavePersonalDetails: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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
        professionalDetails: { educationLevelId: '1' },
      },
    }),
  };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PersonalDetails />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('PersonalDetails – Step 4 form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('renders the Personal Details step heading', () => {
    renderWithProviders();
    expect(screen.getByText(/Personal Details/i)).toBeInTheDocument();
  });

  it('renders Diet, Height and Weight section labels', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Diet/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Height/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Weight/i).length).toBeGreaterThan(0);
  });

  it('shows validation error when Diet is not selected on Save', async () => {
    renderWithProviders();

    const saveButton = screen.getByRole('button', { name: /Save and Continue/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select diet/i)).toBeInTheDocument();
    });
  });

  it('renders Smoke and Drink option buttons', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Smoke/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Drink/i).length).toBeGreaterThan(0);
  });

  it('renders Body Type and Skin Tone section labels', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Body Type/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Skin Tone/i).length).toBeGreaterThan(0);
  });

  it('renders Disability section', () => {
    renderWithProviders();
    expect(screen.getAllByText(/Any Disability/i).length).toBeGreaterThan(0);
  });
});
