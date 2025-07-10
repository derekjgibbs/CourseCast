import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseCatalogTable from './CourseCatalogTable';
import { CourseDoc } from '../../convex/types';

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
});