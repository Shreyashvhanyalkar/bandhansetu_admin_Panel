import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Plans from '../pages/admin/Plans';

describe('Plans Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Plans page header and stats', () => {
    render(<Plans />);
    expect(screen.getByText('Membership plans')).toBeInTheDocument();
    expect(screen.getByText('Manage subscription tiers shown to users')).toBeInTheDocument();
    
    // Stats cards labels
    expect(screen.getByText('Total plans')).toBeInTheDocument();
    expect(screen.getByText('Active subscribers')).toBeInTheDocument();
    expect(screen.getByText('Monthly revenue')).toBeInTheDocument();
    // "Most popular" appears both as stat label AND badge on Gold plan card
    expect(screen.getAllByText('Most popular').length).toBeGreaterThanOrEqual(1);
  });

  it('should render the default list of plans', () => {
    render(<Plans />);
    
    expect(screen.getByText('Free')).toBeInTheDocument();
    // "Gold" appears in both the plan card and the "Most popular" stat value
    expect(screen.getAllByText('Gold').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Platinum')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });

  it('should open the Add Plan modal when clicking Add plan button', () => {
    render(<Plans />);
    
    const addButton = screen.getByRole('button', { name: /Add plan/i });
    fireEvent.click(addButton);
    
    // Modal uses <h2> — check heading role
    expect(screen.getAllByText('Add plan').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('e.g. Gold')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1499')).toBeInTheDocument();
  });

  it('should create a new plan successfully', () => {
    render(<Plans />);
    
    const addButton = screen.getByRole('button', { name: /Add plan/i });
    fireEvent.click(addButton);
    
    const nameInput = screen.getByPlaceholderText('e.g. Gold');
    const priceInput = screen.getByPlaceholderText('1499');
    
    fireEvent.change(nameInput, { target: { value: 'Super Elite' } });
    fireEvent.change(priceInput, { target: { value: '9999' } });
    
    const saveButton = screen.getByRole('button', { name: /Save plan/i });
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Super Elite')).toBeInTheDocument();
    expect(screen.getByText('₹9,999')).toBeInTheDocument();
  });

  it('should open Edit Plan modal with existing data and update correctly', () => {
    render(<Plans />);
    
    // Edit buttons have aria-label "Edit plan"
    const editButtons = screen.getAllByRole('button', { name: /Edit plan/i });
    fireEvent.click(editButtons[1]); // Gold plan edit
    
    // Modal should show "Edit plan" heading
    expect(screen.getAllByText('Edit plan').length).toBeGreaterThan(0);
    
    const nameInput = screen.getByDisplayValue('Gold');
    fireEvent.change(nameInput, { target: { value: 'Gold Premium' } });
    
    const saveButton = screen.getByRole('button', { name: /Save plan/i });
    fireEvent.click(saveButton);
    
    expect(screen.getAllByText('Gold Premium').length).toBeGreaterThan(0);
  });

  it('should delete a plan when clicking delete and user confirms', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Plans />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete plan/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalledWith('Delete this plan? This cannot be undone.');
    expect(screen.queryByText('Free')).toBeNull();
  });

  it('should not delete a plan when user cancels the confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Plans />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete plan/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should close modal when Cancel is clicked', () => {
    render(<Plans />);
    
    fireEvent.click(screen.getByRole('button', { name: /Add plan/i }));
    expect(screen.getAllByText('Add plan').length).toBeGreaterThan(0);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    // Modal heading should be gone
    expect(screen.queryByPlaceholderText('e.g. Gold')).toBeNull();
  });
});
