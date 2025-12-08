import assert, { strictEqual } from "node:assert/strict";
import { createReadStream } from "node:fs";
import { join } from "node:path";

import * as d from "date-fns";
import * as v from "valibot";
import papa from "papaparse";

import { FixedCoreAssignment } from "./schema.ts";

// HACK: Hard-coded from the latest `schedule.xlsx` file.
function getTermCode(forecastId: string) {
  switch (forecastId) {
    case "BEPP6110001":
    case "BEPP6110002":
    case "BEPP6110003":
    case "BEPP6110004":
    case "BEPP6110005":
    case "BEPP6110006":
    case "BEPP6110007":
    case "BEPP6110008":
    case "BEPP6110009":
    case "BEPP6110010":
    case "BEPP6110011":
    case "BEPP6110012":
    case "MKTG6110001":
    case "MKTG6110003":
    case "MKTG6110005":
    case "MKTG6110007":
    case "MKTG6110009":
    case "MKTG6110011":
    case "MKTG6110013":
    case "MKTG6110015":
    case "MKTG6110017":
    case "MKTG6110019":
    case "MKTG6110021":
    case "MKTG6110023":
    case "STAT6210001":
    case "STAT6210003":
    case "STAT6210005":
      return "Q1";
    case "BEPP6120001":
    case "BEPP6120002":
    case "BEPP6120003":
    case "BEPP6120004":
    case "BEPP6120005":
    case "BEPP6120006":
    case "BEPP6120007":
    case "BEPP6120008":
    case "BEPP6120009":
    case "BEPP6120010":
    case "BEPP6120011":
    case "BEPP6120012":
      return "Q2";
    case "STAT6130001":
    case "STAT6130002":
    case "STAT6130003":
    case "STAT6130004":
    case "STAT6130005":
    case "STAT6130006":
      return "Full"; // Only in 1st Semester
    default:
      return "TBA";
  }
}

export async function readFixedCoreAssignments(now: Date) {
  const { promise, resolve, reject } = Promise.withResolvers<papa.ParseResult<unknown>>();
  papa.parse(createReadStream(join(import.meta.dirname, "assignment.csv")), {
    header: true,
    skipEmptyLines: true,
    error: e => reject(e),
    complete: results => resolve(results),
  });

  const { data, errors } = await promise;
  for (const error of errors) console.error(error);
  strictEqual(errors.length, 0);

  // Filter out rows where all fields are empty
  const validData = data.filter(row => {
    const values = Object.values(row);
    return values.some(val => val !== "" && val !== null && val !== undefined);
  });

  return validData.map(row => {
    const {
      Term,
      "Term Code": TermCode,
      "Subject Code": SubjectCode,
      "Catalog Number": CatalogNumber,
      "Section #": SectionNumber,
      "Long Title": LongTitle,
      "Meeting Pattern": MeetingPattern,
      Instructor,
      Credit,
      "Maximum Enrollment": MaxEnrollment,
    } = v.parse(FixedCoreAssignment, row);

    // BEPP + 6110 + 001 = BEPP6110001
    const sectionCode = SubjectCode + CatalogNumber;
    const forecastId = sectionCode + SectionNumber;

    const [semester, term, ...termRest] = Term.split(" ");
    strictEqual(termRest.length, 0);
    assert(typeof term !== "undefined");
    assert(typeof semester !== "undefined");

    const [daysCode, timePeriod, ...patternRest] = MeetingPattern.split(" ");
    strictEqual(patternRest.length, 0);
    assert(typeof daysCode !== "undefined");

    let startTime: number;
    let stopTime: number;
    if (typeof timePeriod === "undefined") {
      startTime = 0;
      stopTime = 0;
    } else {
      const [rawStartTime, rawStopTime, ...timeRest] = timePeriod.split("-");
      strictEqual(timeRest.length, 0);
      assert(typeof rawStartTime !== "undefined");
      assert(typeof rawStopTime !== "undefined");

      const startDate = d.parse(rawStartTime, "h:mma", now);
      startTime = startDate.getHours() * 60 + startDate.getMinutes();

      const stopDate = d.parse(rawStopTime, "h:mma", now);
      stopDate.setMinutes(stopDate.getMinutes() + 1);
      stopTime = stopDate.getHours() * 60 + stopDate.getMinutes();
    }

    // HACK: Only take up to the first comma (assumes this is the surname).
    const index = Instructor.indexOf(",");
    assert(index >= 0);
    const instructor = Instructor.slice(0, index).toUpperCase();

    return {
      type: "fixed",
      forecastId,
      termCode: TermCode,
      term: Number.parseInt(term, 10),
      semester,
      department: SubjectCode,
      sectionCode,
      title: LongTitle,
      // TODO: Handle case of multiple instructors.
      instructors: [instructor],
      partOfTerm: getTermCode(forecastId),
      // TODO: startDate
      // TODO: endDate
      daysCode,
      startTime,
      stopTime,
      // TODO: startCategory
      credits: Credit,
      capacity: MaxEnrollment, // TODO
      aggregatedCapacity: MaxEnrollment,
      truncatedPricePrediction: 0, // TODO
      pricePredictionResidualMean: 0, // TODO
      pricePredictionResidualStdDev: 0, // TODO
      truncatedPriceFluctuations: [], // TODO
      conflictGroups: [] as string[],
    };
  });
}
