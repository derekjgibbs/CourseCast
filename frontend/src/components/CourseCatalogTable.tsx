import React, { useState, useMemo } from 'react';
import { CourseDoc } from '../../convex/types';

interface CourseCatalogTableProps {
  courses: CourseDoc[];
}

const CourseCatalogTable: React.FC<CourseCatalogTableProps> = ({ courses }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left border-b">Course ID</th>
            <th className="px-4 py-2 text-left border-b">Title</th>
            <th className="px-4 py-2 text-left border-b">Department</th>
            <th className="px-4 py-2 text-left border-b">Instructor</th>
            <th className="px-4 py-2 text-left border-b">Days</th>
            <th className="px-4 py-2 text-left border-b">Time</th>
            <th className="px-4 py-2 text-left border-b">Credits</th>
            <th className="px-4 py-2 text-left border-b">Price Forecast</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No courses found
              </td>
            </tr>
          ) : (
            filteredCourses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{course.course_id}</td>
                <td className="px-4 py-2 border-b">{course.title}</td>
                <td className="px-4 py-2 border-b">{course.department}</td>
                <td className="px-4 py-2 border-b">{course.instructor}</td>
                <td className="px-4 py-2 border-b">{course.days}</td>
                <td className="px-4 py-2 border-b">{course.start_time} - {course.end_time}</td>
                <td className="px-4 py-2 border-b">{course.credits}</td>
                <td className="px-4 py-2 border-b">{course.price_forecast}</td>
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