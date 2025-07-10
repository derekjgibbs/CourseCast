import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import ConstraintInputForm from './ConstraintInputForm';
import type { UserScenarioDoc } from '../../../convex/types';

// Mock Convex client
const mockConvex = new ConvexReactClient('https://test.convex.dev');

const ConvexTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConvexProvider client={mockConvex}>
    {children}
  </ConvexProvider>
);

// Mock scenario data
const mockScenario: UserScenarioDoc = {
  _id: 'scenario1' as any,
  _creationTime: Date.now(),
  user_id: 'user1' as any,
  name: 'Test Scenario',
  token_budget: 4500,
  max_credits: 7.5,
  min_credits: 0.0,
  utilities: {},
  fixed_courses: [],
  is_active: true,
  created_at: Date.now(),
  updated_at: Date.now(),
};

describe('ConstraintInputForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with all required input fields', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      // Check for token budget input
      expect(screen.getByLabelText('Token Budget')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4500')).toBeInTheDocument();

      // Check for credit inputs
      expect(screen.getByLabelText('Minimum Credits')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum Credits')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      expect(screen.getByDisplayValue('7.5')).toBeInTheDocument();

      // Check for save and cancel buttons
      expect(screen.getByRole('button', { name: /save constraints/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders with proper glass morphism styling', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const formContainer = screen.getByTestId('constraint-form-container');
      expect(formContainer).toHaveClass('bg-white', 'bg-opacity-20', 'backdrop-blur-sm', 'rounded-2xl');
    });

    it('displays default values when no scenario provided', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByDisplayValue('4500')).toBeInTheDocument(); // Default token budget
      expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Default min credits
      expect(screen.getByDisplayValue('7.5')).toBeInTheDocument(); // Default max credits
    });
  });

  describe('Form Validation', () => {
    it('validates token budget must be positive', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '-100' } });
      fireEvent.blur(tokenInput);

      await waitFor(() => {
        expect(screen.getByText(/token budget must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('validates min credits cannot exceed max credits', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const minCreditsInput = screen.getByLabelText('Minimum Credits');
      const maxCreditsInput = screen.getByLabelText('Maximum Credits');
      
      fireEvent.change(minCreditsInput, { target: { value: '8' } });
      fireEvent.change(maxCreditsInput, { target: { value: '5' } });
      fireEvent.blur(maxCreditsInput);

      await waitFor(() => {
        expect(screen.getByText(/minimum credits cannot exceed maximum credits/i)).toBeInTheDocument();
      });
    });

    it('validates credits are within allowed limits', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const maxCreditsInput = screen.getByLabelText('Maximum Credits');
      fireEvent.change(maxCreditsInput, { target: { value: '15' } });
      fireEvent.blur(maxCreditsInput);

      await waitFor(() => {
        expect(screen.getByText(/credits must be between 0 and 10/i)).toBeInTheDocument();
      });
    });

    it('disables save button when form has validation errors', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '-100' } });

      const saveButton = screen.getByRole('button', { name: /save constraints/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('calls onSave with correct data when form is valid', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      const minCreditsInput = screen.getByLabelText('Minimum Credits');
      const maxCreditsInput = screen.getByLabelText('Maximum Credits');

      fireEvent.change(tokenInput, { target: { value: '5000' } });
      fireEvent.change(minCreditsInput, { target: { value: '1' } });
      fireEvent.change(maxCreditsInput, { target: { value: '6' } });

      const saveButton = screen.getByRole('button', { name: /save constraints/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          token_budget: 5000,
          min_credits: 1,
          max_credits: 6,
        });
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('shows loading state during form submission', async () => {
      const slowOnSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={slowOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /save constraints/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/saving.../i)).not.toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('shows helpful tooltips for constraint inputs', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      // Check for tooltip icons
      expect(screen.getByTestId('token-budget-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('credits-tooltip')).toBeInTheDocument();
    });

    it('auto-formats numeric inputs', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '4500.50' } });
      fireEvent.blur(tokenInput);

      await waitFor(() => {
        expect(tokenInput).toHaveValue(4500); // Should round to integer
      });
    });

    it('preserves form state when switching between inputs', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      const minCreditsInput = screen.getByLabelText(/minimum credits/i);

      fireEvent.change(tokenInput, { target: { value: '5000' } });
      fireEvent.change(minCreditsInput, { target: { value: '2' } });

      expect(tokenInput).toHaveValue(5000);
      expect(minCreditsInput).toHaveValue(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and descriptions', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      expect(tokenInput).toHaveAttribute('aria-describedby');

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Constraint input form');
    });

    it('supports keyboard navigation', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintInputForm 
            scenario={mockScenario}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </ConvexTestWrapper>
      );

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('tabIndex');
      });
    });
  });
});