import { Bookmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DepartmentBadge } from "@/features/department-badge";
import { formatTimeRange } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Course {
  forecast_id: string;
  section_code: string;
  title: string;
  department: string;
  instructors: string[];
  days_code: string;
  start_time: number;
  stop_time: number;
  credits: number;
  truncated_price_prediction: number;
  part_of_term: string[];
}

interface FixedCoursesTableProps {
  courses: Course[];
}

export function FixedCoursesTable({ courses }: FixedCoursesTableProps) {
  return courses.length === 0 ? (
    <div className="flex flex-col items-center space-y-2 p-8">
      <Bookmark className="size-8 text-gray-400" />
      <span className="text-sm font-medium text-gray-600">No fixed courses configured</span>
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Section</TableHead>
          <TableHead className="text-left">Title</TableHead>
          <TableHead className="text-center">Department</TableHead>
          <TableHead className="text-center">Instructor</TableHead>
          <TableHead className="text-center">Schedule</TableHead>
          <TableHead className="text-center">Credits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-center">
        {courses.map(course => (
          <TableRow key={course.forecast_id}>
            <TableCell className="font-mono text-sm font-medium text-gray-600">
              {course.forecast_id}
            </TableCell>
            <TableCell>
              <div className="size-full text-left font-semibold text-gray-900">{course.title}</div>
            </TableCell>
            <TableCell>
              <DepartmentBadge department={course.department} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {course.instructors.map(instructor => (
                  <Badge key={instructor} variant="outline" className="text-xs">
                    {instructor}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{course.days_code}</div>
                <div className="text-gray-500">
                  {formatTimeRange(course.start_time, course.stop_time)}
                </div>
                <div className="mt-1 flex justify-center gap-1">
                  {course.part_of_term.length > 0 ? (
                    course.part_of_term.map(term => (
                      <Badge key={term} variant="secondary" className="text-xs">
                        {term}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      TBA
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-lg font-bold text-green-600">{course.credits}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
