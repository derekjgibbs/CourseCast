"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { FixedCourseCatalogTable } from "./table";

interface LiveFixedCourseCatalogTableProps {
  name?: string;
}

export function LiveFixedCourseCatalogTable({ name }: LiveFixedCourseCatalogTableProps) {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.removeFixedCourse);
  const fixed = useStore(courseStore, state => state.fixed);
  const fixedCourses = useMemo(() => Array.from(fixed.values()), [fixed]);
  return <FixedCourseCatalogTable name={name} courses={fixedCourses} onRemove={handleRemove} />;
}
