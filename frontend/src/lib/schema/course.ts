import * as v from "valibot";

export const RawCourse = v.objectWithRest(
  {
    forecast_id: v.string(),
    term: v.string(),
    semester: v.string(),
    department: v.string(),
    section_code: v.string(),
    title: v.string(),
    instructors: v.pipe(
      v.string(),
      v.transform(str => str.split("/")),
    ),
    part_of_term: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    days_code: v.string(),
    start_time: v.string(),
    stop_time: v.string(),
    start_category: v.string(),
    credits: v.pipe(
      v.string(),
      v.transform(str => Number.parseFloat(str)),
    ),
    capacity: v.pipe(
      v.string(),
      v.transform(str => Number.parseInt(str, 10)),
    ),
    aggregated_capacity: v.pipe(
      v.string(),
      v.transform(str => Number.parseInt(str, 10)),
    ),
    truncated_price_prediction: v.pipe(
      v.string(),
      v.transform(str => Number.parseInt(str, 10)),
    ),
    price_prediction_residual_mean: v.pipe(
      v.string(),
      v.transform(str => Number.parseInt(str, 10)),
    ),
    price_prediction_residual_std_dev: v.pipe(
      v.string(),
      v.transform(str => Number.parseInt(str, 10)),
    ),
  },
  v.pipe(
    v.string(),
    v.transform(str => Number.parseInt(str, 10)),
  ),
);

export type RawCourse = v.InferOutput<typeof RawCourse>;

export const Course = v.object({
  forecast_id: v.string(),
  term: v.string(),
  semester: v.string(),
  department: v.string(),
  section_code: v.string(),
  title: v.string(),
  instructors: v.array(v.string()),
  part_of_term: v.string(),
  start_date: v.string(),
  end_date: v.string(),
  days_code: v.string(),
  start_time: v.string(),
  stop_time: v.string(),
  start_category: v.string(),
  credits: v.number(),
  capacity: v.number(),
  aggregated_capacity: v.number(),
  truncated_price_prediction: v.number(),
  price_prediction_residual_mean: v.number(),
  price_prediction_residual_std_dev: v.number(),
  truncated_price_fluctuations: v.array(v.number()),
});

export type Course = v.InferOutput<typeof Course>;
