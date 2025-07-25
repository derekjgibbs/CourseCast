import type { OptimizationResponse } from "./solver";

import { useMemo } from "react";

import { useFetchedCourses } from "@/hooks/use-fetch-courses";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadialProgress } from "@/components/ui/radial-progress";

interface SimulationSummaryProps {
  responses: OptimizationResponse[];
}

interface CourseProbabilityData {
  courseId: string;
  probability: number;
  occurrences: number;
  title: string;
  department: string;
  credits: number;
  instructors: string[];
  sectionCode: string;
}

export function SimulationSummary({ responses }: SimulationSummaryProps) {
  const courses = useFetchedCourses();

  const courseProbabilities = useMemo(() => {
    // Count occurrences of each course across all simulation runs
    const courseCounts = new Map<string, number>();
    for (const response of responses)
      for (const courseId of response.selectedCourses) {
        const count = courseCounts.get(courseId) ?? 0;
        courseCounts.set(courseId, count + 1);
      }

    // Calculate probabilities and create enriched data
    const probabilityData: CourseProbabilityData[] = [];
    for (const [courseId, occurrences] of courseCounts) {
      const course = courses.get(courseId);
      if (typeof course !== "undefined")
        probabilityData.push({
          courseId,
          probability: occurrences / responses.length,
          occurrences,
          title: course.title,
          department: course.department,
          credits: course.credits,
          instructors: course.instructors,
          sectionCode: course.section_code,
        });
    }

    return probabilityData.sort((a, b) => {
      const diff = b.probability - a.probability;
      return diff === 0 ? a.title.localeCompare(b.title) : diff;
    });
  }, [responses, courses]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Course Selection Probabilities</h3>
        {courseProbabilities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No courses were selected in any simulation runs
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Probability</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Instructors</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseProbabilities.map(course => {
                let progressClass: string;
                let labelClass: string;
                if (course.probability < 0.2) {
                  progressClass = "stroke-red-600";
                  labelClass = "text-red-600";
                } else if (course.probability < 0.4) {
                  progressClass = "stroke-orange-600";
                  labelClass = "text-orange-600";
                } else if (course.probability < 0.6) {
                  progressClass = "stroke-yellow-600";
                  labelClass = "text-yellow-600";
                } else {
                  progressClass = "stroke-green-600";
                  labelClass = "text-green-600";
                }
                return (
                  <TableRow key={course.courseId}>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-3">
                        <RadialProgress
                          size={64}
                          strokeWidth={4}
                          value={course.probability * 100}
                          className="stroke-muted"
                          progressClassName={progressClass}
                          showLabel={true}
                          labelClassName={cn("text-xs font-semibold", labelClass)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold">{course.title}</div>
                        <div className="text-muted-foreground text-sm">{course.sectionCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dept = course.department;
                        let gradientClass: string;
                        switch (dept) {
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
                            {dept}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="max-w-48">
                      <div className="flex flex-wrap gap-1">
                        {course.instructors.length > 0 ? (
                          course.instructors.map(instructor => (
                            <Badge key={instructor} variant="outline">
                              {instructor}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">TBA</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{course.credits}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
