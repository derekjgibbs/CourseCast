import * as v from "valibot";

const Float = v.pipe(
  v.string(),
  v.transform(val => Number.parseFloat(val)),
);

const Integer = v.pipe(
  v.string(),
  v.transform(val => Number.parseInt(val, 10)),
);

export const RegularCourse = v.objectWithRest(
  {
    forecast_id: v.string(),
    term: Integer,
    semester: v.string(),
    department: v.string(),
    section_code: v.string(),
    title: v.string(),
    instructors: v.pipe(
      v.string(),
      v.transform(val => val.trim().split(",")),
    ),
    part_of_term: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    days_code: v.string(),
    start_time: v.string(),
    stop_time: v.string(),
    start_category: v.string(),
    credits: Float,
    capacity: Integer,
    aggregated_capacity: Integer,
    truncated_price_prediction: Integer,
    price_prediction_residual_mean: Integer,
    price_prediction_residual_std_dev: Integer,
  },
  Integer,
);

export type RegularCourse = v.InferOutput<typeof RegularCourse>;
