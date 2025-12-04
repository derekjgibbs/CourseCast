import * as v from "valibot";

export const FixedCoreAssignment = v.object({
  Term: v.string(),
  "Term Code": v.string(),
  "Subject Code": v.string(),
  "Catalog Number": v.string(),
  "Section #": v.string(),
  "Long Title": v.string(),
  "Meeting Pattern": v.string(),
  Instructor: v.string(),
  Credit: v.pipe(
    v.string(),
    v.transform(val => Number.parseFloat(val)),
  ),
  "Maximum Enrollment": v.pipe(
    v.string(),
    v.transform(val => Number.parseInt(val, 10)),
  ),
});

export type FixedCoreAssignment = v.InferOutput<typeof FixedCoreAssignment>;
