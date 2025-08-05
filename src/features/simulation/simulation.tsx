import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/schema/course";
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
import { useFetchedCourses } from "@/hooks/use-fetch-courses";

import type { OptimizationResponse } from "./solver";
import { getDayCodeSortIndex } from "./util";

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

interface ScheduleCourseData {
  courseId: string;
  title: string;
  department: string;
  sectionCode: string;
  startTime: number;
  stopTime: number;
  daysCode: string;
  credits: number;
}

interface ScheduleProbabilityData {
  scheduleHash: string;
  probability: number;
  occurrences: number;
  courses: ScheduleCourseData[];
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
      if (typeof course === "undefined") continue;
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

  const scheduleProbabilities = useMemo(() => {
    // Count occurrences of each unique schedule
    const scheduleCounts = new Map<string, ScheduleProbabilityData>();

    for (const response of responses) {
      // Get course details and sort by start_category
      const selectedCourseDetails = response.selectedCourses
        .reduce<Course[]>((acc, courseId) => {
          const course = courses.get(courseId);
          if (typeof course !== "undefined") acc.push(course);
          return acc;
        }, [])
        .sort((a, b) => a.start_time - b.start_time);

      // Create schedule hash by concatenating course IDs in alphabetical order
      const scheduleHash = selectedCourseDetails
        .map(({ forecast_id }) => forecast_id)
        .sort()
        .join("|");

      const existing = scheduleCounts.get(scheduleHash);
      if (typeof existing === "undefined")
        scheduleCounts.set(scheduleHash, {
          scheduleHash,
          probability: 1 / responses.length,
          occurrences: 1,
          courses: selectedCourseDetails
            .map(course => ({
              courseId: course.forecast_id,
              title: course.title,
              department: course.department,
              sectionCode: course.section_code,
              startTime: course.start_time,
              stopTime: course.stop_time,
              daysCode: course.days_code,
              credits: course.credits,
            }))
            .sort((a, b) => {
              const dayDiff = getDayCodeSortIndex(a.daysCode) - getDayCodeSortIndex(b.daysCode);
              return dayDiff === 0 ? a.startTime - b.startTime : dayDiff;
            }),
        });
      else {
        existing.occurrences += 1;
        existing.probability = existing.occurrences / responses.length;
      }
    }

    return Array.from(scheduleCounts.values()).sort((a, b) => b.probability - a.probability);
  }, [responses, courses]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simulation Results by Course</h3>
        {courseProbabilities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No courses were selected in any simulation runs
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Frequency</TableHead>
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
                if (course.probability < 0.4) {
                  progressClass = "stroke-red-600";
                  labelClass = "text-red-600";
                } else if (course.probability < 0.6) {
                  progressClass = "stroke-orange-600";
                  labelClass = "text-orange-600";
                } else if (course.probability < 0.8) {
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
                          labelClassName={cn("text-xs font-semibold", labelClass)}
                          showLabel
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold">{course.title}</div>
                        <div className="text-muted-foreground text-sm">{course.courseId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DepartmentBadge department={course.department} />
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simulation Results by Schedule</h3>
        {scheduleProbabilities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No schedules were generated in simulation runs
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Frequency</TableHead>
                <TableHead className="text-center">Total Credits</TableHead>
                <TableHead>Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleProbabilities.map(schedule => {
                let progressClass: string;
                let labelClass: string;
                if (schedule.probability < 0.4) {
                  progressClass = "stroke-red-600";
                  labelClass = "text-red-600";
                } else if (schedule.probability < 0.6) {
                  progressClass = "stroke-orange-600";
                  labelClass = "text-orange-600";
                } else if (schedule.probability < 0.8) {
                  progressClass = "stroke-yellow-600";
                  labelClass = "text-yellow-600";
                } else {
                  progressClass = "stroke-green-600";
                  labelClass = "text-green-600";
                }
                const totalCredits = schedule.courses.reduce(
                  (sum, course) => sum + course.credits,
                  0,
                );
                return (
                  <TableRow key={schedule.scheduleHash}>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-3">
                        <RadialProgress
                          size={96}
                          strokeWidth={8}
                          value={schedule.probability * 100}
                          className="stroke-muted"
                          progressClassName={progressClass}
                          showLabel={true}
                          labelClassName={cn("text-lg font-semibold", labelClass)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-lg font-semibold">
                      {totalCredits}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {schedule.courses.map(course => (
                          <div key={course.courseId} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{course.title}</div>
                              <div className="text-muted-foreground text-xs">{course.courseId}</div>
                              <div className="text-muted-foreground text-xs">
                                {course.daysCode} &middot;{" "}
                                {formatTimeRange(course.startTime, course.stopTime)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
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
