import React, { useState, useMemo } from 'react';
import {
  Search,
  BookCheck,
  Filter,
  X,
  Clock,
  User,
  GraduationCap,
  Loader2
} from 'lucide-react';
import type { CourseDoc } from '@/convex/types';

interface FixedCoursesSelectorProps {
  courses?: CourseDoc[];
  selectedCourses: string[];
  onSelectionChange: (selectedCourseIds: string[]) => void;
  isLoading?: boolean;
}

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

const FixedCoursesSelector: React.FC<FixedCoursesSelectorProps> = ({
  courses = [],
  selectedCourses,
  onSelectionChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Get unique departments from courses
  const departments = useMemo(() => {
    const depts = [...new Set(courses.map(course => course.department))].sort();
    return depts;
  }, [courses]);

  // Filter courses based on search and department
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter(course => {
      const matchesSearch = !searchTerm.trim() ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !selectedDepartment ||
        course.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [courses, searchTerm, selectedDepartment]);

  const handleCourseToggle = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      onSelectionChange(selectedCourses.filter(id => id !== courseId));
    } else {
      onSelectionChange([...selectedCourses, courseId]);
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const renderCourseItem = (course: CourseDoc) => {
    const isSelected = selectedCourses.includes(course.course_id);
    const gradientClass = departmentGradients[course.department as keyof typeof departmentGradients] || 'bg-gradient-to-r from-gray-500 to-gray-600';

    return (
      <div
        key={course.course_id}
        data-testid={`course-item-${course.course_id}`}
        className={`p-4 border rounded-xl transition-all duration-300 hover:bg-opacity-30 cursor-pointer ${
          isSelected
            ? 'bg-blue-50 border-blue-200 bg-opacity-70'
            : 'bg-white bg-opacity-50 border-white border-opacity-30'
        }`}
        onClick={() => handleCourseToggle(course.course_id)}
      >
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCourseToggle(course.course_id)}
            onClick={(e) => e.stopPropagation()}
            data-testid={`course-checkbox-${course.course_id}`}
            aria-label={`Select ${course.title}`}
            tabIndex={0}
            className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">{course.course_id}</span>
                <span
                  data-testid={`dept-badge-${course.department}`}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white shadow-lg backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-xl ${gradientClass}`}
                >
                  {course.department}
                </span>
              </div>
              <span className="text-green-600 font-bold text-sm">{course.credits}</span>
            </div>

            <h3 className="text-gray-900 font-semibold text-sm mb-2 leading-tight">
              {course.title}
            </h3>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{course.days} {course.start_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        data-testid="fixed-courses-container"
        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600 text-lg">Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="fixed-courses-container"
      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8 transition-all duration-300 hover:bg-opacity-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <BookCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Required Courses</h2>
        </div>

        {selectedCourses.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedCourses.length} courses selected
            </span>
            <button
              onClick={handleClearSelection}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search courses"
            className="w-full pl-10 pr-4 py-2 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300 focus:bg-opacity-70"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-300 focus:bg-opacity-70 appearance-none"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {!courses || courses.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No courses available</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No courses found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredCourses.map(renderCourseItem)
        )}
      </div>

      {/* Summary */}
      {filteredCourses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white border-opacity-20">
          <p className="text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses?.length || 0} courses
            {selectedCourses.length > 0 && (
              <span className="ml-2 font-medium text-blue-600">
                • {selectedCourses.length} selected
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default FixedCoursesSelector;
