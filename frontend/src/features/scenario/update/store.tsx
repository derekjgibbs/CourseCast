import { type ReactNode, createContext, useContext, useMemo } from "react";
import { create } from "zustand";

import type { CourseDoc, CourseId } from "@/convex/types";

interface CourseStore {
  available: Map<CourseId, CourseDoc>;
  selected: Map<CourseId, CourseDoc>;
  fixed: Map<CourseId, CourseDoc>;
  selectCourse: (course: CourseId) => void;
  deselectCourse: (course: CourseId) => void;
  addFixedCourse: (course: CourseId) => void;
  removeFixedCourse: (course: CourseId) => void;
}

function createCourseStore(courses: Map<CourseId, CourseDoc>) {
  return create<CourseStore>(set => ({
    available: new Map(courses),
    selected: new Map(),
    fixed: new Map(),
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

interface CourseProviderProps {
  courses: CourseDoc[];
  children: ReactNode;
}

const CourseContext = createContext(createCourseStore(new Map()));
export function CourseProvider({ courses, children }: CourseProviderProps) {
  const store = useMemo(
    () => createCourseStore(new Map(courses.map(course => [course._id, course]))),
    [courses],
  );
  return <CourseContext.Provider value={store}>{children}</CourseContext.Provider>;
}

export function useCourseStore() {
  return useContext(CourseContext);
}
