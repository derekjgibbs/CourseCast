import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CourseCatalogTable from './CourseCatalogTable';
import type { CourseDoc } from '@/convex/types';

// Mock course data
const mockCourses: CourseDoc[] = [
  {
    _id: 'course1' as any,
    _creationTime: Date.now(),
    course_id: 'ACCT6130001',
    title: 'Fundamentals of Financial and Managerial Accounting',
    department: 'ACCT',
    instructor: 'LANE',
    days: 'TR',
    start_time: '10:15',
    end_time: '11:44',
    term: 'Full',
    credits: 1.0,
    price_forecast: 1875,
    price_std_dev: 200,
    course_quality: 2.8,
    instructor_quality: 3.1,
    difficulty: 2.9,
    work_required: 2.5,
  },
  {
    _id: 'course2' as any,
    _creationTime: Date.now(),
    course_id: 'MGMT6110001',
    title: 'Introduction to Management',
    department: 'MGMT',
    instructor: 'SMITH',
    days: 'MW',
    start_time: '09:00',
    end_time: '10:30',
    term: 'Q1',
    credits: 1.5,
    price_forecast: 2000,
    price_std_dev: 150,
    course_quality: 3.2,
    instructor_quality: 3.5,
    difficulty: 2.1,
    work_required: 2.0,
  },
];

describe('CourseCatalogTable', () => {
  it('renders table with course data', () => {
    render(<CourseCatalogTable courses={mockCourses} />);

    // Check if table headers are present
    expect(screen.getByText('Course ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Instructor')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Credits')).toBeInTheDocument();
    expect(screen.getByText('Price Forecast')).toBeInTheDocument();
  });

  it('displays course information correctly', () => {
    render(<CourseCatalogTable courses={mockCourses} />);

    // Check first course data
    expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
    expect(screen.getByText('Fundamentals of Financial and Managerial Accounting')).toBeInTheDocument();
    expect(screen.getByText('ACCT')).toBeInTheDocument();
    expect(screen.getByText('LANE')).toBeInTheDocument();
    expect(screen.getByText('TR')).toBeInTheDocument();
    expect(screen.getByText('10:15 - 11:44')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('1875')).toBeInTheDocument();
  });

  it('handles empty course list', () => {
    render(<CourseCatalogTable courses={[]} />);

    // Should still show headers
    expect(screen.getByText('Course ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();

    // Should show empty state message
    expect(screen.getByText('No courses found')).toBeInTheDocument();
  });

  describe('Search functionality', () => {
    it('renders search input field', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('filters courses by course title', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'Accounting' } });

      // Should show only the accounting course
      expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
      expect(screen.queryByText('MGMT6110001')).not.toBeInTheDocument();
    });

    it('filters courses by course ID', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'MGMT6110' } });

      // Should show only the management course
      expect(screen.getByText('MGMT6110001')).toBeInTheDocument();
      expect(screen.queryByText('ACCT6130001')).not.toBeInTheDocument();
    });

    it('filters courses by instructor name', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'SMITH' } });

      // Should show only SMITH's course
      expect(screen.getByText('MGMT6110001')).toBeInTheDocument();
      expect(screen.queryByText('ACCT6130001')).not.toBeInTheDocument();
    });

    it('shows no results message when no courses match search', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCourse' } });

      expect(screen.getByText('No courses found')).toBeInTheDocument();
    });

    it('search is case insensitive', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'lane' } });

      // Should find LANE instructor
      expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
      expect(screen.queryByText('MGMT6110001')).not.toBeInTheDocument();
    });

    it('clears search results when search input is cleared', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const searchInput = screen.getByPlaceholderText('Search courses...');

      // First, filter results
      fireEvent.change(searchInput, { target: { value: 'ACCT' } });
      expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
      expect(screen.queryByText('MGMT6110001')).not.toBeInTheDocument();

      // Then clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // Should show all courses again
      expect(screen.getByText('ACCT6130001')).toBeInTheDocument();
      expect(screen.getByText('MGMT6110001')).toBeInTheDocument();
    });
  });

  describe('Sorting functionality', () => {
    it('renders sortable column headers with sort indicators', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      // Check that headers are clickable buttons
      expect(screen.getByRole('button', { name: /course id/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /title/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /department/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /instructor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /credits/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /price forecast/i })).toBeInTheDocument();
    });

    it('sorts courses by course ID ascending when header is clicked', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const courseIdHeader = screen.getByRole('button', { name: /course id/i });
      fireEvent.click(courseIdHeader);

      const rows = screen.getAllByRole('row');
      // First row should be header, second should be ACCT (comes before MGMT alphabetically)
      expect(rows[1]).toHaveTextContent('ACCT6130001');
      expect(rows[2]).toHaveTextContent('MGMT6110001');
    });

    it('sorts courses by course ID descending when header is clicked twice', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const courseIdHeader = screen.getByRole('button', { name: /course id/i });
      fireEvent.click(courseIdHeader); // First click - ascending
      fireEvent.click(courseIdHeader); // Second click - descending

      const rows = screen.getAllByRole('row');
      // First row should be header, second should be MGMT (comes after ACCT alphabetically)
      expect(rows[1]).toHaveTextContent('MGMT6110001');
      expect(rows[2]).toHaveTextContent('ACCT6130001');
    });

    it('sorts courses by credits numerically', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const creditsHeader = screen.getByRole('button', { name: /credits/i });
      fireEvent.click(creditsHeader);

      const rows = screen.getAllByRole('row');
      // TanStack table sorts ascending by default: ACCT (1.0) before MGMT (1.5)
      // If this fails, debug the actual order being returned
      expect(rows[1]).toHaveTextContent('ACCT6130001');
      expect(rows[2]).toHaveTextContent('MGMT6110001');
    });

    it('sorts courses by price forecast numerically', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const priceHeader = screen.getByRole('button', { name: /price forecast/i });
      fireEvent.click(priceHeader);

      const rows = screen.getAllByRole('row');
      // First course should be ACCT (lower price: 1875), second should be MGMT (higher price: 2000)
      expect(rows[1]).toHaveTextContent('ACCT6130001');
      expect(rows[2]).toHaveTextContent('MGMT6110001');
    });

    it('shows sort direction indicators', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const courseIdHeader = screen.getByRole('button', { name: /course id/i });

      // Before clicking - no sort indicator or neutral
      expect(courseIdHeader).toBeInTheDocument();

      // After clicking - should show ascending indicator
      fireEvent.click(courseIdHeader);
      expect(courseIdHeader).toHaveTextContent('↑');

      // After clicking again - should show descending indicator
      fireEvent.click(courseIdHeader);
      expect(courseIdHeader).toHaveTextContent('↓');
    });

    it('resets other column sorts when sorting by a different column', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const courseIdHeader = screen.getByRole('button', { name: /course id/i });
      const titleHeader = screen.getByRole('button', { name: /title/i });

      // Sort by course ID first
      fireEvent.click(courseIdHeader);
      expect(courseIdHeader).toHaveTextContent('↑');

      // Sort by title - should reset course ID sort indicator
      fireEvent.click(titleHeader);
      expect(titleHeader).toHaveTextContent('↑');
      expect(courseIdHeader).not.toHaveTextContent('↑');
      expect(courseIdHeader).not.toHaveTextContent('↓');
    });

    it('maintains sort when searching', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      // Sort by course ID ascending
      const courseIdHeader = screen.getByRole('button', { name: /course id/i });
      fireEvent.click(courseIdHeader);

      // Search for courses - should maintain sort order
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'A' } }); // Should match both courses with 'A'

      const rows = screen.getAllByRole('row');
      // Should still be sorted by course ID (ACCT before MGMT)
      expect(rows[1]).toHaveTextContent('ACCT6130001');
    });
  });

  describe('Pagination functionality', () => {
    const createManyMockCourses = (count: number): CourseDoc[] => {
      return Array.from({ length: count }, (_, i) => ({
        _id: `course${i + 1}` as any,
        _creationTime: Date.now(),
        course_id: `TEST${i + 1}`,
        title: `Test Course ${i + 1}`,
        department: 'TEST',
        instructor: 'INSTRUCTOR',
        days: 'MW',
        start_time: '10:00',
        end_time: '11:30',
        term: 'Full',
        credits: 1.0,
        price_forecast: 2000,
        price_std_dev: 150,
        course_quality: 3.0,
        instructor_quality: 3.0,
        difficulty: 2.5,
        work_required: 2.5,
      }));
    };

    it('renders pagination controls when there are many courses', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Should show pagination controls
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('shows correct number of courses per page', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Should show 10 courses per page (plus header row)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(11); // 1 header + 10 data rows
    });

    it('navigates to next page when Next button is clicked', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Initially on page 1
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('TEST1')).toBeInTheDocument();

      // Click Next
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Should be on page 2
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      expect(screen.getByText('TEST11')).toBeInTheDocument(); // First course on page 2
      expect(screen.queryByText('TEST1')).not.toBeInTheDocument();
    });

    it('navigates to previous page when Previous button is clicked', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Go to page 2 first
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

      // Click Previous
      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      // Should be back on page 1
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('TEST1')).toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('disables Next button on last page', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Navigate to last page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton); // Page 2
      fireEvent.click(nextButton); // Page 3

      expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
      expect(nextButton).toBeDisabled();
    });

    it('shows correct courses on last page with fewer items', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Navigate to last page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton); // Page 2
      fireEvent.click(nextButton); // Page 3

      // Page 3 should have 5 courses (25 total - 20 on first two pages)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(6); // 1 header + 5 data rows
      expect(screen.getByText('TEST21')).toBeInTheDocument(); // First course on page 3
      expect(screen.getByText('TEST25')).toBeInTheDocument(); // Last course
    });

    it('does not show pagination controls for small datasets', () => {
      render(<CourseCatalogTable courses={mockCourses} />); // Only 2 courses

      // Should not show pagination controls
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
    });

    it('pagination works with search results', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Search for courses (all have "Test Course" in title)
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'Test Course' } });

      // Should still have pagination for filtered results
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('resets to page 1 when search changes', () => {
      const manyCourses = createManyMockCourses(25);
      render(<CourseCatalogTable courses={manyCourses} />);

      // Go to page 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

      // Search for something
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      // Should reset to page 1
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  describe('Export functionality', () => {
    it('renders export button', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      const exportButton = screen.getByText('Export CSV (2 courses)');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton.tagName).toBe('BUTTON');
    });

    it('shows export count when courses are filtered', () => {
      render(<CourseCatalogTable courses={mockCourses} />);

      // Apply search filter
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'Accounting' } });

      // Should show export button with count
      expect(screen.getByText('Export CSV (1 courses)')).toBeInTheDocument();
    });

    it('shows correct export count with pagination', () => {
      const manyCourses = Array.from({ length: 25 }, (_, i) => ({
        _id: `course${i + 1}` as any,
        _creationTime: Date.now(),
        course_id: `TEST${i + 1}`,
        title: `Test Course ${i + 1}`,
        department: 'TEST',
        instructor: 'INSTRUCTOR',
        days: 'MW',
        start_time: '10:00',
        end_time: '11:30',
        term: 'Full',
        credits: 1.0,
        price_forecast: 2000,
        price_std_dev: 150,
        course_quality: 3.0,
        instructor_quality: 3.0,
        difficulty: 2.5,
        work_required: 2.5,
      }));

      render(<CourseCatalogTable courses={manyCourses} />);

      // Should show export button with total count (not just current page)
      expect(screen.getByText('Export CSV (25 courses)')).toBeInTheDocument();
    });
  });
});
