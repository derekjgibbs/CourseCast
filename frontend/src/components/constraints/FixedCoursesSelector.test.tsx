import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import FixedCoursesSelector from './FixedCoursesSelector';
import type { CourseDoc } from '../../../convex/types';

// Mock Convex client
const mockConvex = new ConvexReactClient('https://test.convex.dev');

const ConvexTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConvexProvider client={mockConvex}>
    {children}
  </ConvexProvider>
);

// Mock course data
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
  {
    _id: 'course3' as any,
    _creationTime: Date.now(),
    course_id: 'MKTG6110001',
    title: 'Marketing Management',
    department: 'MKTG',
    instructor: 'Bob Johnson',
    days: 'MW',
    start_time: '11:00 AM',
    end_time: '12:30 PM',
    term: 'Fall 2024',
    credits: 1.0,
    price_forecast: 2800,
    price_std_dev: 180,
    course_quality: 4.4,
    instructor_quality: 4.1,
    difficulty: 3.5,
    work_required: 3.8,
  },
];

describe('FixedCoursesSelector', () => {
  const mockOnSelectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders component with proper styling and structure', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // Check for main container with glass morphism styling
      const container = screen.getByTestId('fixed-courses-container');
      expect(container).toHaveClass('bg-white', 'bg-opacity-20', 'backdrop-blur-sm', 'rounded-2xl');

      // Check for title
      expect(screen.getByText('Required Courses')).toBeInTheDocument();

      // Check for search input
      expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    });

    it('displays all courses when no search term is entered', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // All course titles should be visible
      expect(screen.getByText('Fundamentals of Financial and Managerial Accounting')).toBeInTheDocument();
      expect(screen.getByText('Corporate Finance')).toBeInTheDocument();
      expect(screen.getByText('Marketing Management')).toBeInTheDocument();
    });

    it('shows selected courses with different visual styling', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001', 'FINC6110001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // Selected courses should have checked checkboxes
      const acctCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      const fincCheckbox = screen.getByTestId('course-checkbox-FINC6110001');
      const mktgCheckbox = screen.getByTestId('course-checkbox-MKTG6110001');

      expect(acctCheckbox).toBeChecked();
      expect(fincCheckbox).toBeChecked();
      expect(mktgCheckbox).not.toBeChecked();
    });

    it('displays course information correctly', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // Check course details are displayed
      expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText(/MW.*9:00 AM/i)).toBeInTheDocument();
      expect(screen.getAllByText('1')).toHaveLength(3); // All courses have 1 credit
    });
  });

  describe('Search Functionality', () => {
    it('filters courses by course ID', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      fireEvent.change(searchInput, { target: { value: 'ACCT' } });

      await waitFor(() => {
        expect(screen.getByText('Fundamentals of Financial and Managerial Accounting')).toBeInTheDocument();
        expect(screen.queryByText('Corporate Finance')).not.toBeInTheDocument();
        expect(screen.queryByText('Marketing Management')).not.toBeInTheDocument();
      });
    });

    it('filters courses by title', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      fireEvent.change(searchInput, { target: { value: 'Finance' } });

      await waitFor(() => {
        expect(screen.getByText('Corporate Finance')).toBeInTheDocument();
        expect(screen.queryByText('Fundamentals of Financial and Managerial Accounting')).not.toBeInTheDocument();
        expect(screen.queryByText('Marketing Management')).not.toBeInTheDocument();
      });
    });

    it('filters courses by instructor', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      await waitFor(() => {
        expect(screen.getByText('Corporate Finance')).toBeInTheDocument();
        expect(screen.queryByText('Fundamentals of Financial and Managerial Accounting')).not.toBeInTheDocument();
        expect(screen.queryByText('Marketing Management')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search yields no matches', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      await waitFor(() => {
        expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
      });
    });

    it('is case insensitive', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      fireEvent.change(searchInput, { target: { value: 'marketing' } });

      await waitFor(() => {
        expect(screen.getByText('Marketing Management')).toBeInTheDocument();
      });
    });
  });

  describe('Department Filtering', () => {
    it('shows department filter dropdown', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/all departments/i)).toBeInTheDocument();
    });

    it('filters courses by department', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const departmentSelect = screen.getByRole('combobox');
      fireEvent.change(departmentSelect, { target: { value: 'ACCT' } });

      await waitFor(() => {
        expect(screen.getByText('Fundamentals of Financial and Managerial Accounting')).toBeInTheDocument();
        expect(screen.queryByText('Corporate Finance')).not.toBeInTheDocument();
        expect(screen.queryByText('Marketing Management')).not.toBeInTheDocument();
      });
    });

    it('shows all departments in dropdown', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const departmentSelect = screen.getByRole('combobox');
      
      // Check that all unique departments are available as options
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(option => option.textContent);
      expect(optionTexts).toContain('ACCT');
      expect(optionTexts).toContain('FINC');
      expect(optionTexts).toContain('MKTG');
    });
  });

  describe('Course Selection', () => {
    it('calls onSelectionChange when course is selected', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const acctCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      fireEvent.click(acctCheckbox);

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(['ACCT6130001']);
      });
    });

    it('calls onSelectionChange when course is deselected', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001', 'FINC6110001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const acctCheckbox = screen.getByTestId('course-checkbox-ACCT6130001');
      fireEvent.click(acctCheckbox);

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(['FINC6110001']);
      });
    });

    it('supports multiple course selection', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const fincCheckbox = screen.getByTestId('course-checkbox-FINC6110001');
      fireEvent.click(fincCheckbox);

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith(['ACCT6130001', 'FINC6110001']);
      });
    });

    it('shows selected count', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001', 'FINC6110001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/2 courses selected/i)).toBeInTheDocument();
    });

    it('shows clear selection button when courses are selected', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/clear selection/i)).toBeInTheDocument();
    });

    it('clears all selections when clear button is clicked', async () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001', 'FINC6110001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const clearButton = screen.getByText(/clear selection/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('Visual Feedback', () => {
    it('shows different styling for selected vs unselected courses', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={['ACCT6130001']}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const selectedCourse = screen.getByTestId('course-item-ACCT6130001');
      const unselectedCourse = screen.getByTestId('course-item-FINC6110001');

      // Selected course should have different styling
      expect(selectedCourse).toHaveClass('bg-blue-50', 'border-blue-200');
      expect(unselectedCourse).not.toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('shows hover effects on course items', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const courseItem = screen.getByTestId('course-item-ACCT6130001');
      expect(courseItem).toHaveClass('hover:bg-opacity-30');
    });

    it('shows department badges with proper colors', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // Department badges should have gradient backgrounds
      const acctBadge = screen.getByTestId('dept-badge-ACCT');
      const fincBadge = screen.getByTestId('dept-badge-FINC');
      const mktgBadge = screen.getByTestId('dept-badge-MKTG');

      expect(acctBadge).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600');
      expect(fincBadge).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-violet-600');
      expect(mktgBadge).toHaveClass('bg-gradient-to-r', 'from-pink-500', 'to-rose-600');
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state when courses are being fetched', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={undefined}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
            isLoading={true}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/loading courses/i)).toBeInTheDocument();
    });

    it('shows empty state when no courses are available', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={[]}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      // Search input should have proper label
      const searchInput = screen.getByLabelText(/search courses/i);
      expect(searchInput).toBeInTheDocument();

      // Checkboxes should have proper labels
      const checkbox = screen.getByTestId('course-checkbox-ACCT6130001');
      expect(checkbox).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(
        <ConvexTestWrapper>
          <FixedCoursesSelector 
            courses={mockCourses}
            selectedCourses={[]}
            onSelectionChange={mockOnSelectionChange}
          />
        </ConvexTestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('tabIndex');
      });
    });
  });
});