"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { CourseUtilityTable } from "./table";

export function LiveCourseUtilityTable() {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.deselectCourse);
  const selected = useStore(courseStore, state => state.selected);
  const courses = useMemo(() => Array.from(selected.values()), [selected]);
  return <CourseUtilityTable courses={courses} onRemove={handleRemove} />;
}
