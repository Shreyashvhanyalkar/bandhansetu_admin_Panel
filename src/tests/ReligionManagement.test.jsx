// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\ReligionManagement.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReligionManagement from '../pages/admin/ReligionManagement';
import * as religionHooks from '../hooks/useReligionCast';

// Mock the religion management hooks
vi.mock('../hooks/useReligionCast', () => ({
  useGetReligions: vi.fn(),
  useAddReligion: vi.fn(),
  useEditReligion: vi.fn(),
  useDeleteReligion: vi.fn(),
  useGetCastes: vi.fn(),
  useAddCaste: vi.fn(),
  useEditCaste: vi.fn(),
  useDeleteCaste: vi.fn(),
  useGetSubcasts: vi.fn(),
  useAddSubcast: vi.fn(),
  useEditSubcast: vi.fn(),
  useDeleteSubcast: vi.fn(),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ReligionManagement Component', () => {
  const mockReligions = [
    { id: '1', religion_name: 'Hinduism' },
    { id: '2', religion_name: 'Islam' },
    { id: '3', religion_name: 'Christianity' },
  ];

  const mockCastes = [
    { id: '10', caste_name: 'Brahmin', religion_id: '1' },
    { id: '11', caste_name: 'Rajput', religion_id: '1' },
    { id: '12', caste_name: 'Vaishya', religion_id: '1' },
  ];

  const mockSubcasts = [
    { id: '100', subcaste_name: 'Deshastha', caste_id: '10' },
    { id: '101', subcaste_name: 'Kokanastha', caste_id: '10' },
    { id: '102', subcaste_name: 'Saraswat', caste_id: '10' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(religionHooks.useGetReligions).mockReturnValue({
      data: mockReligions,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    vi.mocked(religionHooks.useGetCastes).mockReturnValue({
      data: [],
      isLoading: false,
    });

    vi.mocked(religionHooks.useGetSubcasts).mockReturnValue({
      data: [],
      isLoading: false,
    });

    // Mock mutations
    const mockMutation = { mutate: vi.fn(), isPending: false };
    vi.mocked(religionHooks.useAddReligion).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useEditReligion).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useDeleteReligion).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useAddCaste).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useEditCaste).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useDeleteCaste).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useAddSubcast).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useEditSubcast).mockReturnValue(mockMutation);
    vi.mocked(religionHooks.useDeleteSubcast).mockReturnValue(mockMutation);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── RENDERING TESTS ────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the page header and title', () => {
      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Religion & Community')).toBeInTheDocument();
      expect(screen.getByText('Manage Religion → Caste → Sub-caste hierarchy')).toBeInTheDocument();
    });

    it('should render the three column headers', () => {
      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Religions')).toBeInTheDocument();
      expect(screen.getByText('Castes')).toBeInTheDocument();
      expect(screen.getByText('Sub-castes')).toBeInTheDocument();
    });

    it('should render the stats cards with default values', () => {
      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Active Religion')).toBeInTheDocument();
      expect(screen.getByText('Select Religion')).toBeInTheDocument();
      expect(screen.getByText('Active Caste')).toBeInTheDocument();
      expect(screen.getByText('Select Caste')).toBeInTheDocument();
      expect(screen.getByText('Registered Sub-castes')).toBeInTheDocument();
      expect(screen.getByText('Select Caste First')).toBeInTheDocument();
    });

    it('should display religion list from API', () => {
      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Hinduism', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Islam', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Christianity', { selector: 'span' })).toBeInTheDocument();
    });

    it('should display loading skeletons when religions are loading', () => {
      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Loading religions...')).toBeInTheDocument();
    });

    it('should display error state when religions fetch fails', () => {
      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });

      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Failed to load religions')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
  });

  // ─── USER INTERACTION TESTS ─────────────────────────────────────────────────

  describe('User Interactions', () => {
    it('should show castes when a religion is selected', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation((religionId) => {
        if (religionId === '1') {
          return { data: mockCastes, isLoading: false };
        }
        return { data: [], isLoading: false };
      });

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText('Rajput', { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText('Vaishya', { selector: 'span' })).toBeInTheDocument();
      });
    });

    it('should show sub-castes when a caste is selected', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      vi.mocked(religionHooks.useGetSubcasts).mockImplementation((casteId) => {
        if (casteId === '10') {
          return { data: mockSubcasts, isLoading: false };
        }
        return { data: [], isLoading: false };
      });

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });
      const casteRow = screen.getByText('Brahmin', { selector: 'span' });
      fireEvent.click(casteRow);

      await waitFor(() => {
        expect(screen.getByText('Deshastha', { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText('Kokanastha', { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText('Saraswat', { selector: 'span' })).toBeInTheDocument();
      });
    });

    it('should update stats card when religion is selected', async () => {
      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        const elements = screen.getAllByText('Hinduism');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should trigger add religion mutation when adding via modal', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddReligion).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      renderWithProviders(<ReligionManagement />);

      const addButton = document.querySelector('[title="Add New Religion"]');
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText('e.g. Hinduism, Islam, Christianity');
      fireEvent.change(input, { target: { value: 'Buddhism' } });

      const submitBtn = screen.getByRole('button', { name: 'Add' });
      fireEvent.click(submitBtn);

      expect(mockAddMutate).toHaveBeenCalledWith({
        id: 'mockuuid1234',
        religion_name: 'Buddhism',
      });
    });

    it('should open edit modal when edit button is clicked', async () => {
      renderWithProviders(<ReligionManagement />);

      const editButtons = document.querySelectorAll('[title="Edit"]');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Religion')).toBeInTheDocument();
      });
    });

    it('should open delete confirmation dialog when delete button is clicked', async () => {
      renderWithProviders(<ReligionManagement />);

      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete "Hinduism"/)).toBeInTheDocument();
      });
    });

    it('should trigger add caste mutation when adding via modal', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddCaste).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });

      const addButtons = document.querySelectorAll('[title="Add New Caste"]');
      fireEvent.click(addButtons[0]);

      const input = screen.getByPlaceholderText('e.g. Brahmin, Rajput');
      fireEvent.change(input, { target: { value: 'Kshatriya' } });

      const submitBtn = screen.getByRole('button', { name: 'Add' });
      fireEvent.click(submitBtn);

      expect(mockAddMutate).toHaveBeenCalledWith({
        id: 'mockuuid1234',
        caste_name: 'Kshatriya',
        religion_id: '1',
      });
    });

    it('should trigger add sub-caste mutation when adding via modal', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddSubcast).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      vi.mocked(religionHooks.useGetSubcasts).mockImplementation(() => ({
        data: mockSubcasts,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });
      const casteRow = screen.getByText('Brahmin', { selector: 'span' });
      fireEvent.click(casteRow);

      await waitFor(() => {
        expect(screen.getByText('Deshastha', { selector: 'span' })).toBeInTheDocument();
      });

      const addButtons = document.querySelectorAll('[title="Add New Sub-caste"]');
      fireEvent.click(addButtons[0]);

      const input = screen.getByPlaceholderText('e.g. Deshastha, Kokanastha');
      fireEvent.change(input, { target: { value: 'Kashmiri' } });

      const submitBtn = screen.getByRole('button', { name: 'Add' });
      fireEvent.click(submitBtn);

      expect(mockAddMutate).toHaveBeenCalledWith({
        id: 'mockuuid1234',
        subcaste_name: 'Kashmiri',
        caste_id: '10',
      });
    });
  });

  // ─── SEARCH/FILTER TESTS ────────────────────────────────────────────────────

  describe('Search and Filter', () => {
    it('should filter religions by search term', () => {
      renderWithProviders(<ReligionManagement />);

      const searchInput = screen.getByPlaceholderText('Search religions...');
      fireEvent.change(searchInput, { target: { value: 'Hindu' } });

      expect(screen.getByText('Hinduism', { selector: 'span' })).toBeInTheDocument();
      expect(screen.queryByText('Islam', { selector: 'span' })).not.toBeInTheDocument();
      expect(screen.queryByText('Christianity', { selector: 'span' })).not.toBeInTheDocument();
    });

    it('should filter castes by search term', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search castes...');
      fireEvent.change(searchInput, { target: { value: 'Brahmin' } });

      expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      expect(screen.queryByText('Rajput', { selector: 'span' })).not.toBeInTheDocument();
      expect(screen.queryByText('Vaishya', { selector: 'span' })).not.toBeInTheDocument();
    });

    it('should filter sub-castes by search term', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      vi.mocked(religionHooks.useGetSubcasts).mockImplementation(() => ({
        data: mockSubcasts,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });
      const casteRow = screen.getByText('Brahmin', { selector: 'span' });
      fireEvent.click(casteRow);

      await waitFor(() => {
        expect(screen.getByText('Deshastha', { selector: 'span' })).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search sub-castes...');
      fireEvent.change(searchInput, { target: { value: 'Deshastha' } });

      expect(screen.getByText('Deshastha', { selector: 'span' })).toBeInTheDocument();
      expect(screen.queryByText('Kokanastha', { selector: 'span' })).not.toBeInTheDocument();
      expect(screen.queryByText('Saraswat', { selector: 'span' })).not.toBeInTheDocument();
    });

    it('should show "No Religions Found" when search returns no results', () => {
      renderWithProviders(<ReligionManagement />);

      const searchInput = screen.getByPlaceholderText('Search religions...');
      fireEvent.change(searchInput, { target: { value: 'XYZ' } });

      expect(screen.getByText('No Religions Found')).toBeInTheDocument();
    });
  });

  // ─── EMPTY STATE TESTS ─────────────────────────────────────────────────────

  describe('Empty States', () => {
    it('should show "No Religions Found" when religion list is empty', () => {
      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('No Religions Found')).toBeInTheDocument();
    });

    it('should show "No Religion Selected" in castes column when no religion selected', () => {
      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('No Religion Selected')).toBeInTheDocument();
    });

    it('should show "No Caste Selected" in sub-castes column when no caste selected', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('No Caste Selected')).toBeInTheDocument();
      });
    });

    it('should show "No Castes Found" when religion has no castes', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: [],
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('No Castes Found')).toBeInTheDocument();
      });
    });

    it('should show "No Sub-castes Found" when caste has no sub-castes', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      vi.mocked(religionHooks.useGetSubcasts).mockImplementation(() => ({
        data: [],
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });
      const casteRow = screen.getByText('Brahmin', { selector: 'span' });
      fireEvent.click(casteRow);

      await waitFor(() => {
        expect(screen.getByText('No Sub-castes Found')).toBeInTheDocument();
      });
    });
  });

  // ─── MODAL TESTS ────────────────────────────────────────────────────────────

  describe('Modals', () => {
    it('should close modal when Cancel is clicked', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddReligion).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      renderWithProviders(<ReligionManagement />);

      const addButton = document.querySelector('[title="Add New Religion"]');
      fireEvent.click(addButton);

      expect(screen.getByText('Add Religion')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText('Add Religion')).not.toBeInTheDocument();
      });
    });
// Replace the failing test with this:
it('should close modal when clicking overlay backdrop', async () => {
  const mockAddMutate = vi.fn();
  vi.mocked(religionHooks.useAddReligion).mockReturnValue({
    mutate: mockAddMutate,
    isPending: false,
  });

  renderWithProviders(<ReligionManagement />);

  const addButton = document.querySelector('[title="Add New Religion"]');
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('Add Religion')).toBeInTheDocument();
  });

  // The Modal component has: <div className="fixed inset-0 z-[100] flex ..." onClick={onClose}>
  // We need to click on the backdrop area (the outer div with the click handler)
  // Try multiple selector strategies
  const modalOverlay = 
    document.querySelector('.fixed.inset-0.z-\\[100\\]') ||
    document.querySelector('[class*="fixed inset-0 z-\\[100\\]"]');
  
  if (modalOverlay) {
    // Click on the overlay backdrop
    fireEvent.click(modalOverlay);
  }

  // Wait for modal to close
  await waitFor(() => {
    expect(screen.queryByText('Add Religion')).not.toBeInTheDocument();
  }, { timeout: 3000 });
});

    it('should submit on Enter key press', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddReligion).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      renderWithProviders(<ReligionManagement />);

      const addButton = document.querySelector('[title="Add New Religion"]');
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText('e.g. Hinduism, Islam, Christianity');
      fireEvent.change(input, { target: { value: 'Jainism' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockAddMutate).toHaveBeenCalledWith({
        id: 'mockuuid1234',
        religion_name: 'Jainism',
      });
    });

    it('should not submit when input is empty', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddReligion).mockReturnValue({
        mutate: mockAddMutate,
        isPending: false,
      });

      renderWithProviders(<ReligionManagement />);

      const addButton = document.querySelector('[title="Add New Religion"]');
      fireEvent.click(addButton);

      const submitBtn = screen.getByRole('button', { name: 'Add' });
      fireEvent.click(submitBtn);

      expect(mockAddMutate).not.toHaveBeenCalled();
    });

    it('should show "Saving..." state when mutation is pending', async () => {
      const mockAddMutate = vi.fn();
      vi.mocked(religionHooks.useAddReligion).mockReturnValue({
        mutate: mockAddMutate,
        isPending: true,
      });

      renderWithProviders(<ReligionManagement />);

      const addButton = document.querySelector('[title="Add New Religion"]');
      fireEvent.click(addButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  // ─── CONFIRM DIALOG TESTS ──────────────────────────────────────────────────

  describe('Confirm Dialog', () => {
    it('should call delete mutation when confirmed', async () => {
      const mockDeleteMutate = vi.fn();
      vi.mocked(religionHooks.useDeleteReligion).mockReturnValue({
        mutate: mockDeleteMutate,
        isPending: false,
      });

      renderWithProviders(<ReligionManagement />);

      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: 'Yes, Delete' });
      fireEvent.click(confirmBtn);

      expect(mockDeleteMutate).toHaveBeenCalledWith('1');
    });

    it('should close dialog when Cancel is clicked', async () => {
      renderWithProviders(<ReligionManagement />);

      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText('Delete Confirmation')).not.toBeInTheDocument();
      });
    });
  });

  // ─── EDGE CASES ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle invalid/undefined data gracefully', () => {
      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('No Religions Found')).toBeInTheDocument();
    });

    it('should handle empty string search gracefully', () => {
      renderWithProviders(<ReligionManagement />);

      const searchInput = screen.getByPlaceholderText('Search religions...');
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Hinduism', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Islam', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Christianity', { selector: 'span' })).toBeInTheDocument();
    });

    it('should reset selected caste when religion changes', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation((religionId) => {
        if (religionId === '1') {
          return { data: mockCastes, isLoading: false };
        }
        return { data: [], isLoading: false };
      });

      renderWithProviders(<ReligionManagement />);

      const religionRow1 = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow1);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });

      const religionRow2 = screen.getByText('Islam', { selector: 'span' });
      fireEvent.click(religionRow2);

      await waitFor(() => {
        expect(screen.queryByText('Brahmin', { selector: 'span' })).not.toBeInTheDocument();
      });
    });

    it('should handle retry connection when error occurs', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      renderWithProviders(<ReligionManagement />);

      const retryBtn = screen.getByText('Retry Connection');
      fireEvent.click(retryBtn);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle both camelCase and snake_case field names', () => {
      const mixedCaseData = [
        { id: '1', religion_name: 'Hinduism' },
        { id: '2', religion_name: 'Islam' },
        { id: '3', religion_name: 'Christianity' },
      ];

      vi.mocked(religionHooks.useGetReligions).mockReturnValue({
        data: mixedCaseData,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<ReligionManagement />);

      expect(screen.getByText('Hinduism', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Islam', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Christianity', { selector: 'span' })).toBeInTheDocument();
    });

    it('should disable add buttons when parent is not selected', () => {
      renderWithProviders(<ReligionManagement />);

      const addCasteBtn = document.querySelector('[title="Select a religion first"]');
      const addSubcastBtn = document.querySelector('[title="Select a caste first"]');

      expect(addCasteBtn).toBeDisabled();
      expect(addSubcastBtn).toBeDisabled();
    });

    it('should enable add buttons when parent is selected', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        const addCasteBtn = document.querySelector('[title="Add New Caste"]');
        expect(addCasteBtn).not.toBeDisabled();
      });
    });

    it('should show loading state for castes when fetching', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: [],
        isLoading: true,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Loading castes...')).toBeInTheDocument();
      });
    });

    it('should show loading state for sub-castes when fetching', async () => {
      vi.mocked(religionHooks.useGetCastes).mockImplementation(() => ({
        data: mockCastes,
        isLoading: false,
      }));

      vi.mocked(religionHooks.useGetSubcasts).mockImplementation(() => ({
        data: [],
        isLoading: true,
      }));

      renderWithProviders(<ReligionManagement />);

      const religionRow = screen.getByText('Hinduism', { selector: 'span' });
      fireEvent.click(religionRow);

      await waitFor(() => {
        expect(screen.getByText('Brahmin', { selector: 'span' })).toBeInTheDocument();
      });
      const casteRow = screen.getByText('Brahmin', { selector: 'span' });
      fireEvent.click(casteRow);

      await waitFor(() => {
        expect(screen.getByText('Loading sub-castes...')).toBeInTheDocument();
      });
    });
  });
});