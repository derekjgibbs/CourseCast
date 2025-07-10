import React, { useState, useMemo } from 'react';
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
}

const columnHelper = createColumnHelper<CourseDoc>();

const columns = [
  columnHelper.accessor('course_id', {
    header: 'Course ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('instructor', {
    header: 'Instructor',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('days', {
    header: 'Days',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor(row => `${row.start_time} - ${row.end_time}`, {
    id: 'time',
    header: 'Time',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('credits', {
    header: 'Credits',
    cell: info => info.getValue(),
    sortingFn: 'basic',
  }),
  columnHelper.accessor('price_forecast', {
    header: 'Price Forecast',
    cell: info => info.getValue(),
    sortingFn: 'basic',
  }),
];

const CourseCatalogTable: React.FC<CourseCatalogTableProps> = ({ courses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const table = useReactTable({
    data: filteredCourses,
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
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2 text-left border-b">
                    {header.isPlaceholder ? null : (
                      <button
                        className="flex items-center space-x-1 hover:bg-gray-200 p-1 rounded"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="ml-1">
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
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 border-b">
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
  );
};

export default CourseCatalogTable;