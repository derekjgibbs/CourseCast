"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { FixedCourseCatalogTable } from "./table";

export function LiveFixedCourseCatalogTable() {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.removeFixedCourse);
  const fixed = useStore(courseStore, state => state.fixed);
  const fixedCourses = useMemo(() => Array.from(fixed.values()), [fixed]);
  return <FixedCourseCatalogTable courses={fixedCourses} onRemove={handleRemove} />;
}
