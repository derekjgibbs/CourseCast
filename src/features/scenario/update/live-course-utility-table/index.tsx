"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { CourseUtilityTable } from "./table";

interface LiveCourseUtilityTableProps {
  name?: string;
}

export function LiveCourseUtilityTable({ name }: LiveCourseUtilityTableProps) {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.deselectCourse);
  const selected = useStore(courseStore, state => state.selectedRegularCourses);
  const courses = useMemo(() => Array.from(selected.values()), [selected]);
  return <CourseUtilityTable name={name} courses={courses} onRemove={handleRemove} />;
}
