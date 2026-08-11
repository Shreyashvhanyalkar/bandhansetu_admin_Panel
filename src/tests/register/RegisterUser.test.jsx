// src/tests/register/RegisterUser.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterUser from '../../pages/admin/register/register';
import * as useRegisterModule from '../../hooks/registerHooks/useRegister';

// Mock assets
vi.mock('../../../assets/Mask group.png', () => ({ default: 'mask-group.png' }));
vi.mock('../../../assets/Layer 1.png', () => ({ default: 'layer1.png' }));

// Consistent mock for useRegisterUser
vi.mock('../../hooks/registerHooks/useRegister', () => ({
  useRegisterUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RegisterUser />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('RegisterUser – Step 1 form', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRegisterModule.useRegisterUser).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it('renders the registration heading and form fields', () => {
    renderWithProviders();
    expect(screen.getByText(/Register User/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register for free/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));
    await waitFor(() => {
      expect(screen.getByText(/First name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows mobile validation error for fewer than 10 digits', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Sharma' } });
    fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '12345' } });

    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid 10-digit mobile number/i)).toBeInTheDocument();
    });
  });

  it('shows email validation error for invalid email format', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Sharma' } });
    // Use a value that jsdom lets through for type=email but fails the /\S+@\S+\.\S+/ regex
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'invalid@domain' } });
    fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '9876543210' } });

    // Select gender to pass gender validation
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Male' } });

    // Set DOB
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2000-01-01' } });

    // Accept terms
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows gender validation error when not selected', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Sharma' } });
    fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '9876543210' } });

    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please select gender/i)).toBeInTheDocument();
    });
  });

  it('shows terms error when terms are not accepted', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Sharma' } });
    fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '9876543210' } });

    // Select gender
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Male' } });

    // Set DOB using querySelector
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2000-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));

    await waitFor(() => {
      expect(screen.getByText(/You must accept terms/i)).toBeInTheDocument();
    });
  });

  it('shows minimum age hint based on gender selection', () => {
    renderWithProviders();

    expect(screen.getByText(/Minimum age: 21 for male, 18 for female/i)).toBeInTheDocument();

    const genderSelect = screen.getByRole('combobox');
    fireEvent.change(genderSelect, { target: { value: 'Male' } });

    expect(screen.getByText(/Minimum age: 21 years/i)).toBeInTheDocument();

    fireEvent.change(genderSelect, { target: { value: 'Female' } });
    expect(screen.getByText(/Minimum age: 18 years/i)).toBeInTheDocument();
  });

  it('shows "Registering..." text when isPending is true', () => {
    vi.mocked(useRegisterModule.useRegisterUser).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });
    renderWithProviders();
    expect(screen.getByRole('button', { name: /Registering.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registering.../i })).toBeDisabled();
  });

  it('calls mutate with correct payload on valid form submit', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Sharma' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'rahul@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '9876543210' } });

    const genderSelect = screen.getByRole('combobox');
    fireEvent.change(genderSelect, { target: { value: 'Male' } });

    // Set a valid DOB (21+ years ago for Male)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: '1998-01-01' } });
    }

    // Accept terms
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /Register for free/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Rahul',
          lastName: 'Sharma',
          email: 'rahul@example.com',
          mobileNumber: '9876543210',
          gender: 'Male',
        }),
        expect.any(Object)
      );
    });
  });

  it('shows country code dropdown button and default +91', () => {
    renderWithProviders();
    expect(screen.getByText('+91')).toBeInTheDocument();
  });

  it('opens the country code dropdown on click', () => {
    renderWithProviders();
    const codeButton = screen.getByText('+91');
    fireEvent.click(codeButton);
    // Other codes should appear
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('+44')).toBeInTheDocument();
  });
});
