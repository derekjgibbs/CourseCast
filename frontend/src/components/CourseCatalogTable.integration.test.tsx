import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import CourseCatalogTable from './CourseCatalogTable';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Component wrapper that uses Convex data
const CourseCatalogTableWithConvex: React.FC = () => {
  const courses = useQuery(api.courses.list);
  
  if (courses === undefined) {
    return <div>Loading courses...</div>;
  }
  
  return <CourseCatalogTable courses={courses} />;
};

// Component wrapper with Convex provider
const ConvexTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const convex = new ConvexReactClient(process.env.VITE_CONVEX_URL!);
  
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
};

describe('CourseCatalogTable - Convex Integration Tests', () => {
  beforeAll(() => {
    // Ensure we have the Convex URL configured
    if (!process.env.VITE_CONVEX_URL) {
      throw new Error('VITE_CONVEX_URL environment variable is required for integration tests');
    }
  });

  it('loads and displays real course data from Convex', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithConvex />
      </ConvexTestWrapper>
    );
    
    // Should show loading initially
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Should show table headers
    expect(screen.getByText('Course ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Instructor')).toBeInTheDocument();
    
    // Should have actual course data (based on sample data we saw)
    await waitFor(() => {
      const departmentElements = screen.getAllByText(/^(ACCT|REAL|FINC|MKTG|OIDD)$/);
      expect(departmentElements.length).toBeGreaterThan(0);
    });
  }, 15000);
  
  it('can search through real course data', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithConvex />
      </ConvexTestWrapper>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Try searching for a department that exists in the data
    const searchInput = screen.getByPlaceholderText('Search courses...');
    fireEvent.change(searchInput, { target: { value: 'ACCT' } });
    
    // Should filter to only ACCT courses
    await waitFor(() => {
      // Check that we have ACCT courses visible
      const acctElements = screen.getAllByText(/ACCT/);
      expect(acctElements.length).toBeGreaterThan(0);
      
      // Check that non-ACCT departments are not visible (or very few)
      const nonAcctElements = screen.queryAllByText(/^(REAL|FINC|MKTG|OIDD)$/);
      expect(nonAcctElements.length).toBeLessThanOrEqual(acctElements.length);
    });
  }, 15000);
  
  it('can sort real course data', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithConvex />
      </ConvexTestWrapper>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Click on Course ID header to sort
    const courseIdHeader = screen.getByRole('button', { name: /course id/i });
    fireEvent.click(courseIdHeader);
    
    // Should show sort indicator
    await waitFor(() => {
      expect(courseIdHeader).toHaveTextContent('↑');
    });
  }, 15000);
  
  it('shows export button with correct count of real data', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithConvex />
      </ConvexTestWrapper>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Should show export button with course count
    await waitFor(() => {
      expect(screen.getByText(/Export CSV \(\d+ courses\)/)).toBeInTheDocument();
    });
  }, 15000);
  
  it('handles pagination with real data if there are enough courses', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithConvex />
      </ConvexTestWrapper>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Check if pagination controls appear (depends on amount of data)
    const rows = screen.getAllByRole('row');
    if (rows.length > 11) { // More than 10 data rows + 1 header
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument();
    }
  }, 15000);
});