"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { CourseUtilityTable } from "./table";

export function LiveCourseUtilityTable() {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.deselectCourse);
  const available = useStore(courseStore, state => state.available);
  const courses = useMemo(() => Array.from(available.values()), [available]);
  return <CourseUtilityTable courses={courses} onRemove={handleRemove} />;
}
