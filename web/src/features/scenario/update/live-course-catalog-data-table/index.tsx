"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useCourseStore } from "@/features/scenario/update/store";

import { CourseCatalogDataTable } from "./table";

export function LiveCourseCatalogDataTable() {
  const courseStore = useCourseStore();
  const selectCourse = useStore(courseStore, state => state.selectCourse);
  const available = useStore(courseStore, state => state.availableRegularCourses);
  const courses = useMemo(() => Array.from(available.values()), [available]);
  return <CourseCatalogDataTable courses={courses} onCourseSelected={selectCourse} />;
}
