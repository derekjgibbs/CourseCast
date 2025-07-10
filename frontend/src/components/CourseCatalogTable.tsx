import React, { useState, useMemo, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CourseDoc } from '../../convex/types';

interface CourseCatalogTableProps {
  courses: CourseDoc[];
  pageSize?: number;
}

const columnHelper = createColumnHelper<CourseDoc>();

const columns = [
  columnHelper.accessor('course_id', {
    header: 'Course ID',
    cell: info => (
      <span className="text-gray-600 text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => (
      <span className="text-gray-900 font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    cell: info => {
      const dept = info.getValue();
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-indigo-500">
          {dept}
        </span>
      );
    },
  }),
  columnHelper.accessor('instructor', {
    header: 'Instructor',
    cell: info => (
      <span className="text-gray-600">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor(row => {
    const schedule = { days: row.days, time: `${row.start_time} - ${row.end_time}` };
    return schedule;
  }, {
    id: 'schedule',
    header: 'Schedule',
    cell: info => {
      const { days, time } = info.getValue();
      return (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{days}</div>
          <div className="text-gray-500">{time}</div>
        </div>
      );
    },
  }),
  columnHelper.accessor('credits', {
    header: 'Credits',
    cell: info => (
      <span className="text-green-600 font-bold text-lg">{info.getValue()}</span>
    ),
    sortingFn: 'basic',
  }),
  columnHelper.accessor('price_forecast', {
    header: 'Price Forecast',
    cell: info => {
      const value = info.getValue();
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      return (
        <span className="text-red-500 font-bold text-lg">{formattedPrice}</span>
      );
    },
    sortingFn: 'basic',
  }),
];

const CourseCatalogTable: React.FC<CourseCatalogTableProps> = ({ courses, pageSize = 10 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return courses;
    }

    const searchLower = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchLower) ||
      course.course_id.toLowerCase().includes(searchLower) ||
      course.instructor.toLowerCase().includes(searchLower)
    );
  }, [courses, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const shouldShowPagination = filteredCourses.length > pageSize;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const generateCSV = (courses: CourseDoc[]) => {
    const headers = ['Course ID', 'Title', 'Department', 'Instructor', 'Schedule', 'Credits', 'Price Forecast'];
    
    return [
      headers.join(','),
      ...courses.map(course => [
        course.course_id,
        `"${course.title}"`,
        course.department,
        course.instructor,
        `"${course.days} ${course.start_time} - ${course.end_time}"`,
        course.credits,
        course.price_forecast,
      ].join(','))
    ].join('\n');
  };

  const exportToCSV = () => {
    const csvContent = generateCSV(filteredCourses);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'courses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const table = useReactTable({
    data: paginatedCourses,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortDescFirst: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
      </div>
      
      {/* Search and Export Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export CSV {filteredCourses.length > 0 && `(${filteredCourses.length} courses)`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-100">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-left text-sm font-medium text-gray-500 bg-white">
                      {header.isPlaceholder ? null : (
                        <button
                          className="flex items-center space-x-1 hover:text-gray-700"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          <span className="ml-1 text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <tr key={row.id} className={`${rowIndex !== table.getRowModel().rows.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-6 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {shouldShowPagination && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-4">
          <div className="text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalogTable;