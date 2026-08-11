import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubAdminManagement from '../pages/admin/SubAdminManagement';

describe('SubAdminManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Sub Admin Management heading', () => {
    render(<SubAdminManagement />);
    expect(screen.getByText('Sub Admin Management')).toBeInTheDocument();
    expect(screen.getByText(/Manage sub admins/i)).toBeInTheDocument();
  });

  it('should display the list of sub-admins', () => {
    render(<SubAdminManagement />);
    
    // Check for some names from INITIAL_SUB_ADMINS
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Verma')).toBeInTheDocument();
    expect(screen.getByText('amit.patel@bandhan.com')).toBeInTheDocument();
  });

  it('should open the Add Sub Admin drawer when clicking the button', () => {
    render(<SubAdminManagement />);
    
    // Initial state: Add button is visible
    const addButton = screen.getAllByText('Add Sub Admin')[0];
    fireEvent.click(addButton);

    // Verify drawer headers/fields are rendered
    expect(screen.getAllByText('Add Sub Admin').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@bandhan.com')).toBeInTheDocument();
  });

  it('should filter the list of sub-admins based on search input', () => {
    render(<SubAdminManagement />);

    const searchInput = screen.getByPlaceholderText(/Search by name, email or address/i);
    fireEvent.change(searchInput, { target: { value: 'Priya' } });

    // Priya should be present
    expect(screen.getAllByText('Priya Verma').length).toBeGreaterThan(0);
    // Amit should be filtered out
    expect(screen.queryByText('Amit Kumar')).toBeNull();
  });

  it('should open details modal when clicking a sub-admin row', () => {
    render(<SubAdminManagement />);

    // Click on Priya's row
    const rows = screen.getAllByText('Priya Verma');
    fireEvent.click(rows[0].closest('.group'));

    // Verify detail modal is open
    expect(screen.getAllByText(/Joined/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('priya.verma@bandhan.com').length).toBeGreaterThan(0);
  });
});
