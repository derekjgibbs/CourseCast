import * as v from "valibot";

export const Course = v.object({
  forecast_id: v.string(),
  term: v.number(),
  semester: v.string(),
  department: v.string(),
  section_code: v.string(),
  title: v.string(),
  instructors: v.array(v.string()),
  part_of_term: v.string(),
  start_date: v.string(),
  end_date: v.string(),
  days_code: v.string(),
  start_time: v.number(),
  stop_time: v.number(),
  start_category: v.string(),
  credits: v.number(),
  capacity: v.number(),
  aggregated_capacity: v.number(),
  truncated_price_prediction: v.number(),
  price_prediction_residual_mean: v.number(),
  price_prediction_residual_std_dev: v.number(),
  truncated_price_fluctuations: v.array(v.number()),
  conflict_groups: v.array(v.string()),
});

export type Course = v.InferOutput<typeof Course>;
