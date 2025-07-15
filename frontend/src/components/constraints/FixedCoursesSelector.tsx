import React, { useState, useMemo } from "react";
import { Search, BookCheck, Filter, X, Clock, User, GraduationCap, Loader2 } from "lucide-react";
import type { CourseDoc } from "@/convex/types";

interface FixedCoursesSelectorProps {
  courses?: CourseDoc[];
  selectedCourses: string[];
  onSelectionChange: (selectedCourseIds: string[]) => void;
  isLoading?: boolean;
}

const departmentGradients = {
  ACCT: "bg-gradient-to-r from-blue-500 to-indigo-600",
  REAL: "bg-gradient-to-r from-green-500 to-emerald-600",
  FINC: "bg-gradient-to-r from-purple-500 to-violet-600",
  MKTG: "bg-gradient-to-r from-pink-500 to-rose-600",
  OIDD: "bg-gradient-to-r from-orange-500 to-amber-600",
  MGMT: "bg-gradient-to-r from-cyan-500 to-blue-600",
  STAT: "bg-gradient-to-r from-red-500 to-pink-600",
  BEPP: "bg-gradient-to-r from-teal-500 to-cyan-600",
  LGST: "bg-gradient-to-r from-slate-500 to-gray-600",
} as const;

const FixedCoursesSelector: React.FC<FixedCoursesSelectorProps> = ({
  courses = [],
  selectedCourses,
  onSelectionChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Get unique departments from courses
  const departments = useMemo(() => {
    const depts = [...new Set(courses.map(course => course.department))].sort();
    return depts;
  }, [courses]);

  // Filter courses based on search and department
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter(course => {
      const matchesSearch =
        !searchTerm.trim() ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;

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
    const gradientClass =
      departmentGradients[course.department as keyof typeof departmentGradients] ||
      "bg-gradient-to-r from-gray-500 to-gray-600";

    return (
      <div
        key={course.course_id}
        data-testid={`course-item-${course.course_id}`}
        className={`hover:bg-opacity-30 cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
          isSelected
            ? "bg-opacity-70 border-blue-200 bg-blue-50"
            : "bg-opacity-50 border-opacity-30 border-white bg-white"
        }`}
        onClick={() => handleCourseToggle(course.course_id)}
      >
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCourseToggle(course.course_id)}
            onClick={e => e.stopPropagation()}
            data-testid={`course-checkbox-${course.course_id}`}
            aria-label={`Select ${course.title}`}
            tabIndex={0}
            className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">{course.course_id}</span>
                <span
                  data-testid={`dept-badge-${course.department}`}
                  className={`bg-opacity-90 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${gradientClass}`}
                >
                  {course.department}
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">{course.credits}</span>
            </div>

            <h3 className="mb-2 text-sm leading-tight font-semibold text-gray-900">
              {course.title}
            </h3>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {course.days} {course.start_time}
                </span>
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
        className="bg-opacity-20 border-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="mr-3 h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="fixed-courses-container"
      className="bg-opacity-20 border-opacity-30 hover:bg-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm transition-all duration-300"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2">
            <BookCheck className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Required Courses</h2>
        </div>

        {selectedCourses.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{selectedCourses.length} courses selected</span>
            <button
              onClick={handleClearSelection}
              className="text-sm font-medium text-red-600 transition-colors duration-200 hover:text-red-800"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search courses"
            className="border-opacity-20 bg-opacity-50 focus:bg-opacity-70 w-full rounded-xl border border-white bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="border-opacity-20 bg-opacity-50 focus:bg-opacity-70 w-full appearance-none rounded-xl border border-white bg-white py-2 pr-8 pl-10 text-gray-900 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course List */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {!courses || courses.length === 0 ? (
          <div className="py-8 text-center">
            <GraduationCap className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No courses available</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-8 text-center">
            <Search className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No courses found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredCourses.map(renderCourseItem)
        )}
      </div>

      {/* Summary */}
      {filteredCourses.length > 0 && (
        <div className="border-opacity-20 mt-6 border-t border-white pt-4">
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
