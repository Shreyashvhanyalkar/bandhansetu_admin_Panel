import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Reports from '../pages/admin/Reports';

const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('Reports Component', () => {
  it('should render the Reports page header and stats', () => {
    renderWithRouter(<Reports />);
    expect(screen.getAllByText('Reports & Moderation').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Manage user complaints/i).length).toBeGreaterThan(0);

    // Stats cards
    expect(screen.getAllByText('Total Reports').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Warned Users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Blocked Users').length).toBeGreaterThan(0);
  });

  it('should list complaints with details', () => {
    renderWithRouter(<Reports />);

    // Check presence of some reporters/reported users from static data
    expect(screen.getAllByText('Priya Sharma').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rahul Mehta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Harassment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fake Profile').length).toBeGreaterThan(0);
  });

  it('should filter complaints by search input', () => {
    renderWithRouter(<Reports />);

    const searchInput = screen.getByPlaceholderText(/Search by user, reporter, reason, or description/i);
    
    // Search for Harassment
    fireEvent.change(searchInput, { target: { value: 'Harassment' } });

    // Harassment reports should be there
    expect(screen.getAllByText('Priya Sharma').length).toBeGreaterThan(0);
    // Fake Profile reports like Rahul Mehta should be filtered out
    expect(screen.queryByText('Rahul Mehta')).toBeNull();
  });

  it('should open warn action modal and execute warning', async () => {
    renderWithRouter(<Reports />);

    // Hover the first complaint row to make buttons visible (they are opacity-0 until hover)
    const complaintRows = document.querySelectorAll('.group.relative.bg-white');
    if (complaintRows.length > 0) {
      fireEvent.mouseEnter(complaintRows[0]);
    }

    // Find Warn buttons by text (they exist in DOM even when invisible)
    const warnButtons = screen.getAllByText(/⚠️ Warn/);
    fireEvent.click(warnButtons[0]);

    // Modal should be open — wait for it since it's state-driven
    expect(await screen.findByText(/Send Warning/i)).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirm Action/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Send Warning/i)).toBeNull();
    }, { timeout: 2000 });
  });

  it('should open block action modal and execute blocking', async () => {
    renderWithRouter(<Reports />);

    // Hover the first complaint row
    const complaintRows = document.querySelectorAll('.group.relative.bg-white');
    if (complaintRows.length > 0) {
      fireEvent.mouseEnter(complaintRows[0]);
    }

    // Click block button
    const blockButtons = screen.getAllByText(/🚫 Block/);
    fireEvent.click(blockButtons[0]);

    // Modal should appear — wait for it
    expect(await screen.findByText(/Block User/i, {}, { timeout: 2000 })).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirm Action/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Block User/i)).toBeNull();
    }, { timeout: 2000 });
  });
});
