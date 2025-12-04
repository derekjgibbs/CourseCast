import assert from "node:assert/strict";

import { parquetWriteFile } from "hyparquet-writer";

import { getDayCodes, getOrInitValues, getTermCodes } from "./util.ts";

import { readFixedCoreAssignments } from "./fixed-core/index.ts";
import { readRegularCourses } from "./regular-courses/index.ts";

const now = new Date();

const [fixedCore, regularCourses] = await Promise.all([
  readFixedCoreAssignments(now),
  readRegularCourses(now),
]);

// Step 0: Combine fixed core and regular courses
const data = [...fixedCore, ...regularCourses];

// Step 1: Find all direct time conflicts
// Store as a set of sorted course-id pairs to capture all conflicts
const directConflicts = new Set<string>();
data.sort((a, b) => a.startTime - b.startTime);
for (let i = 0; i < data.length; ++i) {
  const courseA = data[i];
  assert(typeof courseA !== "undefined");

  // Skip courses with unknown time slots with sentinel value [0, 0)
  if (courseA.startTime === 0 && courseA.stopTime === 0) continue;

  // Only check courses that start before this course ends
  // Since data is sorted by start_time, we can optimize by only looking ahead
  for (let j = i + 1; j < data.length; ++j) {
    const courseB = data[j];
    assert(typeof courseB !== "undefined");

    // Skip courses with unknown time slots with sentinel value [0, 0)
    if (courseB.startTime === 0 && courseB.stopTime === 0) continue;

    // Early termination: if courseB starts after courseA ends, no more conflicts possible
    if (courseB.startTime >= courseA.stopTime) break;

    // Check if courses have overlapping terms (part_of_term)
    const termsA = getTermCodes(courseA.partOfTerm);
    const termsB = getTermCodes(courseB.partOfTerm);

    // Check for term overlap (any common term)
    const hasTermOverlap = termsA.some(term => termsB.includes(term));
    if (!hasTermOverlap) continue; // No term overlap, no conflict

    // Check if courses have overlapping days
    const daysA = getDayCodes(courseA.daysCode);
    const daysB = getDayCodes(courseB.daysCode);

    // Check for day overlap (any common day, excluding TBA)
    const hasDayOverlap = daysA.some(day => day !== "TBA" && daysB.includes(day));
    if (!hasDayOverlap) continue; // No day overlap, no conflict

    // Check for time overlap using half-open range logic
    // Two ranges [a, b) and [c, d) overlap if a < d && c < b
    // Since we already know courseB.start_time < courseA.stop_time (from the break condition above),
    // we only need to check if courseA.start_time < courseB.stop_time
    if (courseA.startTime < courseB.stopTime) {
      // Create alphabetically sorted key for consistent ordering
      const [a, b] = [courseA.forecastId, courseB.forecastId].sort();
      assert(typeof a !== "undefined");
      assert(typeof b !== "undefined");
      directConflicts.add(`${a}|${b}`);
    }
  }
}

// Step 2: Create time conflict groups directly from direct conflicts
const timeConflictGroups = new Map<string, Set<string>>();

// Process each direct conflict to create conflict groups
for (const key of directConflicts) {
  const [courseA, courseB] = key.split("|");
  assert(typeof courseA !== "undefined");
  assert(typeof courseB !== "undefined");
  // Get the actual course objects
  const courseAObj = data.find(c => c.forecastId === courseA);
  const courseBObj = data.find(c => c.forecastId === courseB);

  if (typeof courseAObj === "undefined" || typeof courseBObj === "undefined") {
    console.warn(`Course not found for conflict: ${courseA} vs ${courseB}`);
    continue;
  }

  // Create conflict group name: term codes + days code + sorted forecast IDs
  const termsA = getTermCodes(courseAObj.partOfTerm);
  const termsB = getTermCodes(courseBObj.partOfTerm);
  const daysA = getDayCodes(courseAObj.daysCode);
  const daysB = getDayCodes(courseBObj.daysCode);

  // Find common terms and days
  const commonTerms = termsA.filter(term => termsB.includes(term));
  const commonDays = daysA.filter(day => day !== "TBA" && daysB.includes(day));

  if (commonTerms.length === 0 || commonDays.length === 0) continue;

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
  const courseId = course.forecastId.substring(0, 8);
  let sections = courseSectionGroups.get(courseId);
  if (typeof sections === "undefined") {
    sections = [];
    courseSectionGroups.set(courseId, sections);
  }
  sections.push(course.forecastId);
}

// HACK: Hard-code conflicts on cross-listed courses
getOrInitValues(courseSectionGroups, "ACCT6110").push("ACCT6130");
getOrInitValues(courseSectionGroups, "FNCE6130").push("FNCE6230");
getOrInitValues(courseSectionGroups, "LGST6110").push("LGST6120", "LGST6130");
getOrInitValues(courseSectionGroups, "LGST6120").push("LGST6130");
getOrInitValues(courseSectionGroups, "LGST8060").push("MGMT6910", "OIDD6910");
getOrInitValues(courseSectionGroups, "MGMT6910").push("OIDD6910");
getOrInitValues(courseSectionGroups, "MGMT6110").push("MGMT6120");
getOrInitValues(courseSectionGroups, "WHCP6160").push("WHCP6180");

// Step 4: Add conflict groups to each course
for (const course of data) {
  // Add time conflict groups
  const timeGroups = Array.from(timeConflictGroups.entries()).filter(([_, group]) =>
    group.has(course.forecastId),
  );
  for (const [groupName, group] of timeGroups)
    if (group.size > 1) course.conflictGroups.push(groupName);

  // Add course section groups
  const courseId = course.forecastId.substring(0, 8);
  const sections = courseSectionGroups.get(courseId);
  assert(typeof sections !== "undefined");

  // Only add section group if there are multiple sections
  if (sections.length > 1) course.conflictGroups.push(`section_${courseId}`);
}

// Sort the courses by title in alphabetical order initially.
data.sort((a, b) => a.title.localeCompare(b.title));
parquetWriteFile({
  filename: "public/2025C-courses.parquet",
  columnData: [
    { name: "type", data: data.map(c => c.type), type: "STRING" },
    { name: "forecast_id", data: data.map(c => c.forecastId), type: "STRING" },
    { name: "term", data: data.map(c => c.term), type: "INT32" },
    { name: "semester", data: data.map(c => c.semester), type: "STRING" },
    { name: "department", data: data.map(c => c.department), type: "STRING" },
    { name: "section_code", data: data.map(c => c.sectionCode), type: "STRING" },
    { name: "title", data: data.map(c => c.title), type: "STRING" },
    { name: "instructors", data: data.map(c => c.instructors), type: "JSON" },
    { name: "part_of_term", data: data.map(c => getTermCodes(c.partOfTerm)), type: "JSON" },
    // { name: "start_date", data: data.map(c => c.startDate), type: "STRING" },
    // { name: "end_date", data: data.map(c => c.endDate), type: "STRING" },
    { name: "days_code", data: data.map(c => c.daysCode), type: "STRING" },
    { name: "start_time", data: data.map(c => c.startTime), type: "INT32" },
    { name: "stop_time", data: data.map(c => c.stopTime), type: "INT32" },
    // { name: "start_category", data: data.map(c => c.startCategory), type: "STRING" },
    { name: "credits", data: data.map(c => c.credits), type: "DOUBLE" },
    { name: "capacity", data: data.map(c => c.capacity), type: "INT32" },
    // { name: "aggregated_capacity", data: data.map(c => c.aggregatedCapacity), type: "INT32" },
    {
      name: "truncated_price_prediction",
      data: data.map(c => c.truncatedPricePrediction),
      type: "INT32",
    },
    {
      name: "price_prediction_residual_mean",
      data: data.map(c => c.pricePredictionResidualMean),
      type: "INT32",
    },
    {
      name: "price_prediction_residual_std_dev",
      data: data.map(c => c.pricePredictionResidualStdDev),
      type: "INT32",
    },
    {
      name: "truncated_price_fluctuations",
      data: data.map(c => c.truncatedPriceFluctuations),
      type: "JSON",
    },
    { name: "conflict_groups", data: data.map(c => c.conflictGroups), type: "JSON" },
  ],
});
