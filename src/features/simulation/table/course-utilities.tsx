import { Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DepartmentBadge } from "@/features/department-badge";
import { formatTimeRange } from "@/lib/date";
import { RadialProgress } from "@/components/ui/radial-progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseWithUtility {
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
  utility: number;
  part_of_term: string[];
}

interface CourseUtilitiesTableProps {
  coursesWithUtilities: CourseWithUtility[];
}

export function CourseUtilitiesTable({ coursesWithUtilities }: CourseUtilitiesTableProps) {
  return coursesWithUtilities.length === 0 ? (
    <div className="flex flex-col items-center space-y-2 p-8">
      <Heart className="size-8 text-gray-400" />
      <span className="text-sm font-medium text-gray-600">No course utilities configured</span>
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Utility</TableHead>
          <TableHead className="text-center">Section</TableHead>
          <TableHead className="text-left">Title</TableHead>
          <TableHead className="text-center">Department</TableHead>
          <TableHead className="text-center">Instructor</TableHead>
          <TableHead className="text-center">Schedule</TableHead>
          <TableHead className="text-center">Credits</TableHead>
          <TableHead className="text-center">Price Forecast</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-center">
        {coursesWithUtilities
          .sort((a, b) => Number(b.utility - a.utility))
          .map(course => (
            <TableRow key={course.forecast_id}>
              <TableCell>
                <div className="flex items-center justify-center">
                  <RadialProgress
                    size={64}
                    strokeWidth={4}
                    value={Number(course.utility)}
                    labelClassName="text-purple-600 text-xs text-center"
                    progressClassName="stroke-purple-600"
                    showLabel
                  />
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm font-medium text-gray-600">
                {course.forecast_id}
              </TableCell>
              <TableCell>
                <div className="size-full text-left font-semibold text-gray-900">
                  {course.title}
                </div>
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
              <TableCell>
                <span className="text-lg font-bold text-red-600">
                  {course.truncated_price_prediction}
                </span>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
