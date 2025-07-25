import { type ReactNode, createContext, useContext } from "react";
import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { parse } from "valibot";
import { useQuery } from "@tanstack/react-query";

import { Course } from "@/lib/schema/course";

export async function fetchCourses() {
  const file = await asyncBufferFromUrl({ url: "/courses.parquet" });
  const rows = await parquetReadObjects({ file });
  return new Map(
    rows.map(data => {
      const course = parse(Course, data);
      return [course.forecast_id, course];
    }),
  );
}

export function useFetchCourses() {
  return useQuery({ queryFn: fetchCourses, queryKey: ["courses"] });
}

export type FetchedCourses = Awaited<ReturnType<typeof fetchCourses>>;
const FetchedCoursesContext = createContext<FetchedCourses>(new Map());

interface FetchedCoursesProviderProps {
  courses: FetchedCourses;
  children: ReactNode;
}

export function FetchedCoursesProvider({ courses, children }: FetchedCoursesProviderProps) {
  return (
    <FetchedCoursesContext.Provider value={courses}>{children}</FetchedCoursesContext.Provider>
  );
}

export function useFetchedCourses() {
  return useContext(FetchedCoursesContext);
}
