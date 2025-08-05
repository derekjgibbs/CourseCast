import { create } from "zustand";
import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { Course } from "@/lib/schema/course";
import { useFetchedCourses } from "@/hooks/use-fetch-courses";

interface CourseStore {
  availableRegularCourses: Map<string, Course>;
  selectedRegularCourses: Map<string, CourseWithUtility>;
  availableFixedCourses: Map<string, Course>;
  selectedFixedCourses: Map<string, Course>;
  selectCourse: (course: string) => void;
  deselectCourse: (course: string) => void;
  addFixedCourse: (course: string) => void;
  removeFixedCourse: (course: string) => void;
}

export interface CourseWithUtility extends Course {
  utility: bigint;
}

function createCourseStore(
  availableRegularCourses: Map<string, Course>,
  selectedRegularCourses: Map<string, CourseWithUtility>,
  availableFixedCourses: Map<string, Course>,
  selectedFixedCourses: Map<string, Course>,
) {
  return create<CourseStore>(set => ({
    availableRegularCourses,
    availableFixedCourses,
    selectedRegularCourses,
    selectedFixedCourses,
    selectCourse: id =>
      set(state => {
        const course = state.availableRegularCourses.get(id);
        if (typeof course === "undefined") return {};

        const selected = new Map(state.selectedRegularCourses).set(id, { ...course, utility: 0n });
        const available = new Map(state.availableRegularCourses);
        available.delete(id);

        return { availableRegularCourses: available, selectedRegularCourses: selected };
      }),
    deselectCourse: id =>
      set(state => {
        const course = state.selectedRegularCourses.get(id);
        if (typeof course === "undefined") return {};

        const available = new Map(state.availableRegularCourses).set(id, course);
        const selected = new Map(state.selectedRegularCourses);
        selected.delete(id);

        return { availableRegularCourses: available, selectedRegularCourses: selected };
      }),
    addFixedCourse: id =>
      set(state => {
        const course = state.availableFixedCourses.get(id);
        if (typeof course === "undefined") return {};

        const fixed = new Map(state.selectedFixedCourses).set(id, course);
        const available = new Map(state.availableFixedCourses);
        available.delete(id);

        return { availableFixedCourses: available, selectedFixedCourses: fixed };
      }),
    removeFixedCourse: id =>
      set(state => {
        const course = state.selectedFixedCourses.get(id);
        if (typeof course === "undefined") return {};

        const available = new Map(state.availableFixedCourses).set(id, course);
        const fixed = new Map(state.selectedFixedCourses);
        fixed.delete(id);

        return { availableFixedCourses: available, selectedFixedCourses: fixed };
      }),
  }));
}

interface UserScenarioProviderProps {
  fixedCourses: string[];
  utilities: Record<string, bigint>;
  children: ReactNode;
}

const CourseContext = createContext(createCourseStore(new Map(), new Map(), new Map(), new Map()));
export function UserScenarioProvider({
  fixedCourses,
  utilities,
  children,
}: UserScenarioProviderProps) {
  const courses = useFetchedCourses();
  const store = useMemo(() => {
    const availableRegularCourses = new Map<string, Course>();
    const availableFixedCourses = new Map<string, Course>();
    for (const [id, course] of courses) {
      switch (course.type) {
        case "fixed":
          availableFixedCourses.set(id, course);
          break;
        case "regular":
          availableRegularCourses.set(id, course);
          break;
        default:
          break;
      }
    }

    const selectedRegularCourses: Map<string, CourseWithUtility> = new Map();
    for (const [id, utility] of Object.entries(utilities)) {
      const course = availableRegularCourses.get(id);
      if (typeof course === "undefined") continue;
      selectedRegularCourses.set(id, { ...course, utility });
      availableRegularCourses.delete(id);
    }

    const selectedFixedCourses: Map<string, Course> = new Map();
    for (const id of fixedCourses) {
      const course = availableFixedCourses.get(id);
      if (typeof course === "undefined") continue;
      selectedFixedCourses.set(id, course);
      availableFixedCourses.delete(id);
    }

    return createCourseStore(
      availableRegularCourses,
      selectedRegularCourses,
      availableFixedCourses,
      selectedFixedCourses,
    );
  }, [fixedCourses, utilities, courses]);
  return <CourseContext.Provider value={store}>{children}</CourseContext.Provider>;
}

export function useCourseStore() {
  return useContext(CourseContext);
}
