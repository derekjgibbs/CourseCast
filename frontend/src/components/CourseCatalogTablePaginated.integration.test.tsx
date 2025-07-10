import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import CourseCatalogTable from './CourseCatalogTable';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Component wrapper that uses Convex paginated data
const CourseCatalogTableWithPaginatedConvex: React.FC = () => {
  const result = useQuery(api.courses.listPaginated, {
    paginationOpts: { numItems: 5, cursor: null },
  });
  
  if (result === undefined) {
    return <div>Loading courses...</div>;
  }
  
  return <CourseCatalogTable courses={result.page} pageSize={5} />;
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

describe('CourseCatalogTable - Convex Pagination Integration Tests', () => {
  beforeAll(() => {
    // Ensure we have the Convex URL configured
    if (!process.env.VITE_CONVEX_URL) {
      throw new Error('VITE_CONVEX_URL environment variable is required for integration tests');
    }
  });

  it('loads paginated course data from Convex', async () => {
    render(
      <ConvexTestWrapper>
        <CourseCatalogTableWithPaginatedConvex />
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
    
    // Should show exactly 5 courses (plus header row) since we set numItems: 5
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 1 header + 5 data rows
    
    // Should show export button with count of 5 courses
    expect(screen.getByText('Export CSV (5 courses)')).toBeInTheDocument();
  }, 15000);

  it('pagination query handles search functionality', async () => {
    // Component that uses search with pagination
    const SearchableComponent: React.FC = () => {
      const [searchTerm, setSearchTerm] = React.useState('');
      
      const result = useQuery(api.courses.listPaginated, {
        paginationOpts: { numItems: 10, cursor: null },
        searchTerm: searchTerm || undefined,
      });
      
      if (result === undefined) {
        return <div>Loading courses...</div>;
      }
      
      return (
        <div>
          <input
            data-testid="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
          <CourseCatalogTable courses={result.page} pageSize={10} />
        </div>
      );
    };

    render(
      <ConvexTestWrapper>
        <SearchableComponent />
      </ConvexTestWrapper>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading courses...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Get initial course count
    const initialRows = screen.getAllByRole('row');
    const initialCount = initialRows.length - 1; // Subtract header row
    
    // Search for ACCT courses
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ACCT' } });
    
    // Wait for search results
    await waitFor(() => {
      const searchRows = screen.getAllByRole('row');
      const searchCount = searchRows.length - 1;
      // Should have fewer or equal courses after filtering
      expect(searchCount).toBeLessThanOrEqual(initialCount);
    }, { timeout: 5000 });
  }, 20000);

  it('verifies Convex query functions exist and are callable', async () => {
    // Test that our Convex queries are properly defined
    const convex = new ConvexReactClient(process.env.VITE_CONVEX_URL!);
    
    // Test basic list query
    const courses = await convex.query(api.courses.list);
    expect(Array.isArray(courses)).toBe(true);
    
    // Test paginated query
    const paginatedResult = await convex.query(api.courses.listPaginated, {
      paginationOpts: { numItems: 3, cursor: null }
    });
    
    expect(paginatedResult).toHaveProperty('page');
    expect(paginatedResult).toHaveProperty('isDone');
    expect(Array.isArray(paginatedResult.page)).toBe(true);
    expect(paginatedResult.page.length).toBeLessThanOrEqual(3);
    
    // Test search query
    const searchResult = await convex.query(api.courses.searchCourses, {
      searchTerm: 'ACCT'
    });
    expect(Array.isArray(searchResult)).toBe(true);
  }, 15000);
});