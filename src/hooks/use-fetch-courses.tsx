import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { createContext, type ReactNode, useContext } from "react";
import { parse } from "valibot";
import { useQuery } from "@tanstack/react-query";

import { Course } from "@/lib/schema/course";

interface FetchCoursesOptions {
  signal?: AbortSignal;
}

export async function fetchCourses({ signal }: FetchCoursesOptions) {
  const file = await asyncBufferFromUrl({
    url: "/courses.parquet",
    // HACK: Hard-coded byte length because the library needs to know this ahead of time.
    // But, if we let it do so automatically via HEAD requests, the Vercel CDN doesn't provide
    // the Content-Length header and thus fails.
    byteLength: 74117,
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

export function useFetchCourses() {
  return useQuery({
    queryFn: fetchCourses,
    queryKey: ["courses"],
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
