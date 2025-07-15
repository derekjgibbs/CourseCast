import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import ScenarioManager from './ScenarioManager';
import type { UserScenarioDoc } from '@/convex/types';

// Mock Convex client
const mockConvex = new ConvexReactClient('https://test.convex.dev');

const ConvexTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConvexProvider client={mockConvex}>
    {children}
  </ConvexProvider>
);

// Mock user scenarios
const mockScenarios: UserScenarioDoc[] = [
  {
    _id: 'scenario1' as any,
    _creationTime: Date.now(),
    user_id: 'user1' as any,
    name: 'Default Scenario',
    token_budget: 4500,
    max_credits: 7.5,
    min_credits: 0.0,
    utilities: { 'ACCT6130001': 85, 'FINC6110001': 90 },
    fixed_courses: ['ACCT6130001'],
    is_active: true,
    created_at: Date.now() - 86400000, // 1 day ago
    updated_at: Date.now() - 3600000,  // 1 hour ago
  },
  {
    _id: 'scenario2' as any,
    _creationTime: Date.now(),
    user_id: 'user1' as any,
    name: 'High Risk Scenario',
    token_budget: 5000,
    max_credits: 8.0,
    min_credits: 2.0,
    utilities: { 'FINC6110001': 95, 'MKTG6110001': 80 },
    fixed_courses: ['FINC6110001'],
    is_active: false,
    created_at: Date.now() - 172800000, // 2 days ago
    updated_at: Date.now() - 7200000,   // 2 hours ago
  },
  {
    _id: 'scenario3' as any,
    _creationTime: Date.now(),
    user_id: 'user1' as any,
    name: 'Conservative Approach',
    token_budget: 4000,
    max_credits: 6.0,
    min_credits: 3.0,
    utilities: { 'ACCT6130001': 75, 'STAT6130001': 70 },
    fixed_courses: [],
    is_active: false,
    created_at: Date.now() - 259200000, // 3 days ago
    updated_at: Date.now() - 10800000,  // 3 hours ago
  },
];

describe('ScenarioManager', () => {
  const mockOnScenarioChange = vi.fn();
  const mockOnCreateScenario = vi.fn();
  const mockOnDeleteScenario = vi.fn();
  const mockOnDuplicateScenario = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders component with proper styling and structure', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check for main container with glass morphism styling
      const container = screen.getByTestId('scenario-manager-container');
      expect(container).toHaveClass('bg-white', 'bg-opacity-20', 'backdrop-blur-sm', 'rounded-2xl');

      // Check for title
      expect(screen.getByText('Scenario Manager')).toBeInTheDocument();

      // Check for scenario dropdown
      expect(screen.getByText('Current Scenario')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Default Scenario')).toBeInTheDocument();
    });

    it('displays all scenarios in dropdown', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check that all scenarios appear as options
      expect(screen.getByText('Default Scenario')).toBeInTheDocument();
      expect(screen.getByText('High Risk Scenario')).toBeInTheDocument();
      expect(screen.getByText('Conservative Approach')).toBeInTheDocument();
    });

    it('shows active scenario details', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check scenario details are displayed
      expect(screen.getByText('4,500')).toBeInTheDocument(); // Token budget (formatted with comma)
      expect(screen.getByText('0 - 7.5')).toBeInTheDocument(); // Credit range
      expect(screen.getByText('1 required course')).toBeInTheDocument(); // Fixed courses count
      expect(screen.getByText('2 course preferences')).toBeInTheDocument(); // Utilities count
    });

    it('shows action buttons for scenario management', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/create new/i)).toBeInTheDocument();
      expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });
  });

  describe('Scenario Selection', () => {
    it('calls onScenarioChange when different scenario is selected', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const dropdown = screen.getByDisplayValue('Default Scenario');
      fireEvent.change(dropdown, { target: { value: 'scenario2' } });

      await waitFor(() => {
        expect(mockOnScenarioChange).toHaveBeenCalledWith(mockScenarios[1]);
      });
    });

    it('updates displayed details when scenario changes', () => {
      const { rerender } = render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Change to second scenario
      rerender(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[1]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check updated details
      expect(screen.getByText('5,000')).toBeInTheDocument(); // New token budget (formatted)
      expect(screen.getByText('2 - 8')).toBeInTheDocument(); // New credit range
      expect(screen.getByDisplayValue('High Risk Scenario')).toBeInTheDocument();
    });
  });

  describe('Scenario Creation', () => {
    it('shows create scenario modal when create button clicked', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const createButton = screen.getByText(/create new/i);
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Scenario')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/scenario name/i)).toBeInTheDocument();
      });
    });

    it('calls onCreateScenario with new scenario name', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Open create modal
      const createButton = screen.getByText('Create New');
      fireEvent.click(createButton);

      // Enter scenario name
      const nameInput = screen.getByPlaceholderText(/scenario name/i);
      fireEvent.change(nameInput, { target: { value: 'New Test Scenario' } });

      // Submit
      const submitButton = screen.getByText('Create Scenario');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnCreateScenario).toHaveBeenCalledWith('New Test Scenario');
      });
    });

    it('validates scenario name input', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Open create modal
      const createButton = screen.getByText('Create New');
      fireEvent.click(createButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Create New Scenario')).toBeInTheDocument();
      });

      // Try to submit without name
      const submitButton = screen.getByText('Create Scenario');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Scenario name is required')).toBeInTheDocument();
      });

      expect(mockOnCreateScenario).not.toHaveBeenCalled();
    });

    it('closes modal after successful creation', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Open create modal
      const createButton = screen.getByText('Create New');
      fireEvent.click(createButton);

      // Create scenario
      const nameInput = screen.getByPlaceholderText(/scenario name/i);
      fireEvent.change(nameInput, { target: { value: 'New Test Scenario' } });

      const submitButton = screen.getByText('Create Scenario');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Create New Scenario')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario Duplication', () => {
    it('calls onDuplicateScenario with current scenario', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const duplicateButton = screen.getByText(/duplicate/i);
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(mockOnDuplicateScenario).toHaveBeenCalledWith(mockScenarios[0]);
      });
    });

    it('shows loading state during duplication', async () => {
      const slowDuplicate = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));

      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={slowDuplicate}
          />
        </ConvexTestWrapper>
      );

      const duplicateButton = screen.getByText(/duplicate/i);
      fireEvent.click(duplicateButton);

      expect(screen.getByText(/duplicating.../i)).toBeInTheDocument();
      expect(duplicateButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/duplicating.../i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario Deletion', () => {
    it('shows confirmation dialog before deletion', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const deleteButton = screen.getByText(/delete/i);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/delete scenario/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('calls onDeleteScenario when confirmed', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Open delete confirmation
      const deleteButton = screen.getByText(/delete/i);
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText(/delete scenario/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDeleteScenario).toHaveBeenCalledWith(mockScenarios[0]);
      });
    });

    it('cancels deletion when cancel is clicked', async () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Open delete confirmation
      const deleteButton = screen.getByText(/delete/i);
      fireEvent.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/delete scenario/i)).not.toBeInTheDocument();
      });

      expect(mockOnDeleteScenario).not.toHaveBeenCalled();
    });

    it('disables delete button when only one scenario exists', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={[mockScenarios[0]!]}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const deleteButton = screen.getByText(/delete/i);
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Scenario Details Display', () => {
    it('formats dates correctly', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check for relative time formatting
      expect(screen.getByText(/created.*day.*ago/i)).toBeInTheDocument();
      expect(screen.getByText(/updated.*hour.*ago/i)).toBeInTheDocument();
    });

    it('shows scenario statistics correctly', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[1]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Check scenario 2 details
      expect(screen.getByText('5,000')).toBeInTheDocument(); // Token budget (formatted)
      expect(screen.getByText('2 - 8')).toBeInTheDocument(); // Credit range
      expect(screen.getByText('1 required course')).toBeInTheDocument();
      expect(screen.getByText('2 course preferences')).toBeInTheDocument();
    });

    it('handles scenarios with no utilities or fixed courses', () => {
      const emptyScenario = {
        ...mockScenarios[0]!,
        utilities: {},
        fixed_courses: [],
      };

      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={[emptyScenario]}
            activeScenario={emptyScenario}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText('0 required courses')).toBeInTheDocument();
      expect(screen.getByText('0 course preferences')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state when scenarios are being fetched', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={undefined}
            activeScenario={undefined}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
            isLoading={true}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/loading scenarios/i)).toBeInTheDocument();
    });

    it('shows empty state when no scenarios exist', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={[]}
            activeScenario={undefined}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/no scenarios found/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first scenario/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      // Dropdown should have proper label
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-label');

      // Action buttons should have proper labels
      const createButton = screen.getByText(/create new/i);
      expect(createButton).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(
        <ConvexTestWrapper>
          <ScenarioManager
            scenarios={mockScenarios}
            activeScenario={mockScenarios[0]}
            onScenarioChange={mockOnScenarioChange}
            onCreateScenario={mockOnCreateScenario}
            onDeleteScenario={mockOnDeleteScenario}
            onDuplicateScenario={mockOnDuplicateScenario}
          />
        </ConvexTestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
      });
    });
  });
});
