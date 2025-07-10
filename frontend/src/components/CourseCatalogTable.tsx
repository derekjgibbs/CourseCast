import React, { useState, useMemo, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { 
  Search, 
  Download, 
  BookOpen, 
  Clock, 
  User, 
  DollarSign,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { CourseDoc } from '../../convex/types';

interface CourseCatalogTableProps {
  courses: CourseDoc[];
  pageSize?: number;
}

const columnHelper = createColumnHelper<CourseDoc>();

const departmentGradients = {
  ACCT: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  REAL: 'bg-gradient-to-r from-green-500 to-emerald-600',
  FINC: 'bg-gradient-to-r from-purple-500 to-violet-600',
  MKTG: 'bg-gradient-to-r from-pink-500 to-rose-600',
  OIDD: 'bg-gradient-to-r from-orange-500 to-amber-600',
  MGMT: 'bg-gradient-to-r from-cyan-500 to-blue-600',
  STAT: 'bg-gradient-to-r from-red-500 to-pink-600',
  BEPP: 'bg-gradient-to-r from-teal-500 to-cyan-600',
  LGST: 'bg-gradient-to-r from-slate-500 to-gray-600',
} as const;

const columns = [
  columnHelper.accessor('course_id', {
    header: () => (
      <div className="flex items-center space-x-2">
        <BookOpen className="w-4 h-4" />
        <span>Course ID</span>
      </div>
    ),
    cell: info => (
      <span className="text-gray-600 text-sm font-medium">{info.getValue()}</span>
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
      const gradientClass = departmentGradients[dept as keyof typeof departmentGradients] || 'bg-gradient-to-r from-gray-500 to-gray-600';
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-xl ${gradientClass}`}>
          {dept}
        </span>
      );
    },
  }),
  columnHelper.accessor('instructor', {
    header: () => (
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4" />
        <span>Instructor</span>
      </div>
    ),
    cell: info => (
      <span className="text-gray-600 font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor(row => {
    const schedule = { days: row.days, time: `${row.start_time} - ${row.end_time}` };
    return schedule;
  }, {
    id: 'schedule',
    header: () => (
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span>Schedule</span>
      </div>
    ),
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
    header: () => (
      <div className="flex items-center space-x-2">
        <DollarSign className="w-4 h-4" />
        <span>Price Forecast</span>
      </div>
    ),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Course Catalog
          </h1>
          <p className="text-gray-600 text-lg">Discover and explore available courses</p>
        </div>
      
        {/* Search and Export Controls */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-6 transition-all duration-300 hover:bg-opacity-30">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300 focus:bg-opacity-70"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV {filteredCourses.length > 0 && `(${filteredCourses.length} courses)`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-white border-opacity-20">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-white bg-opacity-10 backdrop-blur-sm">
                        {header.isPlaceholder ? null : (
                          <button
                            className="flex items-center space-x-1 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md p-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            <span className="ml-1 text-gray-500">
                              {{
                                asc: <ChevronUp className="w-4 h-4" />,
                                desc: <ChevronDown className="w-4 h-4" />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white bg-opacity-5 backdrop-blur-sm">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                      <div className="flex flex-col items-center space-y-2">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                        <span>No courses found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id} className={`${rowIndex !== table.getRowModel().rows.length - 1 ? 'border-b border-white border-opacity-10' : ''} hover:bg-white hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm`}>
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
          <div className="flex items-center justify-between bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 px-6 py-4">
            <div className="text-sm text-gray-700 font-medium">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white bg-opacity-50 backdrop-blur-sm border border-white border-opacity-30 rounded-lg hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white bg-opacity-50 backdrop-blur-sm border border-white border-opacity-30 rounded-lg hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalogTable;