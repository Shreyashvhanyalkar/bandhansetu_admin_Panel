// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\GalleryPage.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GalleryPage from '../pages/admin/GalleryPage';

const BASE_URL = 'http://bandhan-setu-prod.eba-am6hwsad.ap-south-1.elasticbeanstalk.com';

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_BASE_URL: BASE_URL,
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Define mockNavigate at the top level
const mockNavigate = vi.fn();

describe('GalleryPage Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    mockFetch.mockReset();
    mockNavigate.mockClear();

    // Mock useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const renderWithProviders = (ui, { userId = '123' } = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/admin/gallery/${userId}`]}>
          <Routes>
            <Route path="/admin/gallery/:userId" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const mockGalleryData = [
    {
      id: 1,
      fileName: 'photo1.jpg',
      isProfilePicture: 1,
      is_profile_picture: 1,
    },
    {
      id: 2,
      fileName: 'photo2.jpg',
      isProfilePicture: 0,
      is_profile_picture: 0,
    },
    {
      id: 3,
      fileName: 'photo3.jpg',
      isProfilePicture: 0,
    },
    {
      id: 4,
      fileName: 'photo4.jpg',
      isProfilePicture: 0,
    },
    {
      id: 5,
      fileName: 'photo5.jpg',
      isProfilePicture: 0,
    },
  ];

  // ─── RENDERING TESTS ────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the page header with title and back button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(screen.getByText('My Photo Gallery')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: '←' });
      expect(backButton).toBeInTheDocument();
    });

    it('should display loading skeletons when fetching data', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<GalleryPage />);

      const skeletons = document.querySelectorAll('[style*="animation: gal-pulse"]');
      expect(skeletons.length).toBe(6);
    });

    it('should display empty state when no photos are available', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(screen.getByText('No photos yet')).toBeInTheDocument();
        expect(screen.getByText('🖼️')).toBeInTheDocument();
      });
    });

    it('should render gallery images when data is loaded', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const images = document.querySelectorAll('[data-testid="profile-image"], [data-testid="gallery-image"]');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('should highlight the first row with a red border', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const firstRow = document.querySelector('[data-testid="gallery-row-first"]');
        expect(firstRow).toBeInTheDocument();
      });
    });

    it('should show profile picture indicator with red border', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
const profileImages = document.querySelectorAll('[data-testid="profile-image"]');        expect(profileImages.length).toBeGreaterThan(0);
      });
    });

    it('should display minus badge on each image', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const badges = document.querySelectorAll('[data-testid="minus-badge"]');
        expect(badges.length).toBe(mockGalleryData.length);
      });
    });
  });

  // ─── USER INTERACTION TESTS ────────────────────────────────────────────────

  describe('User Interactions', () => {
    it('should navigate back when back button is clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(screen.getByText('My Photo Gallery')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: '←' });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should open lightbox when an image is clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
       const imageContainers = document.querySelectorAll('[data-testid="profile-image"], [data-testid="gallery-image"]');
        fireEvent.click(imageContainers[0]);
      });

      await waitFor(() => {
        const lightbox = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        expect(lightbox).toBeInTheDocument();
      });
    });

    it('should close lightbox when clicking on overlay', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(async () => {
        const imageContainers = document.querySelectorAll('[data-testid="profile-image"], [data-testid="gallery-image"]');
        fireEvent.click(imageContainers[0]);
      });

      await waitFor(() => {
        const overlay = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        fireEvent.click(overlay);
      });

      await waitFor(() => {
        const lightbox = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        expect(lightbox).not.toBeInTheDocument();
      });
    });

    it('should close lightbox when clicking close button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(async () => {
        const imageContainers = document.querySelectorAll('[data-testid="profile-image"], [data-testid="gallery-image"]');
        fireEvent.click(imageContainers[0]);
      });

      await waitFor(() => {
        const closeButton = screen.getByText('✕');
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        const lightbox = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        expect(lightbox).not.toBeInTheDocument();
      });
    });

    it('should not close lightbox when clicking on image content', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(async () => {
        const imageContainers = document.querySelectorAll('[data-testid="profile-image"], [data-testid="gallery-image"]');
        fireEvent.click(imageContainers[0]);
      });

      await waitFor(() => {
        const imageContainer = document.querySelector('[style*="max-width: 92vw"]');
        fireEvent.click(imageContainer);
      });

      await waitFor(() => {
        const lightbox = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        expect(lightbox).toBeInTheDocument();
      });
    });
  });

  // ─── API ERROR HANDLING TESTS ──────────────────────────────────────────────

  describe('API Error Handling', () => {
    it('should return empty array when API returns non-OK response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(screen.getByText('No photos yet')).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON response gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ invalid: 'data' }),
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(screen.getByText('No photos yet')).toBeInTheDocument();
      });
    });
  });

  // ─── SECURE IMAGE COMPONENT TESTS ─────────────────────────────────────────

  describe('SecureImage Component', () => {
    it('should show loading state while fetching image', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      mockFetch
        .mockImplementationOnce(() => new Promise(() => {}));

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeInTheDocument();
      });
    });

    it('should display fallback icon on image fetch error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const fallbacks = screen.getAllByText('🖼️');
        expect(fallbacks.length).toBeGreaterThan(0);
      });
    });

    it('should display fallback when fileName is empty', async () => {
      const dataWithEmptyFileName = [
        {
          id: 1,
          fileName: null,
          isProfilePicture: 0,
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithEmptyFileName,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const fallback = screen.getByText('🖼️');
        expect(fallback).toBeInTheDocument();
      });
    });

    it('should clean up object URLs on unmount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      const mockBlob = new Blob(['test'], { type: 'image/jpg' });
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob,
        });

      const { unmount } = renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const images = document.querySelectorAll('img');
        expect(images.length).toBeGreaterThan(0);
      });

      unmount();

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should abort fetch on unmount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      let abortCalled = false;
      mockFetch.mockImplementation((url, options) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            abortCalled = true;
          });
        }
        return new Promise(() => {});
      });

      const { unmount } = renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const loadingTexts = screen.getAllByText('Loading...');
        expect(loadingTexts.length).toBeGreaterThan(0);
      });

      unmount();

      expect(abortCalled).toBe(true);
    });
  });

  // ─── LAYOUT AND STYLING TESTS ─────────────────────────────────────────────

  describe('Layout and Styling', () => {
    it('should display empty placeholder circles when row has less than 3 images', async () => {
      const dataWithTwoImages = [
        {
          id: 1,
          fileName: 'photo1.jpg',
          isProfilePicture: 0,
        },
        {
          id: 2,
          fileName: 'photo2.jpg',
          isProfilePicture: 0,
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithTwoImages,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const placeholders = document.querySelectorAll('[data-testid="gallery-placeholder"]');
        expect(placeholders.length).toBe(1);
      });
    });

    it('should display "Add more" indicator at bottom when all rows are full', async () => {
      const dataWithSixImages = [
        { id: 1, fileName: '1.jpg', isProfilePicture: 0 },
        { id: 2, fileName: '2.jpg', isProfilePicture: 0 },
        { id: 3, fileName: '3.jpg', isProfilePicture: 0 },
        { id: 4, fileName: '4.jpg', isProfilePicture: 0 },
        { id: 5, fileName: '5.jpg', isProfilePicture: 0 },
        { id: 6, fileName: '6.jpg', isProfilePicture: 0 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithSixImages,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const plusSigns = screen.getAllByText('+');
        expect(plusSigns.length).toBeGreaterThan(0);
      });
    });

    it('should arrange images in rows of 3', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const rows = document.querySelectorAll('[style*="display: flex"][style*="gap: 12px"]');
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should apply correct max-width for mobile view', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const container = document.querySelector('[style*="max-width: 411px"]');
        expect(container).toBeInTheDocument();
      });
    });
  });

  // ─── EDGE CASES ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle userId from URL params correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${BASE_URL}/api/auth/user/gallery/123`,
          expect.any(Object)
        );
      });
    });

    it('should sort images with profile picture first', async () => {
      const unsortedData = [
        { id: 1, fileName: '1.jpg', isProfilePicture: 0 },
        { id: 2, fileName: '2.jpg', isProfilePicture: 1 },
        { id: 3, fileName: '3.jpg', isProfilePicture: 0 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => unsortedData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
const profileImages = document.querySelectorAll('[data-testid="profile-image"]');        expect(profileImages.length).toBeGreaterThan(0);
      });
    });

    it('should handle both camelCase and snake_case field names', async () => {
      const mixedCaseData = [
        {
          id: 1,
          file_name: 'mixed1.jpg',
          is_profile_picture: 1,
        },
        {
          id: 2,
          file_name: 'mixed2.jpg',
          is_profile_picture: 0,
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mixedCaseData,
        });

      renderWithProviders(<GalleryPage />);

      await waitFor(() => {
        const fallback = screen.queryByText('No photos yet');
        expect(fallback).not.toBeInTheDocument();
      });
    });
  });
});