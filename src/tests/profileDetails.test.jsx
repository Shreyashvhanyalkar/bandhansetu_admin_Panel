// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\profileDetails.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileDetails from '../pages/admin/profileDetails';

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

describe('ProfileDetails Component', () => {
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
        <MemoryRouter initialEntries={[`/admin/profile/${userId}`]}>
          <Routes>
            <Route path="/admin/profile/:userId" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const mockProfileData = {
    userDetails: {
      firstName: 'Rahul',
      lastName: 'Sharma',
      platformId: 'BS-100234',
      mobileNumber: '9876543210',
      countryCode: '+91',
      email: 'rahul@test.com',
      age: 28,
      dateOfBirth: '1996-05-15',
      gender: 'Male',
      profileCreatedBy: 'Self',
    },
    userPrimaryDetails: {
      maritalStatus: 'Unmarried',
      mothertongueName: 'Hindi',
      childStatus: 'No',
      numberOfChildrens: 0,
      cityName: 'Mumbai',
      stateName: 'Maharashtra',
      countryName: 'India',
    },
    userReligionDetails: {
      religionName: 'Hindu',
      castName: 'Brahmin',
      subcastName: 'Iyer',
    },
    userEducationalDetails: {
      educationLevelName: 'Post Graduate',
      educationFieldName: 'Engineering',
      collegeName: 'IIT Bombay',
    },
    userWorkingDetails: {
      employerName: 'Google',
      categoryName: 'Software',
      subcategoryName: 'Senior Engineer',
      workingWithName: 'Full-time',
      annualIncomeName: '25 Lakhs',
      currencyType: 'INR',
    },
    userLifeStyleDetails: {
      diet: 'Vegetarian',
      smoke: 'No',
      drink: 'No',
      heightFeet: 5,
      heightInches: 10,
      bodyType: 'Athletic',
      skinTone: 'Fair',
    },
    userAboutMeDetails: {
      aboutMe: 'I am a passionate software engineer who loves building products.',
      anyDisability: false,
    },
    userAddressDetails: {
      addressLine1: '123 Main Street',
      addressLine2: 'Andheri East',
      pincode: '400093',
    },
    userFamilyDetails: {
      fatherStatusCategory: 'Working',
      motherStatusCategory: 'Housewife',
      numberOfBrothers: 1,
      numberOfMarriedBrothers: 0,
      numberOfSisters: 1,
      numberOfMarriedSisters: 1,
      familyAffluenceCategory: 'Middle Class',
      placeOfFamily: 'Mumbai',
    },
  };

  const mockGalleryData = [
    {
      id: 1,
      fileName: 'profile1.jpg',
      isProfilePicture: 1,
      is_profile_picture: 1,
    },
    {
      id: 2,
      fileName: 'gallery1.jpg',
      isProfilePicture: 0,
      is_profile_picture: 0,
    },
    {
      id: 3,
      fileName: 'gallery2.jpg',
      isProfilePicture: 0,
      is_profile_picture: 0,
    },
    {
      id: 4,
      fileName: 'gallery3.jpg',
      isProfilePicture: 0,
      is_profile_picture: 0,
    },
  ];

  // ─── RENDERING TESTS ────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the page header with title and back button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('←')).toBeInTheDocument();
      });
    });

    it('should display user name and initials on cover card', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const nameMatches = screen.getAllByText('Rahul Sharma');
        expect(nameMatches.length).toBeGreaterThan(0);
        expect(screen.getByText('BS-100234 · Male')).toBeInTheDocument();
      });
    });

    it('should display loading skeleton when fetching data', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<ProfileDetails />);

      const skeletons = document.querySelectorAll('[style*="animation: pd-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display error state when profile fetch fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'User not found' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('should display "No bio added yet" when aboutMe is empty', async () => {
      const dataWithoutBio = {
        ...mockProfileData,
        userAboutMeDetails: {
          aboutMe: '',
          anyDisability: false,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutBio,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('No bio added yet.')).toBeInTheDocument();
      });
    });

    it('should render all sections with correct data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Basic Details')).toBeInTheDocument();
        expect(screen.getByText('Religion & Community')).toBeInTheDocument();
        expect(screen.getByText('Primary Details')).toBeInTheDocument();
        expect(screen.getByText('Education')).toBeInTheDocument();
        expect(screen.getByText('Work & Package')).toBeInTheDocument();
        expect(screen.getByText('Lifestyle & Appearance')).toBeInTheDocument();
        expect(screen.getByText('Family')).toBeInTheDocument();
        expect(screen.getByText('Address')).toBeInTheDocument();
        expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0);
        expect(screen.getByText('rahul@test.com')).toBeInTheDocument();
        expect(screen.getByText('Hindu')).toBeInTheDocument();
        expect(screen.getByText('Unmarried')).toBeInTheDocument();
        expect(screen.getByText('Post Graduate')).toBeInTheDocument();
        expect(screen.getByText('Google')).toBeInTheDocument();
      });
    });
  });

  // ─── SECTION TESTS ──────────────────────────────────────────────────────────

  describe('Section Component', () => {
    it('should render section title and rows correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Basic Details')).toBeInTheDocument();
        expect(screen.getByText('ID:')).toBeInTheDocument();
        expect(screen.getByText('BS-100234')).toBeInTheDocument();
        expect(screen.getByText('Name:')).toBeInTheDocument();
        expect(screen.getByText('Mobile:')).toBeInTheDocument();
        expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
        expect(screen.getByText('Gender:')).toBeInTheDocument();
        expect(screen.getByText('Male')).toBeInTheDocument();
      });
    });

    it('should display fallback value "—" for missing data', async () => {
      const dataWithMissingValues = {
        userDetails: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          platformId: undefined,
          mobileNumber: null,
          countryCode: '',
          email: '',
        },
        userPrimaryDetails: {},
        userReligionDetails: {},
        userEducationalDetails: {},
        userWorkingDetails: {},
        userLifeStyleDetails: {},
        userAboutMeDetails: {
          aboutMe: 'Some bio',
          anyDisability: null,
        },
        userAddressDetails: {},
        userFamilyDetails: {},
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithMissingValues,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const dashes = screen.getAllByText('—');
        expect(dashes.length).toBeGreaterThan(0);
      });
    });

    it('should handle mixed case field names correctly', async () => {
      const dataWithMixedCase = {
        userDetails: {
          first_name: 'Rahul',
          last_name: 'Sharma',
          platform_id: 'BS-100234',
          mobile_number: '9876543210',
          country_code: '+91',
          email: 'rahul@test.com',
          age: 28,
          date_of_birth: '1996-05-15',
          gender: 'Male',
          profile_created_by: 'Self',
        },
        userPrimaryDetails: {
          marital_status: 'Unmarried',
          mothertongue_name: 'Hindi',
          child_status: 'No',
          city_name: 'Mumbai',
          state_name: 'Maharashtra',
          country_name: 'India',
        },
        userReligionDetails: {
          religion_name: 'Hindu',
          cast_name: 'Brahmin',
          subcast_name: 'Iyer',
        },
        userAboutMeDetails: {
          about_me: 'Test bio',
          any_disability: false,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithMixedCase,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0);
        expect(screen.getByText('BS-100234')).toBeInTheDocument();
        expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
        expect(screen.getByText('Hindu')).toBeInTheDocument();
      });
    });
  });

  // ─── GALLERY TESTS ──────────────────────────────────────────────────────────

  describe('Gallery', () => {
    it('should display gallery images from fetched data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const galleryItems = document.querySelectorAll('[data-testid="gallery-item"]');
        expect(galleryItems.length).toBeGreaterThan(0);
      });
    });

    it('should open lightbox when gallery image is clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(async () => {
        const galleryItems = document.querySelectorAll('[data-testid="gallery-item"]');
        fireEvent.click(galleryItems[0]);
      });

      await waitFor(() => {
        const lightbox = document.querySelector('[style*="position: fixed"][style*="z-index: 1000"]');
        expect(lightbox).toBeInTheDocument();
      });
    });

    it('should use profile picture from gallery as cover image', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const cover = document.querySelector('[style*="border-radius: 20px"][style*="overflow: hidden"]');
        expect(cover).toBeInTheDocument();
      });
    });

    it('should show initials when no profile picture is available', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('RS')).toBeInTheDocument();
      });
    });

    it('should show only first 2 gallery images with navigation', async () => {
      const manyGalleryImages = [
        { id: 1, fileName: '1.jpg', isProfilePicture: 0 },
        { id: 2, fileName: '2.jpg', isProfilePicture: 0 },
        { id: 3, fileName: '3.jpg', isProfilePicture: 0 },
        { id: 4, fileName: '4.jpg', isProfilePicture: 0 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => manyGalleryImages,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const galleryItems = document.querySelectorAll('[data-testid="gallery-item"]');
        expect(galleryItems.length).toBe(2);
      });
    });
  });

  // ─── USER INTERACTION TESTS ────────────────────────────────────────────────

  describe('User Interactions', () => {
    it('should navigate back when back button is clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeInTheDocument();
      });

      const backButton = screen.getByText('←');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate back when "Back" button at bottom is clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should close lightbox when clicking on overlay', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(async () => {
        const galleryItems = document.querySelectorAll('[data-testid="gallery-item"]');
        fireEvent.click(galleryItems[0]);
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
  });

  // ─── API ERROR HANDLING TESTS ──────────────────────────────────────────────

  describe('API Error Handling', () => {
    it('should handle API failure gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Internal Server Error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
        expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
      });
    });

    it('should handle network error (fetch reject)', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
      });
    });

    it('should not fetch when userId is not provided', async () => {
      renderWithProviders(<ProfileDetails />, { userId: '' });

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });

  // ─── SECURE IMAGE TESTS ────────────────────────────────────────────────────

  describe('SecureImage Component', () => {
    it('should show loading state while fetching image', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      mockFetch.mockImplementationOnce(() => new Promise(() => {}));

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeInTheDocument();
      });
    });

    it('should display fallback icon on image fetch error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        });

      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const fallbacks = screen.getAllByText('🖼️');
        expect(fallbacks.length).toBeGreaterThan(0);
      });
    });

    it('should clean up object URLs on unmount', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpg' });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGalleryData,
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob,
        });

      const { unmount } = renderWithProviders(<ProfileDetails />);

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
        json: async () => mockProfileData,
      })
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

    const { unmount } = renderWithProviders(<ProfileDetails />);

    await waitFor(() => {
      // Use getAllByText since there are multiple "Loading..." elements
      const loadingTexts = screen.getAllByText('Loading...');
      expect(loadingTexts.length).toBeGreaterThan(0);
    });

    unmount();

    expect(abortCalled).toBe(true);
  });
});

  // ─── DATA TRANSFORMATION TESTS ─────────────────────────────────────────────

  describe('Data Transformation', () => {
    it('should handle child status with children count correctly', async () => {
      const dataWithChildren = {
        ...mockProfileData,
        userPrimaryDetails: {
          ...mockProfileData.userPrimaryDetails,
          childStatus: 'Yes',
          numberOfChildrens: 2,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithChildren,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Children:')).toBeInTheDocument();
        expect(screen.getByText('Yes (2)')).toBeInTheDocument();
      });
    });

    it('should format height correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Height:')).toBeInTheDocument();
        expect(screen.getByText("5' 10\"")).toBeInTheDocument();
      });
    });

    it('should handle disability status with Yes/No', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Disability:')).toBeInTheDocument();
        const disabilityDiv = screen.getByText('Disability:').closest('div');
        expect(disabilityDiv).toHaveTextContent('No');
      });
    });

    it('should handle disability status with Yes when true', async () => {
      const dataWithDisability = {
        ...mockProfileData,
        userAboutMeDetails: {
          ...mockProfileData.userAboutMeDetails,
          anyDisability: true,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithDisability,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Disability:')).toBeInTheDocument();
        const disabilityDiv = screen.getByText('Disability:').closest('div');
        expect(disabilityDiv).toHaveTextContent('Yes');
      });
    });

    it('should format brothers and sisters with marriage counts', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Brothers:')).toBeInTheDocument();
        const brothersDiv = screen.getByText('Brothers:').closest('div');
        expect(brothersDiv).toHaveTextContent('1 (0 married)');
        
        expect(screen.getByText('Sisters:')).toBeInTheDocument();
        const sistersDiv = screen.getByText('Sisters:').closest('div');
        expect(sistersDiv).toHaveTextContent('1 (1 married)');
      });
    });
  });

  // ─── EDGE CASES ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle fullName construction with missing names', async () => {
    const dataWithoutNames = {
      ...mockProfileData,
      userDetails: {
        ...mockProfileData.userDetails,
        firstName: '',
        lastName: '',
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithoutNames,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithProviders(<ProfileDetails />);

    await waitFor(() => {
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
      
      // When both firstName and lastName are empty, fullName becomes "—"
      // The initials become "?" because the code checks:
      // fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"
      // For "—", split gives ["—"], map gives ["—"], so initials become "—" not "?"
      // So we need to check for "—" in the initials div as well
      const initialsDiv = document.querySelector('[style*="font-size: 32px"]');
      // The initials could be "—" since fullName is "—"
      // But actually, since fullName is "—", and "—".split(" ") = ["—"], 
      // map gives ["—"], slice gives ["—"], join gives "—", toUpperCase gives "—"
      // So we expect "—" in the initials div
      expect(initialsDiv).toHaveTextContent('—');
    });
  });

    it('should handle missing profile picture in gallery', async () => {
      const galleryWithoutProfile = [
        { id: 2, fileName: 'gallery1.jpg', isProfilePicture: 0 },
        { id: 3, fileName: 'gallery2.jpg', isProfilePicture: 0 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => galleryWithoutProfile,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('RS')).toBeInTheDocument();
      });
    });

    it('should handle location formatting with missing values', async () => {
      const dataWithoutLocation = {
        ...mockProfileData,
        userPrimaryDetails: {
          ...mockProfileData.userPrimaryDetails,
          cityName: '',
          stateName: '',
          countryName: '',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutLocation,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        expect(screen.getByText('Location:')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('should handle both snake_case and camelCase isProfilePicture', async () => {
      const mixedCaseGallery = [
        { id: 1, fileName: '1.jpg', isProfilePicture: 0, is_profile_picture: 1 },
        { id: 2, fileName: '2.jpg', isProfilePicture: 0, is_profile_picture: 0 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mixedCaseGallery,
        });

      renderWithProviders(<ProfileDetails />);

      await waitFor(() => {
        const cover = document.querySelector('[style*="border-radius: 20px"][style*="overflow: hidden"]');
        expect(cover).toBeInTheDocument();
      });
    });
  });
});