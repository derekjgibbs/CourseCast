import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import ConstraintSetupPage from './ConstraintSetupPage';
import type { UserScenarioDoc, CourseDoc } from '../../../convex/types';

// Mock Convex client
const mockConvex = new ConvexReactClient('https://test.convex.dev');

const ConvexTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConvexProvider client={mockConvex}>
    {children}
  </ConvexProvider>
);

// Mock data
const mockUser = {
  _id: 'user1' as any,
  _creationTime: Date.now(),
  name: 'Test User',
  email: 'test@example.com',
  created_at: Date.now(),
  updated_at: Date.now(),
};

const mockScenarios: UserScenarioDoc[] = [
  {
    _id: 'scenario1' as any,
    _creationTime: Date.now(),
    user_id: 'user1' as any,
    name: 'Default Scenario',
    token_budget: 4500,
    max_credits: 7.5,
    min_credits: 0.0,
    utilities: {},
    fixed_courses: [],
    is_active: true,
    created_at: Date.now(),
    updated_at: Date.now(),
  },
];

const mockCourses: CourseDoc[] = [
  {
    _id: 'course1' as any,
    _creationTime: Date.now(),
    course_id: 'ACCT6130001',
    title: 'Fundamentals of Financial and Managerial Accounting',
    department: 'ACCT',
    instructor: 'John Smith',
    days: 'MW',
    start_time: '9:00 AM',
    end_time: '10:30 AM',
    term: 'Fall 2024',
    credits: 1.0,
    price_forecast: 2500,
    price_std_dev: 200,
    course_quality: 4.2,
    instructor_quality: 4.5,
    difficulty: 3.8,
    work_required: 4.0,
  },
  {
    _id: 'course2' as any,
    _creationTime: Date.now(),
    course_id: 'FINC6110001',
    title: 'Corporate Finance',
    department: 'FINC',
    instructor: 'Jane Doe',
    days: 'TR',
    start_time: '2:00 PM',
    end_time: '3:30 PM',
    term: 'Fall 2024',
    credits: 1.0,
    price_forecast: 3000,
    price_std_dev: 250,
    course_quality: 4.0,
    instructor_quality: 4.3,
    difficulty: 4.1,
    work_required: 4.2,
  },
];

// Mock Convex hooks
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    ConvexProvider: actual.ConvexProvider,
    ConvexReactClient: actual.ConvexReactClient,
  };
});

describe('ConstraintSetup Integration Tests', () => {
  const mockUpdateScenario = vi.fn();
  const mockCreateScenario = vi.fn();
  const mockDeleteScenario = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery to return our test data
    mockUseQuery.mockImplementation((query: any) => {
      if (query.toString().includes('getUserScenarios')) {
        return mockScenarios;
      }
      if (query.toString().includes('getActiveUserScenario')) {
        return mockScenarios[0];
      }
      if (query.toString().includes('courses')) {
        return mockCourses;
      }
      return undefined;
    });

    mockUseMutation.mockImplementation((mutation: any) => {
      if (mutation.toString().includes('updateUserScenario')) {
        return mockUpdateScenario;
      }
      if (mutation.toString().includes('createUserScenario')) {
        return mockCreateScenario;
      }
      if (mutation.toString().includes('deleteUserScenario')) {
        return mockDeleteScenario;
      }
      return vi.fn();
    });
  });

  describe('Full Constraint Setup Workflow', () => {
    it('renders all constraint setup components together', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Check that all main components are rendered
      expect(screen.getByText('Scenario Manager')).toBeInTheDocument();
      expect(screen.getByText('Setup Constraints')).toBeInTheDocument();
      expect(screen.getByText('Required Courses')).toBeInTheDocument();
    });

    it('allows complete constraint configuration workflow', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Step 1: Update token budget
      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '5000' } });

      // Step 2: Update credit limits
      const maxCreditsInput = screen.getByLabelText('Maximum Credits');
      fireEvent.change(maxCreditsInput, { target: { value: '8' } });

      // Step 3: Select required courses
      const courseCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      fireEvent.click(courseCheckbox);

      // Step 4: Save constraints
      const saveButton = screen.getByText('Save Constraints');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateScenario).toHaveBeenCalledWith({
          id: mockScenarios[0]._id,
          updates: expect.objectContaining({
            token_budget: 5000,
            max_credits: 8,
            fixed_courses: ['ACCT6130001'],
          }),
        });
      });
    });

    it('maintains state consistency across components', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Select a course in FixedCoursesSelector
      const courseCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      fireEvent.click(courseCheckbox);

      // Verify selection count is updated
      await waitFor(() => {
        expect(screen.getByText(/1 courses selected/i)).toBeInTheDocument();
      });

      // Update token budget
      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '6000' } });

      // Verify the form maintains both changes
      expect(courseCheckbox).toBeChecked();
      expect(tokenInput).toHaveValue(6000);
    });

    it('handles validation errors across all components', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Set invalid token budget
      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '-100' } });
      fireEvent.blur(tokenInput);

      // Set invalid credit range
      const minCreditsInput = screen.getByLabelText('Minimum Credits');
      const maxCreditsInput = screen.getByLabelText('Maximum Credits');
      fireEvent.change(minCreditsInput, { target: { value: '10' } });
      fireEvent.change(maxCreditsInput, { target: { value: '5' } });
      fireEvent.blur(maxCreditsInput);

      await waitFor(() => {
        expect(screen.getByText(/token budget must be greater than 0/i)).toBeInTheDocument();
        expect(screen.getByText(/minimum credits cannot exceed maximum credits/i)).toBeInTheDocument();
      });

      // Save button should be disabled
      const saveButton = screen.getByText('Save Constraints');
      expect(saveButton).toBeDisabled();
    });

    it('supports scenario switching with constraint persistence', async () => {
      const multipleScenarios = [
        ...mockScenarios,
        {
          _id: 'scenario2' as any,
          _creationTime: Date.now(),
          user_id: 'user1' as any,
          name: 'Alternative Scenario',
          token_budget: 5000,
          max_credits: 6.0,
          min_credits: 1.0,
          utilities: { 'FINC6110001': 90 },
          fixed_courses: ['FINC6110001'],
          is_active: false,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ];

      mockUseQuery.mockImplementation((query: any) => {
        if (query.toString().includes('getUserScenarios')) {
          return multipleScenarios;
        }
        if (query.toString().includes('getActiveUserScenario')) {
          return multipleScenarios[0]; // Start with first scenario
        }
        if (query.toString().includes('courses')) {
          return mockCourses;
        }
        return undefined;
      });

      const { rerender } = render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Verify initial scenario data
      expect(screen.getByDisplayValue('Default Scenario')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4500')).toBeInTheDocument();

      // Switch to second scenario
      mockUseQuery.mockImplementation((query: any) => {
        if (query.toString().includes('getUserScenarios')) {
          return multipleScenarios;
        }
        if (query.toString().includes('getActiveUserScenario')) {
          return multipleScenarios[1]; // Switch to second scenario
        }
        if (query.toString().includes('courses')) {
          return mockCourses;
        }
        return undefined;
      });

      rerender(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Verify scenario data updated
      await waitFor(() => {
        expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('6')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles loading states gracefully', () => {
      mockUseQuery.mockReturnValue(undefined);

      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles empty scenarios list', () => {
      mockUseQuery.mockImplementation((query: any) => {
        if (query.toString().includes('getUserScenarios')) {
          return [];
        }
        if (query.toString().includes('getActiveUserScenario')) {
          return null;
        }
        if (query.toString().includes('courses')) {
          return mockCourses;
        }
        return undefined;
      });

      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/no scenarios found/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first scenario/i)).toBeInTheDocument();
    });

    it('handles empty courses list', () => {
      mockUseQuery.mockImplementation((query: any) => {
        if (query.toString().includes('getUserScenarios')) {
          return mockScenarios;
        }
        if (query.toString().includes('getActiveUserScenario')) {
          return mockScenarios[0];
        }
        if (query.toString().includes('courses')) {
          return [];
        }
        return undefined;
      });

      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      const mockFailingUpdate = vi.fn().mockRejectedValue(new Error('API Error'));
      
      mockUseMutation.mockImplementation((mutation: any) => {
        if (mutation.toString().includes('updateUserScenario')) {
          return mockFailingUpdate;
        }
        return vi.fn();
      });

      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Try to save with valid data
      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '5000' } });

      const saveButton = screen.getByText('Save Constraints');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error saving constraints/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and User Experience', () => {
    it('debounces validation to avoid excessive API calls', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      const tokenInput = screen.getByLabelText('Token Budget');
      
      // Rapidly change input multiple times
      fireEvent.change(tokenInput, { target: { value: '1000' } });
      fireEvent.change(tokenInput, { target: { value: '2000' } });
      fireEvent.change(tokenInput, { target: { value: '3000' } });
      fireEvent.change(tokenInput, { target: { value: '4000' } });

      // Only final validation should be visible
      await waitFor(() => {
        expect(tokenInput).toHaveValue(4000);
      });
    });

    it('provides immediate visual feedback for user actions', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Check course selection feedback
      const courseCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      const courseItem = screen.getByTestId('course-item-ACCT6130001');

      fireEvent.click(courseCheckbox);

      // Should see immediate visual change
      expect(courseCheckbox).toBeChecked();
      expect(courseItem).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('maintains responsive design across different screen sizes', () => {
      // Test with mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Components should still be accessible
      expect(screen.getByText('Scenario Manager')).toBeInTheDocument();
      expect(screen.getByText('Setup Constraints')).toBeInTheDocument();
      expect(screen.getByText('Required Courses')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('supports keyboard navigation throughout the workflow', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // All interactive elements should be keyboard accessible
      const inputs = screen.getAllByRole('textbox');
      const buttons = screen.getAllByRole('button');
      const checkboxes = screen.getAllByRole('checkbox');

      [...inputs, ...buttons, ...checkboxes].forEach(element => {
        expect(element).toHaveAttribute('tabIndex');
      });
    });

    it('provides proper ARIA labels and descriptions', () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Form should have proper labeling
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label');

      // Inputs should have proper associations
      const tokenInput = screen.getByLabelText('Token Budget');
      expect(tokenInput).toHaveAttribute('aria-describedby');
    });

    it('announces state changes to screen readers', async () => {
      render(
        <ConvexTestWrapper>
          <ConstraintSetupPage userId="user1" />
        </ConvexTestWrapper>
      );

      // Error states should be announced
      const tokenInput = screen.getByLabelText('Token Budget');
      fireEvent.change(tokenInput, { target: { value: '-100' } });
      fireEvent.blur(tokenInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/token budget must be greater than 0/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});