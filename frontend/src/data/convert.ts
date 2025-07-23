import { stdin } from "node:process";

import * as v from "valibot";
import papa from "papaparse";
import { parquetWriteFile } from "hyparquet-writer";

import { RawCourse } from "@/lib/schema/course";

type CsvResult = papa.ParseResult<unknown>;
const { promise, resolve, reject } = Promise.withResolvers<CsvResult>();
papa.parse(stdin, {
  header: true,
  dynamicTyping: false,
  error: e => reject(e),
  complete: results => resolve(results),
});

const { errors, data } = await promise;
for (const error of errors) console.error(error);

const courses = data.map(row => v.parse(RawCourse, row));
for (const course of courses) {
  const randoms: number[] = [];
  for (const [key, value] of Object.entries(course)) {
    const num = Number.parseInt(key, 10);
    if (Number.isNaN(num)) continue;
    if (typeof value !== "number") continue;
    randoms.push(value);
  }
  // @ts-expect-error
  course.truncated_price_fluctuations = randoms;
}

parquetWriteFile({
  filename: "src/data/courses.parquet",
  columnData: [
    { name: "forecast_id", data: courses.map(c => c.forecast_id), type: "STRING" },
    { name: "term", data: courses.map(c => c.term), type: "STRING" },
    { name: "semester", data: courses.map(c => c.semester), type: "STRING" },
    { name: "department", data: courses.map(c => c.department), type: "STRING" },
    { name: "section_code", data: courses.map(c => c.section_code), type: "STRING" },
    { name: "title", data: courses.map(c => c.title), type: "STRING" },
    { name: "instructors", data: courses.map(c => c.instructors), type: "JSON" },
    { name: "part_of_term", data: courses.map(c => c.part_of_term), type: "STRING" },
    { name: "start_date", data: courses.map(c => c.start_date), type: "STRING" },
    { name: "end_date", data: courses.map(c => c.end_date), type: "STRING" },
    { name: "days_code", data: courses.map(c => c.days_code), type: "STRING" },
    { name: "start_time", data: courses.map(c => c.start_time), type: "STRING" },
    { name: "stop_time", data: courses.map(c => c.stop_time), type: "STRING" },
    { name: "start_category", data: courses.map(c => c.start_category), type: "STRING" },
    { name: "credits", data: courses.map(c => c.credits), type: "DOUBLE" },
    { name: "capacity", data: courses.map(c => c.capacity), type: "INT32" },
    { name: "aggregated_capacity", data: courses.map(c => c.aggregated_capacity), type: "INT32" },
    { name: "truncated_price_prediction", data: courses.map(c => c.truncated_price_prediction), type: "INT32" },
    { name: "price_prediction_residual_mean", data: courses.map(c => c.price_prediction_residual_mean), type: "INT32" },
    { name: "price_prediction_residual_std_dev", data: courses.map(c => c.price_prediction_residual_std_dev), type: "INT32" },
    { name: "truncated_price_fluctuations", data: courses.map(c => c.truncated_price_fluctuations), type: "JSON" },
  ],
});
