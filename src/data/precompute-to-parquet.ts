import assert, { strictEqual } from "node:assert";
import { stdin } from "node:process";

import papa from "papaparse";
import { parquetWriteFile } from "hyparquet-writer";
import { parse } from "date-fns";

const NOW = new Date();

/**
 * Converts time from "HH:mm a" format to minutes since midnight using date-fns
 * @param timeStr - Time string in format "HH:mm a" (e.g., "5:30 PM")
 * @returns {number} Minutes since midnight
 */
function convertTimeToMinutes(timeStr: string) {
  const trimmedTime = timeStr.trim();

  // Parse the time using date-fns with a reference date
  // We use a reference date to ensure consistent parsing
  const parsedDate = parse(trimmedTime, "h:mm a", NOW);

  // Extract hours and minutes from the parsed date
  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();

  // Convert to minutes since midnight
  return hours * 60 + minutes;
}

interface Course {
  forecast_id: string;
  term: number;
  semester: string;
  department: string;
  section_code: string;
  title: string;
  instructors: string[];
  part_of_term: string;
  start_date: string;
  end_date: string;
  days_code: string;
  start_time: number;
  stop_time: number;
  start_category: string;
  credits: number;
  capacity: number;
  aggregated_capacity: number;
  truncated_price_prediction: number;
  price_prediction_residual_mean: number;
  price_prediction_residual_std_dev: number;
  truncated_price_fluctuations: number[];
  conflict_groups?: string[];
}

type CsvResult = papa.ParseResult<Course>;
const { promise, resolve, reject } = Promise.withResolvers<CsvResult>();
papa.parse(stdin, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  transform: (value, field) => {
    switch (field) {
      case "start_time":
      case "stop_time":
        return convertTimeToMinutes(value);
      case "instructors":
        return value.trim().split(",");
      default:
        return value;
    }
  },
  error: e => reject(e),
  complete: results => resolve(results as CsvResult),
});

const { errors, data } = await promise;
for (const error of errors) console.error(error);
strictEqual(errors.length, 0);

// Compiles all of the random numbers into one JSON array.
for (const course of data) {
  const randoms: number[] = [];
  for (const [key, value] of Object.entries(course)) {
    const num = Number.parseInt(key, 10);
    if (Number.isNaN(num)) continue;
    if (typeof value !== "number") continue;
    randoms.push(value);
  }
  course.truncated_price_fluctuations = randoms;
}

function getTermCodes(partOfTerm: string) {
  switch (partOfTerm) {
    case "Q1":
      return ["Q1"];
    case "Q2":
      return ["Q2"];
    case "Q3":
      return ["Q3"];
    case "Q4":
      return ["Q4"];
    case "F":
      return ["Q1", "Q2"];
    case "S":
      return ["Q3", "Q4"];
    case "Full":
      return ["Q1", "Q2", "Q3", "Q4"];
    case "Modular":
      return ["Modular"];
    default:
      throw new Error(`unknown part of term: ${partOfTerm}`);
  }
}

function getDayCodes(daysCode: string) {
  switch (daysCode) {
    case "M":
      return ["M"];
    case "T":
      return ["T"];
    case "W":
      return ["W"];
    case "R":
      return ["R"];
    case "F":
      return ["F"];
    case "S":
      return ["S"];
    case "U":
      return ["U"];
    case "MW":
      return ["M", "W"];
    case "TR":
      return ["T", "R"];
    case "FS":
      return ["F", "S"];
    case "TBA":
      return ["TBA"];
    default:
      throw new Error(`unknown days code: ${daysCode}`);
  }
}

// Step 1: Find all direct time conflicts
const directConflicts = new Map<string, string>();
data.sort((a, b) => a.start_time - b.start_time);
for (let i = 0; i < data.length; ++i) {
  const courseA = data[i];
  assert(typeof courseA !== "undefined");

  // Skip courses with unknown time slots with sentinel value [0, 0)
  if (courseA.start_time === 0 && courseA.stop_time === 0) continue;

  // Only check courses that start before this course ends
  // Since data is sorted by start_time, we can optimize by only looking ahead
  for (let j = i + 1; j < data.length; ++j) {
    const courseB = data[j];
    assert(typeof courseB !== "undefined");

    // Skip courses with unknown time slots with sentinel value [0, 0)
    if (courseB.start_time === 0 && courseB.stop_time === 0) continue;

    // Early termination: if courseB starts after courseA ends, no more conflicts possible
    if (courseB.start_time >= courseA.stop_time) break;

    // Check if courses have overlapping terms (part_of_term)
    const termsA = getTermCodes(courseA.part_of_term);
    const termsB = getTermCodes(courseB.part_of_term);

    // Check for term overlap (any common term)
    const hasTermOverlap = termsA.some(term => termsB.includes(term));
    if (!hasTermOverlap) continue; // No term overlap, no conflict

    // Check if courses have overlapping days
    const daysA = getDayCodes(courseA.days_code);
    const daysB = getDayCodes(courseB.days_code);

    // Check for day overlap (any common day, excluding TBA)
    const hasDayOverlap = daysA.some(day =>
      day !== "TBA" && daysB.includes(day)
    );
    if (!hasDayOverlap) continue; // No day overlap, no conflict

    // Check for time overlap using half-open range logic
    // Two ranges [a, b) and [c, d) overlap if a < d && c < b
    // Since we already know courseB.start_time < courseA.stop_time (from the break condition above),
    // we only need to check if courseA.start_time < courseB.stop_time
    if (courseA.start_time < courseB.stop_time) {
      // Create alphabetically sorted key for consistent ordering
      const [a, b] = [courseA.forecast_id, courseB.forecast_id].sort();
      assert(typeof a !== "undefined");
      assert(typeof b !== "undefined");
      directConflicts.set(a, b);
    }
  }
}

// Step 2: Create time conflict groups directly from direct conflicts
const timeConflictGroups = new Map<string, Set<string>>();

// Process each direct conflict to create conflict groups
for (const [courseA, courseB] of directConflicts.entries()) {
  // Get the actual course objects
  const courseAObj = data.find(c => c.forecast_id === courseA);
  const courseBObj = data.find(c => c.forecast_id === courseB);

  if (typeof courseAObj === "undefined" || typeof courseBObj === "undefined") {
    console.warn(`Course not found for conflict: ${courseA} vs ${courseB}`);
    continue;
  }

  // Create conflict group name: term codes + days code + sorted forecast IDs
  const termsA = getTermCodes(courseAObj.part_of_term);
  const termsB = getTermCodes(courseBObj.part_of_term);
  const daysA = getDayCodes(courseAObj.days_code);
  const daysB = getDayCodes(courseBObj.days_code);

  // Find common terms and days
  const commonTerms = termsA.filter(term => termsB.includes(term));
  const commonDays = daysA.filter(day => day !== "TBA" && daysB.includes(day));

  if (commonTerms.length === 0 || commonDays.length === 0)
    continue;

  // Create group name: term codes + days code + sorted IDs
  const termCode = commonTerms.join("");
  const dayCode = commonDays.join("");
  const sortedIds = [courseA, courseB].sort();
  const groupName = `time_${termCode}_${dayCode}_${sortedIds[0]}_${sortedIds[1]}`;

  // Add courses to the conflict group
  let group = timeConflictGroups.get(groupName);
  if (typeof group === "undefined") {
    group = new Set();
    timeConflictGroups.set(groupName, group);
  }
  group.add(courseA);
  group.add(courseB);
}

// Step 3: Create course section groups
const courseSectionGroups = new Map<string, string[]>();
for (const course of data) {
  const courseId = course.forecast_id.substring(0, 8);
  let sections = courseSectionGroups.get(courseId);
  if (typeof sections === "undefined") {
    sections = [];
    courseSectionGroups.set(courseId, sections);
  }
  sections.push(course.forecast_id);
}

// Step 4: Add conflict groups to each course
for (const course of data) {
  course.conflict_groups = [];

  // Add time conflict groups
  const timeGroups = Array.from(timeConflictGroups.entries()).filter(([_, group]) => group.has(course.forecast_id));
  for (const [groupName, group] of timeGroups)
    if (group.size > 1)
      course.conflict_groups.push(groupName);

  // Add course section groups
  const courseId = course.forecast_id.substring(0, 8);
  const sections = courseSectionGroups.get(courseId);
  assert(typeof sections !== "undefined");

  // Only add section group if there are multiple sections
  if (sections.length > 1) course.conflict_groups.push(`section_${courseId}`);
}

// Sort the courses by title in alphabetical order initially.
data.sort((a, b) => a.title.localeCompare(b.title));
parquetWriteFile({
  filename: "public/courses.parquet",
  columnData: [
    { name: "forecast_id", data: data.map(c => c.forecast_id), type: "STRING" },
    { name: "term", data: data.map(c => c.term), type: "INT32" },
    { name: "semester", data: data.map(c => c.semester), type: "STRING" },
    { name: "department", data: data.map(c => c.department), type: "STRING" },
    { name: "section_code", data: data.map(c => c.section_code), type: "STRING" },
    { name: "title", data: data.map(c => c.title), type: "STRING" },
    { name: "instructors", data: data.map(c => c.instructors), type: "JSON" },
    { name: "part_of_term", data: data.map(c => c.part_of_term), type: "STRING" },
    { name: "start_date", data: data.map(c => c.start_date), type: "STRING" },
    { name: "end_date", data: data.map(c => c.end_date), type: "STRING" },
    { name: "days_code", data: data.map(c => c.days_code), type: "STRING" },
    { name: "start_time", data: data.map(c => c.start_time), type: "INT32" },
    { name: "stop_time", data: data.map(c => c.stop_time), type: "INT32" },
    { name: "start_category", data: data.map(c => c.start_category), type: "STRING" },
    { name: "credits", data: data.map(c => c.credits), type: "DOUBLE" },
    { name: "capacity", data: data.map(c => c.capacity), type: "INT32" },
    { name: "aggregated_capacity", data: data.map(c => c.aggregated_capacity), type: "INT32" },
    { name: "truncated_price_prediction", data: data.map(c => c.truncated_price_prediction), type: "INT32" },
    { name: "price_prediction_residual_mean", data: data.map(c => c.price_prediction_residual_mean), type: "INT32" },
    { name: "price_prediction_residual_std_dev", data: data.map(c => c.price_prediction_residual_std_dev), type: "INT32" },
    { name: "truncated_price_fluctuations", data: data.map(c => c.truncated_price_fluctuations), type: "JSON" },
    { name: "conflict_groups", data: data.map(c => c.conflict_groups ?? []), type: "JSON" },
  ],
});
