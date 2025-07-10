import React from 'react';
import { CourseDoc } from '../../convex/types';

interface CourseCatalogTableProps {
  courses: CourseDoc[];
}

const CourseCatalogTable: React.FC<CourseCatalogTableProps> = ({ courses }) => {
  return (
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
          {courses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No courses found
              </td>
            </tr>
          ) : (
            courses.map((course) => (
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
  );
};

export default CourseCatalogTable;