import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { createContext, type ReactNode, useContext } from "react";
import { parse } from "valibot";
import { useQuery } from "@tanstack/react-query";

import { Course } from "@/lib/schema/course";
import { getTermByteLength, type SupportedTerm } from "@/lib/term";

interface FetchCoursesOptions {
  term: SupportedTerm;
  signal?: AbortSignal;
}

export async function fetchCourses({ term, signal }: FetchCoursesOptions) {
  const file = await asyncBufferFromUrl({
    url: `/${term}-courses.parquet`,
    byteLength: getTermByteLength(term),
    requestInit: {
      signal,
      headers: { "Content-Type": "application/octet-stream" },
    },
  });
  const rows = await parquetReadObjects({ file });
  return new Map(
    rows.map(data => {
      const course = parse(Course, data);
      return [course.forecast_id, course];
    }),
  );
}

export function useFetchCourses(term: SupportedTerm) {
  return useQuery({
    queryFn: async ({ signal, queryKey: [, term] }) => await fetchCourses({ term, signal }),
    queryKey: ["courses", term] as const,
    staleTime: Infinity,
    gcTime: Infinity,
  });
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
