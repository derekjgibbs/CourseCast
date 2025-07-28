import { create } from "zustand";
import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { Course } from "@/lib/schema/course";
import { useFetchedCourses } from "@/hooks/use-fetch-courses";

interface CourseStore {
  available: Map<string, Course>;
  selected: Map<string, CourseWithUtility>;
  fixed: Map<string, Course>;
  selectCourse: (course: string) => void;
  deselectCourse: (course: string) => void;
  addFixedCourse: (course: string) => void;
  removeFixedCourse: (course: string) => void;
}

export interface CourseWithUtility extends Course {
  utility?: bigint;
}

type CourseMap = Map<string, CourseWithUtility>;

function createCourseStore(available: CourseMap, selected: CourseMap, fixed: CourseMap) {
  return create<CourseStore>(set => ({
    available,
    selected,
    fixed,
    selectCourse: id =>
      set(state => {
        const course = state.available.get(id);
        if (typeof course === "undefined") return {};

        const selected = new Map(state.selected).set(id, course);
        const available = new Map(state.available);
        available.delete(id);

        return { available, selected };
      }),
    deselectCourse: id =>
      set(state => {
        const course = state.selected.get(id);
        if (typeof course === "undefined") return {};

        const available = new Map(state.available).set(id, course);
        const selected = new Map(state.selected);
        selected.delete(id);

        return { available, selected };
      }),
    addFixedCourse: id =>
      set(state => {
        const course = state.available.get(id);
        if (typeof course === "undefined") return {};

        const fixed = new Map(state.fixed).set(id, course);
        const available = new Map(state.available);
        available.delete(id);

        return { available, fixed };
      }),
    removeFixedCourse: id =>
      set(state => {
        const course = state.fixed.get(id);
        if (typeof course === "undefined") return {};

        const available = new Map(state.available).set(id, course);
        const fixed = new Map(state.fixed);
        fixed.delete(id);

        return { available, fixed };
      }),
  }));
}

interface UserScenarioProviderProps {
  fixedCourses: string[];
  utilities: Record<string, bigint>;
  children: ReactNode;
}

const CourseContext = createContext(createCourseStore(new Map(), new Map(), new Map()));
export function UserScenarioProvider({
  fixedCourses,
  utilities,
  children,
}: UserScenarioProviderProps) {
  const courses = useFetchedCourses();
  const store = useMemo(() => {
    const available: CourseMap = structuredClone(courses);

    const fixed: CourseMap = new Map();
    for (const id of fixedCourses) {
      const course = available.get(id);
      if (typeof course === "undefined") continue;
      fixed.set(id, course);
      available.delete(id);
    }

    const selected: CourseMap = new Map();
    for (const [id, utility] of Object.entries(utilities)) {
      const course = available.get(id);
      if (typeof course === "undefined") continue;
      course.utility = utility;
      selected.set(id, course);
      available.delete(id);
    }

    return createCourseStore(available, selected, fixed);
  }, [fixedCourses, utilities, courses]);
  return <CourseContext.Provider value={store}>{children}</CourseContext.Provider>;
}

export function useCourseStore() {
  return useContext(CourseContext);
}
