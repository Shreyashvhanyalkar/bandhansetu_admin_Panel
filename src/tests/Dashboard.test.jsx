// D:\Euspace_bandhansetu\BandhanSetuAdmin\BandhanSetuAdmin\src\tests\Dashboard.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/admin/Dashboard';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
    Bar: ({ data, options }) => <div data-testid="bar-chart" data-chart-type="bar">Bar Chart</div>,
    Line: ({ data, options }) => <div data-testid="line-chart" data-chart-type="line">Line Chart</div>,
    Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithProviders = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-15T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // ─── RENDERING TESTS ────────────────────────────────────────────────────────

    describe('Rendering', () => {
        it('should render the welcome banner with admin greeting', () => {
            renderWithProviders();
            expect(screen.getByText('Welcome Back, Admin')).toBeInTheDocument();
            expect(screen.getByText('System Console')).toBeInTheDocument();
        });

        it('should render the server status with current time', () => {
            renderWithProviders();
            expect(screen.getByText('Server Status')).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('12:00:00'))).toBeInTheDocument();
        });

        it('should render all stat cards', () => {
            renderWithProviders();

            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('4,821')).toBeInTheDocument();
            expect(screen.getByText('Active Requests')).toBeInTheDocument();
            expect(screen.getByText('318')).toBeInTheDocument();
            expect(screen.getByText('Pending Approvals')).toBeInTheDocument();

            // Use getAllByText for values that appear multiple times
            const pendingValues = screen.getAllByText('47');
            expect(pendingValues.length).toBeGreaterThan(0);

            expect(screen.getByText('Completed Matches')).toBeInTheDocument();

            // Use getAllByText for "1,204" since it appears in both stat card and doughnut
            const completedValues = screen.getAllByText('1,204');
            expect(completedValues.length).toBeGreaterThan(0);

            expect(screen.getByText('Approval Rate')).toBeInTheDocument();
            expect(screen.getByText('78%')).toBeInTheDocument();
        });

        it('should render the analytics header', () => {
            renderWithProviders();
            expect(screen.getByText('Platform Analytics')).toBeInTheDocument();
            expect(screen.getByText('Configure date ranges and download CSV reports.')).toBeInTheDocument();
        });

        it('should render the date range selector', () => {
            renderWithProviders();
            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue('Last 30 days');
        });

        it('should render the Export Report button', () => {
            renderWithProviders();
            expect(screen.getByText('Export Report')).toBeInTheDocument();
        });

        it('should render the chart component', () => {
            renderWithProviders();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('should render the doughnut chart for distribution', () => {
            renderWithProviders();
            expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
        });

        it('should render distribution breakdown labels', () => {
            renderWithProviders();
            expect(screen.getByText('Approved')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('Rejected')).toBeInTheDocument();
        });

        it('should render recent activities section', () => {
            renderWithProviders();
            expect(screen.getByText('Recent Activity')).toBeInTheDocument();
            expect(screen.getByText('Latest platform events')).toBeInTheDocument();
        });

        it('should render all recent activities', () => {
            renderWithProviders();

            expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
            expect(screen.getByText('registered a new account')).toBeInTheDocument();
            expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
            expect(screen.getByText('match request approved')).toBeInTheDocument();
            expect(screen.getByText('Anjali Patel')).toBeInTheDocument();
            expect(screen.getByText('updated profile details')).toBeInTheDocument();
            expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
            expect(screen.getByText('submitted a new request')).toBeInTheDocument();
            expect(screen.getByText('Neha Gupta')).toBeInTheDocument();
            expect(screen.getByText('profile under verification')).toBeInTheDocument();
        });

        it('should render quick actions section', () => {
            renderWithProviders();
            expect(screen.getByText('Quick Actions')).toBeInTheDocument();
            expect(screen.getByText('Common admin shortcuts')).toBeInTheDocument();
        });

        it('should render all quick action buttons', () => {
            renderWithProviders();

            expect(screen.getByText('Manage Staff')).toBeInTheDocument();
            expect(screen.getByText('Verify Requests')).toBeInTheDocument();
            expect(screen.getByText('Send Push')).toBeInTheDocument();
            expect(screen.getByText('Admin Settings')).toBeInTheDocument();
        });

        it('should render mini KPI strip', () => {
            renderWithProviders();

            expect(screen.getByText("Today's Joins")).toBeInTheDocument();
            expect(screen.getByText('24')).toBeInTheDocument();
            expect(screen.getByText('Verified')).toBeInTheDocument();
            expect(screen.getByText('186')).toBeInTheDocument();
            expect(screen.getByText('Flagged')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should render footer text', () => {
            renderWithProviders();
            expect(screen.getByText(/© 2026 BandhanSetu Admin/)).toBeInTheDocument();
        });
    });

    // ─── USER INTERACTION TESTS ─────────────────────────────────────────────────

    describe('User Interactions', () => {
        it('should switch chart type from bar to line when line button is clicked', () => {
            renderWithProviders();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

            const lineButton = screen.getByText('line');
            fireEvent.click(lineButton);

            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });

        it('should switch chart type from line to bar when bar button is clicked', () => {
            renderWithProviders();

            fireEvent.click(screen.getByText('line'));
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();

            fireEvent.click(screen.getByText('bar'));
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('should navigate to /admin/sub-admins when Manage Staff is clicked', () => {
            renderWithProviders();

            const manageStaffBtn = screen.getByText('Manage Staff');
            fireEvent.click(manageStaffBtn);

            expect(mockNavigate).toHaveBeenCalledWith('/admin/sub-admins');
        });

        it('should navigate to /admin/requests when Verify Requests is clicked', () => {
            renderWithProviders();

            const verifyBtn = screen.getByText('Verify Requests');
            fireEvent.click(verifyBtn);

            expect(mockNavigate).toHaveBeenCalledWith('/admin/requests');
        });

        it('should navigate to /admin/notifications when Send Push is clicked', () => {
            renderWithProviders();

            const sendPushBtn = screen.getByText('Send Push');
            fireEvent.click(sendPushBtn);

            expect(mockNavigate).toHaveBeenCalledWith('/admin/notifications');
        });

        it('should navigate to /admin/admin-profile when Admin Settings is clicked', () => {
            renderWithProviders();

            const settingsBtn = screen.getByText('Admin Settings');
            fireEvent.click(settingsBtn);

            expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
        });

       it('should show "Exporting…" text when Export Report is clicked', () => {
  renderWithProviders();
  fireEvent.click(screen.getByText('Export Report'));
  expect(screen.getByText('Exporting…')).toBeInTheDocument();
});

it('should revert Export button text after download completes', async () => {
  renderWithProviders();
  fireEvent.click(screen.getByText('Export Report'));
  expect(screen.getByText('Exporting…')).toBeInTheDocument();

  await vi.advanceTimersByTimeAsync(1500);

  expect(screen.getByText('Export Report')).toBeInTheDocument();
});

        it('should have View All link in recent activities', () => {
            renderWithProviders();
            expect(screen.getByText('View All →')).toBeInTheDocument();
        });
    });

    // ─── STAT CARD TESTS ───────────────────────────────────────────────────────

    describe('Stat Cards', () => {
        it('should display correct values for each stat', () => {
            renderWithProviders();

            expect(screen.getByText('4,821')).toBeInTheDocument();
            expect(screen.getByText('318')).toBeInTheDocument();

            // Use getAllByText for values that appear multiple times
            const pendingValues = screen.getAllByText('47');
            expect(pendingValues.length).toBeGreaterThan(0);

            // Use getAllByText for "1,204" since it appears in both stat card and doughnut
            const completedValues = screen.getAllByText('1,204');
            expect(completedValues.length).toBeGreaterThan(0);

            expect(screen.getByText('78%')).toBeInTheDocument();
        });

        it('should display badges with correct text', () => {
            renderWithProviders();

            expect(screen.getByText('+12% this month')).toBeInTheDocument();
            expect(screen.getByText('+5% this week')).toBeInTheDocument();
            expect(screen.getByText('Needs review')).toBeInTheDocument();
            expect(screen.getByText('+18% all time')).toBeInTheDocument();
            expect(screen.getByText('Above average')).toBeInTheDocument();
        });
    });

    // ─── DOUGHNUT CHART TESTS ──────────────────────────────────────────────────

    describe('Doughnut Chart', () => {
        it('should display total count in center of doughnut', () => {
            renderWithProviders();

            // Total = completedMatches + pendingApprovals + (activeRequests - pendingApprovals)
            // = 1204 + 47 + (318 - 47) = 1522
            expect(screen.getByText('1,522')).toBeInTheDocument();
        });
    });
});