import assert, { strictEqual } from "node:assert/strict";
import { createReadStream } from "node:fs";
import { join } from "node:path";

import * as d from "date-fns";
import * as v from "valibot";
import papa from "papaparse";

import { FixedCoreAssignment } from "./schema.ts";

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

  return data.map(row => {
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
      partOfTerm: "Full",
      // TODO: startDate
      // TODO: endDate
      daysCode,
      startTime,
      stopTime,
      // TODO: startCategory
      credits: Credit,
      capacity: 0, // TODO
      aggregatedCapacity: MaxEnrollment,
      truncatedPricePrediction: 0, // TODO
      pricePredictionResidualMean: 0, // TODO
      pricePredictionResidualStdDev: 0, // TODO
      truncatedPriceFluctuations: [], // TODO
      conflictGroups: [] as string[],
    };
  });
}

// TODO: Compute time conflict groups.

/*
assignments.sort((a, b) => a.title.localeCompare(b.title));
parquetWriteFile({
  filename: "public/fixed.parquet",
  columnData: [
    { name: "forecast_id", data: assignments.map(c => c.forecastId), type: "STRING" },
    { name: "term", data: assignments.map(c => c.term), type: "INT32" },
    { name: "semester", data: assignments.map(c => c.semester), type: "STRING" },
    { name: "department", data: assignments.map(c => c.department), type: "STRING" },
    { name: "section_code", data: assignments.map(c => c.sectionCode), type: "STRING" },
    { name: "title", data: assignments.map(c => c.title), type: "STRING" },
    { name: "instructors", data: assignments.map(c => c.instructors), type: "JSON" },
    // { name: "part_of_term", data: assignments.map(c => c.partOfTime), type: "STRING" },
    // { name: "start_date", data: assignments.map(c => c.start_date), type: "STRING" },
    // { name: "end_date", data: assignments.map(c => c.end_date), type: "STRING" },
    { name: "days_code", data: assignments.map(c => c.daysCode), type: "STRING" },
    { name: "start_time", data: assignments.map(c => c.startTime), type: "STRING" },
    { name: "stop_time", data: assignments.map(c => c.stopTime), type: "STRING" },
    // { name: "start_category", data: assignments.map(c => c.start_category), type: "STRING" },
    { name: "credits", data: assignments.map(c => c.credits), type: "DOUBLE" },
    // { name: "capacity", data: assignments.map(c => c.capacity), type: "INT32" },
    {
      name: "aggregated_capacity",
      data: assignments.map(c => c.aggregatedCapacity),
      type: "INT32",
    },
    // {
    //   name: "truncated_price_prediction",
    //   data: assignments.map(c => c.truncated_price_prediction),
    //   type: "INT32",
    // },
    // {
    //   name: "price_prediction_residual_mean",
    //   data: assignments.map(c => c.price_prediction_residual_mean),
    //   type: "INT32",
    // },
    // {
    //   name: "price_prediction_residual_std_dev",
    //   data: assignments.map(c => c.price_prediction_residual_std_dev),
    //   type: "INT32",
    // },
    // {
    //   name: "truncated_price_fluctuations",
    //   data: assignments.map(c => c.truncated_price_fluctuations),
    //   type: "JSON",
    // },
    { name: "conflict_groups", data: assignments.map(c => c.conflictGroups), type: "JSON" },
  ],
});
*/
