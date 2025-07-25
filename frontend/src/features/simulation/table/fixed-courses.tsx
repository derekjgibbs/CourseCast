import { BookOpen } from "lucide-react";

import type { Course } from "@/lib/schema/course";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function DepartmentBadge({ department }: { department: string }) {
  let gradientClass: string;
  switch (department) {
    case "ACCT":
      gradientClass = "bg-gradient-to-r from-blue-500 to-indigo-600";
      break;
    case "REAL":
      gradientClass = "bg-gradient-to-r from-green-500 to-emerald-600";
      break;
    case "FINC":
      gradientClass = "bg-gradient-to-r from-purple-500 to-violet-600";
      break;
    case "MKTG":
      gradientClass = "bg-gradient-to-r from-pink-500 to-rose-600";
      break;
    case "OIDD":
      gradientClass = "bg-gradient-to-r from-orange-500 to-amber-600";
      break;
    case "MGMT":
      gradientClass = "bg-gradient-to-r from-cyan-500 to-blue-600";
      break;
    case "STAT":
      gradientClass = "bg-gradient-to-r from-red-500 to-pink-600";
      break;
    case "BEPP":
      gradientClass = "bg-gradient-to-r from-teal-500 to-cyan-600";
      break;
    case "LGST":
      gradientClass = "bg-gradient-to-r from-slate-500 to-gray-600";
      break;
    default:
      gradientClass = "bg-gradient-to-r from-gray-500 to-gray-600";
  }
  return (
    <span
      className={cn(
        "bg-opacity-90 rounded-full px-3 py-1 text-center text-xs font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl",
        gradientClass,
      )}
    >
      {department}
    </span>
  );
}

interface FixedCoursesTableProps {
  courses: Course[];
}

export function FixedCoursesTable({ courses }: FixedCoursesTableProps) {
  return courses.length === 0 ? (
    <div className="flex flex-col items-center space-y-2 p-8">
      <BookOpen className="size-8 text-gray-400" />
      <span className="text-sm font-medium text-gray-600">No fixed courses configured</span>
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Section Code</TableHead>
          <TableHead className="text-center">Title</TableHead>
          <TableHead className="text-center">Department</TableHead>
          <TableHead className="text-center">Instructor</TableHead>
          <TableHead className="text-center">Schedule</TableHead>
          <TableHead className="text-center">Credits</TableHead>
          <TableHead className="text-center">Price Forecast</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-center">
        {courses.map(course => (
          <TableRow key={course.forecast_id}>
            <TableCell className="font-mono text-sm font-medium text-gray-600">
              {course.section_code}
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
                  {course.start_time} - {course.stop_time}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-lg font-bold text-green-600">{course.credits}</span>
            </TableCell>
            <TableCell>
              <span className="text-lg font-bold text-red-500">
                {formatter.format(course.truncated_price_prediction)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
