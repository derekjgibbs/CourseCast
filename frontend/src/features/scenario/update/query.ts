import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { parse } from "valibot";
import { useQuery } from "@tanstack/react-query";

import { Course } from "@/lib/schema/course";

export async function fetchCourses() {
  const file = await asyncBufferFromUrl({ url: "/courses.parquet" });
  const data = await parquetReadObjects({ file });
  return data.map(data => parse(Course, data));
}

export function useCourses() {
  return useQuery({ queryFn: fetchCourses, queryKey: ["courses"] });
}
