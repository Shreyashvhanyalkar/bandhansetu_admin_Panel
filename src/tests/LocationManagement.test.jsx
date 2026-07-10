import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import LocationManagement from '../pages/admin/LocationManagement';
import authReducer from '../features/auth/Authslice';
import * as locationHooks from '../hooks/useLocationManagement';

// Mock the location management hooks
vi.mock('../hooks/useLocationManagement', () => ({
  useGetCountries: vi.fn(),
  useGetStates: vi.fn(),
  useGetCities: vi.fn(),
  useAddCountry: vi.fn(),
  useEditCountry: vi.fn(),
  useDeleteCountry: vi.fn(),
  useAddState: vi.fn(),
  useEditState: vi.fn(),
  useDeleteState: vi.fn(),
  useAddCity: vi.fn(),
  useEditCity: vi.fn(),
  useDeleteCity: vi.fn(),
}));

const renderWithProviders = (ui) => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('LocationManagement Component', () => {
  const mockCountries = [
    { id: '1', country_name: 'India' },
    { id: '2', country_name: 'United States' },
  ];

  const mockStates = [
    { id: '10', state_name: 'Maharashtra', country_id: '1' },
    { id: '11', state_name: 'Gujarat', country_id: '1' },
  ];

  const mockCities = [
    { id: '100', city_name: 'Mumbai', state_id: '10' },
    { id: '101', city_name: 'Pune', state_id: '10' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(locationHooks.useGetCountries).mockReturnValue({
      data: mockCountries,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    vi.mocked(locationHooks.useGetStates).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(locationHooks.useGetCities).mockReturnValue({
      data: [],
      isLoading: false,
    });

    // Mock mutations
    const mockMutation = { mutate: vi.fn(), isPending: false };
    vi.mocked(locationHooks.useAddCountry).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useEditCountry).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useDeleteCountry).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useAddState).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useEditState).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useDeleteState).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useAddCity).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useEditCity).mockReturnValue(mockMutation);
    vi.mocked(locationHooks.useDeleteCity).mockReturnValue(mockMutation);
  });

  it('should render the country list and headers', () => {
    renderWithProviders(<LocationManagement />);

    expect(screen.getByText('Location System')).toBeInTheDocument();
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('No Country Selected')).toBeInTheDocument();
  });

  it('should show states when a country is selected', async () => {
    vi.mocked(locationHooks.useGetStates).mockImplementation((countryId) => {
      if (countryId === '1') {
        return { data: mockStates, isLoading: false };
      }
      return { data: [], isLoading: false };
    });

    renderWithProviders(<LocationManagement />);

    const countryRow = screen.getByText('India');
    fireEvent.click(countryRow);

    await waitFor(() => {
      expect(screen.getByText('Maharashtra')).toBeInTheDocument();
      expect(screen.getByText('Gujarat')).toBeInTheDocument();
    });
  });

  it('should show cities when a state is selected', async () => {
    vi.mocked(locationHooks.useGetStates).mockImplementation(() => ({
      data: mockStates,
      isLoading: false,
    }));

    vi.mocked(locationHooks.useGetCities).mockImplementation((stateId) => {
      if (stateId === '10') {
        return { data: mockCities, isLoading: false };
      }
      return { data: [], isLoading: false };
    });

    renderWithProviders(<LocationManagement />);

    // Select country
    fireEvent.click(screen.getByText('India'));
    // Select state
    fireEvent.click(screen.getByText('Maharashtra'));

    await waitFor(() => {
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.getByText('Pune')).toBeInTheDocument();
    });
  });

  it('should trigger add country mutation when adding a new country via modal', async () => {
    const mockAddMutate = vi.fn();
    vi.mocked(locationHooks.useAddCountry).mockReturnValue({
      mutate: mockAddMutate,
      isPending: false,
    });

    renderWithProviders(<LocationManagement />);

    // Open add country modal
    const addCountryButton = screen.getByTitle('Add New Country');
    fireEvent.click(addCountryButton);

    // Find input and submit
    const input = screen.getByPlaceholderText('e.g. India, United States');
    fireEvent.change(input, { target: { value: 'Canada' } });

    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(mockAddMutate).toHaveBeenCalledWith({ country_name: 'Canada' });
  });
});
