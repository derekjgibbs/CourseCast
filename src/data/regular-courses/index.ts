import { stdin } from "node:process";
import { strictEqual } from "node:assert";

import * as v from "valibot";
import papa from "papaparse";
import { parse } from "date-fns";

import { RegularCourse } from "./schema.ts";

/**
 * Converts time from "HH:mm a" format to minutes since midnight using date-fns
 * @param timeStr - Time string in format "HH:mm a" (e.g., "5:30 PM")
 * @returns Minutes since midnight
 */
function convertTimeToMinutes(now: Date, timeStr: string) {
  const trimmedTime = timeStr.trim();

  // Parse the time using date-fns with a reference date
  // We use a reference date to ensure consistent parsing
  const parsedDate = parse(trimmedTime, "h:mm a", now);

  // Extract hours and minutes from the parsed date
  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();

  // Convert to minutes since midnight
  return hours * 60 + minutes;
}

export async function readRegularCourses(now: Date) {
  const { promise, resolve, reject } = Promise.withResolvers<papa.ParseResult<unknown>>();
  papa.parse(stdin, {
    header: true,
    skipEmptyLines: true,
    error: e => reject(e),
    complete: results => resolve(results),
  });

  const { errors, data } = await promise;
  for (const error of errors) console.error(error);
  strictEqual(errors.length, 0);

  // Compiles all of the random numbers into one JSON array.
  return data.map(row => {
    const course = v.parse(RegularCourse, row);
    const startTime = convertTimeToMinutes(now, course.start_time);
    const stopTime = convertTimeToMinutes(now, course.stop_time);

    // Aggregate all the random values
    const randoms: number[] = [];
    for (const [key, value] of Object.entries(course)) {
      const num = Number.parseInt(key, 10);
      if (Number.isNaN(num)) continue;
      if (typeof value !== "number") continue;
      randoms.push(value);
    }

    return {
      type: "regular",
      forecastId: course.forecast_id,
      term: course.term,
      semester: course.semester,
      department: course.department,
      sectionCode: course.section_code,
      title: course.title,
      instructors: course.instructors,
      partOfTerm: course.part_of_term,
      startDate: course.start_date,
      endDate: course.end_date,
      daysCode: course.days_code,
      startTime,
      stopTime,
      startCategory: course.start_category,
      credits: course.credits,
      capacity: course.capacity,
      aggregatedCapacity: course.aggregated_capacity,
      truncatedPricePrediction: course.truncated_price_prediction,
      pricePredictionResidualMean: course.price_prediction_residual_mean,
      pricePredictionResidualStdDev: course.price_prediction_residual_std_dev,
      truncatedPriceFluctuations: randoms,
      conflictGroups: [] as string[],
    };
  });
}
