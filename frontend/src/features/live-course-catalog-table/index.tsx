"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import CourseCatalogTable from "@/components/CourseCatalogTable";

export function LiveCourseCatalogTable() {
  const courses = useQuery(api.courses.list) ?? [];
  return <CourseCatalogTable courses={courses} />;
}
