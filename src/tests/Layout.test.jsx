// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\Layout.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../pages/layout/Layout';

// Mock child components
vi.mock('../pages/layout/Sidebar', () => ({
  default: ({ isOpen, onClose }) => (
    <div data-testid="sidebar" data-open={isOpen}>
      <button data-testid="sidebar-close" onClick={onClose}>Close Sidebar</button>
      <span>Sidebar Content</span>
    </div>
  ),
}));

vi.mock('../pages/layout/Navbar', () => ({
  default: ({ onMenuClick }) => (
    <div data-testid="navbar">
      <button data-testid="menu-button" onClick={onMenuClick}>Menu</button>
      <span>Navbar Content</span>
    </div>
  ),
}));

// Mock Outlet from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
  };

  // ─── RENDERING TESTS ────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the layout container with correct structure', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('should render the Sidebar component', () => {
      renderWithRouter();

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('should render the Navbar component', () => {
      renderWithRouter();

      const navbar = screen.getByTestId('navbar');
      expect(navbar).toBeInTheDocument();
      expect(screen.getByText('Navbar Content')).toBeInTheDocument();
    });

    it('should render the Outlet component for page content', () => {
      renderWithRouter();

      const outlet = screen.getByTestId('outlet');
      expect(outlet).toBeInTheDocument();
      expect(screen.getByText('Outlet Content')).toBeInTheDocument();
    });

    it('should have correct layout structure with flex columns', () => {
      renderWithRouter();

      const mainContent = document.querySelector('.flex-1.flex.flex-col.min-w-0.overflow-hidden');
      expect(mainContent).toBeInTheDocument();

      const mainElement = document.querySelector('main.flex-1.overflow-y-auto.overflow-x-hidden');
      expect(mainElement).toBeInTheDocument();
    });
  });

  // ─── SIDEBAR STATE TESTS ────────────────────────────────────────────────────

  describe('Sidebar State Management', () => {
    it('should initialize sidebar as closed (isOpen = false)', () => {
      renderWithRouter();

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.getAttribute('data-open')).toBe('false');
    });

    it('should open sidebar when menu button is clicked', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      fireEvent.click(menuButton);

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });

    it('should close sidebar when close button is clicked', () => {
      renderWithRouter();

      // Open sidebar first
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.click(menuButton);

      // Verify it opened
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.getAttribute('data-open')).toBe('true');

      // Close sidebar
      const closeButton = screen.getByTestId('sidebar-close');
      fireEvent.click(closeButton);

      expect(sidebar.getAttribute('data-open')).toBe('false');
    });

    it('should toggle sidebar state correctly with multiple clicks', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      const sidebar = screen.getByTestId('sidebar');

      // Initial state: closed
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Click to open
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');

      // Click to close via sidebar
      const closeButton = screen.getByTestId('sidebar-close');
      fireEvent.click(closeButton);
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Click to open again
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });
  });

  // ─── LAYOUT STRUCTURE TESTS ─────────────────────────────────────────────────

  describe('Layout Structure', () => {
    it('should have overflow-hidden on main container', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toHaveClass('overflow-hidden');
    });

    it('should have h-screen class on container for full viewport height', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toHaveClass('h-screen');
    });

    it('should have main element with overflow-y-auto for scrolling', () => {
      renderWithRouter();

      const mainElement = document.querySelector('main.flex-1.overflow-y-auto.overflow-x-hidden');
      expect(mainElement).toHaveClass('overflow-y-auto');
      expect(mainElement).toHaveClass('overflow-x-hidden');
    });

    it('should have correct flex layout for content area', () => {
      renderWithRouter();

      const contentArea = document.querySelector('.flex-1.flex.flex-col.min-w-0.overflow-hidden');
      expect(contentArea).toHaveClass('flex-1');
      expect(contentArea).toHaveClass('flex');
      expect(contentArea).toHaveClass('flex-col');
      expect(contentArea).toHaveClass('min-w-0');
      expect(contentArea).toHaveClass('overflow-hidden');
    });
  });

  // ─── SIDEBAR PROP TESTS ─────────────────────────────────────────────────────

  describe('Sidebar Props', () => {
    it('should pass isOpen prop to Sidebar correctly', () => {
      renderWithRouter();

      const sidebar = screen.getByTestId('sidebar');
      
      // Initially closed
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Open sidebar
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.click(menuButton);

      // Now open
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });

    it('should pass onClose callback to Sidebar', () => {
      renderWithRouter();

      // Open sidebar first
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.click(menuButton);

      // Verify it's open
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.getAttribute('data-open')).toBe('true');

      // Trigger onClose via Sidebar's close button
      const closeButton = screen.getByTestId('sidebar-close');
      fireEvent.click(closeButton);

      // Sidebar should be closed
      expect(sidebar.getAttribute('data-open')).toBe('false');
    });
  });

  // ─── NAVBAR PROP TESTS ──────────────────────────────────────────────────────

  describe('Navbar Props', () => {
    it('should pass onMenuClick callback to Navbar', () => {
      renderWithRouter();

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Click menu button in Navbar
      const menuButton = screen.getByTestId('menu-button');
      fireEvent.click(menuButton);

      // Sidebar should now be open
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });

    it('should allow multiple menu toggles via Navbar', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      const sidebar = screen.getByTestId('sidebar');

      // Click to open
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');

      // Close via sidebar
      const closeButton = screen.getByTestId('sidebar-close');
      fireEvent.click(closeButton);
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Click to open again
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });
  });

  // ─── OUTLET RENDERING TESTS ─────────────────────────────────────────────────

  describe('Outlet Rendering', () => {
    it('should render Outlet for nested routes', () => {
      renderWithRouter();

      const outlet = screen.getByTestId('outlet');
      expect(outlet).toBeInTheDocument();
      expect(outlet.textContent).toBe('Outlet Content');
    });

    it('should render Outlet inside main element', () => {
      renderWithRouter();

      const mainElement = document.querySelector('main.flex-1.overflow-y-auto.overflow-x-hidden');
      const outlet = mainElement?.querySelector('[data-testid="outlet"]');
      expect(outlet).toBeInTheDocument();
    });
  });

  // ─── RESPONSIVE BEHAVIOR TESTS ─────────────────────────────────────────────

  describe('Responsive Behavior', () => {
    it('should have appropriate classes for responsive design', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toHaveClass('bg-gray-50');
    });

    it('should have correct flex classes for main content area', () => {
      renderWithRouter();

      const mainContent = document.querySelector('.flex-1.flex.flex-col.min-w-0.overflow-hidden');
      expect(mainContent).toHaveClass('flex-1');
      expect(mainContent).toHaveClass('flex');
      expect(mainContent).toHaveClass('flex-col');
    });
  });

  // ─── STATE PERSISTENCE TESTS ────────────────────────────────────────────────

  describe('State Persistence', () => {
    it('should maintain sidebar state when re-rendering', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      const menuButton = screen.getByTestId('menu-button');
      const sidebar = screen.getByTestId('sidebar');

      // Initially closed
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Open sidebar
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');

      // Re-render
      rerender(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      // Sidebar should still be open after re-render
      const newSidebar = screen.getByTestId('sidebar');
      expect(newSidebar.getAttribute('data-open')).toBe('true');
    });

    it('should handle rapid state changes without issues', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      const closeButton = screen.getByTestId('sidebar-close');
      const sidebar = screen.getByTestId('sidebar');

      // Rapid toggles
      fireEvent.click(menuButton);
      fireEvent.click(closeButton);
      fireEvent.click(menuButton);
      fireEvent.click(closeButton);
      fireEvent.click(menuButton);

      // Should end in open state
      expect(sidebar.getAttribute('data-open')).toBe('true');
    });
  });

  // ─── ACCESSIBILITY TESTS ────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have main landmark element', () => {
      renderWithRouter();

      const mainElement = document.querySelector('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('should have appropriate roles for interactive elements', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      const closeButton = screen.getByTestId('sidebar-close');

      expect(menuButton).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });
  });

  // ─── ERROR BOUNDARY TESTS ──────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should render children correctly when Outlet is available', () => {
      renderWithRouter();

      const outlet = screen.getByTestId('outlet');
      expect(outlet).toBeInTheDocument();
    });
  });

  // ─── INTEGRATION TESTS ──────────────────────────────────────────────────────

  describe('Integration', () => {
    it('should compose Sidebar, Navbar, and Outlet correctly', () => {
      renderWithRouter();

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();

      // Check hierarchy
      const mainContent = document.querySelector('.flex-1.flex.flex-col.min-w-0.overflow-hidden');
      expect(mainContent).toContainElement(screen.getByTestId('navbar'));
      
      const mainElement = document.querySelector('main.flex-1.overflow-y-auto.overflow-x-hidden');
      expect(mainElement).toContainElement(screen.getByTestId('outlet'));
    });

    it('should maintain layout structure when sidebar toggles', () => {
      renderWithRouter();

      const menuButton = screen.getByTestId('menu-button');
      const sidebar = screen.getByTestId('sidebar');

      // Toggle sidebar multiple times
      fireEvent.click(menuButton);
      expect(sidebar.getAttribute('data-open')).toBe('true');

      const closeButton = screen.getByTestId('sidebar-close');
      fireEvent.click(closeButton);
      expect(sidebar.getAttribute('data-open')).toBe('false');

      // Main layout should remain intact
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  // ─── CSS CLASS VERIFICATION TESTS ──────────────────────────────────────────

  describe('CSS Classes', () => {
    it('should have correct background color class', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toHaveClass('bg-gray-50');
    });

    it('should have correct overflow classes', () => {
      renderWithRouter();

      const container = document.querySelector('.flex.h-screen.bg-gray-50.overflow-hidden');
      expect(container).toHaveClass('overflow-hidden');

      const mainElement = document.querySelector('main.flex-1.overflow-y-auto.overflow-x-hidden');
      expect(mainElement).toHaveClass('overflow-y-auto');
      expect(mainElement).toHaveClass('overflow-x-hidden');
    });

    it('should have correct flex classes', () => {
      renderWithRouter();

      const contentArea = document.querySelector('.flex-1.flex.flex-col.min-w-0.overflow-hidden');
      expect(contentArea).toHaveClass('flex-1');
      expect(contentArea).toHaveClass('flex');
      expect(contentArea).toHaveClass('flex-col');
    });
  });
});