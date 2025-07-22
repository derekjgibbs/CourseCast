import { type ReactNode, createContext, useContext, useMemo } from "react";
import { create } from "zustand";

import type { CourseDoc, CourseId } from "@/convex/types";

interface CourseStore {
  available: Map<CourseId, CourseDoc>;
  selected: Map<CourseId, CourseDocWithUtility>;
  fixed: Map<CourseId, CourseDoc>;
  selectCourse: (course: CourseId) => void;
  deselectCourse: (course: CourseId) => void;
  addFixedCourse: (course: CourseId) => void;
  removeFixedCourse: (course: CourseId) => void;
}

export interface CourseDocWithUtility extends CourseDoc {
  utility?: bigint;
}

type CourseMap = Map<CourseId, CourseDocWithUtility>;

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

interface CourseProviderProps {
  courses: CourseDoc[];
  fixedCourses: string[];
  utilities: Record<CourseId, bigint>;
  children: ReactNode;
}

const CourseContext = createContext(createCourseStore(new Map(), new Map(), new Map()));
export function CourseProvider({
  courses,
  fixedCourses,
  utilities,
  children,
}: CourseProviderProps) {
  const store = useMemo(() => {
    const available: CourseMap = new Map(
      courses.map(
        course => [course._id, structuredClone(course)] as [CourseId, CourseDocWithUtility],
      ),
    );

    const fixed: CourseMap = new Map();
    for (const id of fixedCourses) {
      const course = available.get(id as CourseId);
      if (typeof course === "undefined") continue;
      fixed.set(id as CourseId, course);
      available.delete(id as CourseId);
    }

    const selected: CourseMap = new Map();
    for (const [id, utility] of Object.entries(utilities)) {
      const course = available.get(id as CourseId);
      if (typeof course === "undefined") continue;
      course.utility = utility;
      selected.set(id as CourseId, course);
      available.delete(id as CourseId);
    }

    return createCourseStore(available, selected, fixed);
  }, [fixedCourses, utilities, courses]);
  return <CourseContext.Provider value={store}>{children}</CourseContext.Provider>;
}

export function useCourseStore() {
  return useContext(CourseContext);
}
