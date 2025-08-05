"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import { useStore } from "zustand";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useCourseStore } from "@/features/scenario/update/store";

import { FixedCourseCatalogTable } from "./table";

interface PresetSelectionButtonProps {
  courseIds: string[];
  children: ReactNode;
}

function PresetSelectionButton({ courseIds, children }: PresetSelectionButtonProps) {
  const courseStore = useCourseStore();
  const handleSwapCourses = useStore(courseStore, state => state.swapFixedCourses);
  const handleClick = useCallback(
    () => handleSwapCourses(courseIds),
    [courseIds, handleSwapCourses],
  );
  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick}>
      {children}
    </Button>
  );
}

function PresetSelection() {
  // HACK: We hard-code the cohort constraints for now.
  // TODO: Adjust the max budget based on the fixed courses.
  return (
    <div className="space-y-2">
      <Label>Which cohort are you in?</Label>
      <div className="flex flex-wrap items-center gap-1">
        <PresetSelectionButton
          courseIds={["STAT6130002", "STAT6210003", "MKTG6110021", "BEPP6110001", "BEPP6120001"]}
        >
          Cohort A
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130001", "STAT6210001", "MKTG6110019", "BEPP6110002", "BEPP6120002"]}
        >
          Cohort B
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130001", "STAT6210001", "MKTG6110017", "BEPP6110003", "BEPP6120003"]}
        >
          Cohort C
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130004", "STAT6210001", "MKTG6110001", "BEPP6110004", "BEPP6120004"]}
        >
          Cohort D
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130005", "STAT6210003", "MKTG6110013", "BEPP6110005", "BEPP6120005"]}
        >
          Cohort E
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130004", "STAT6210001", "MKTG6110009", "BEPP6110006", "BEPP6120006"]}
        >
          Cohort F
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130006", "STAT6210005", "MKTG6110005", "BEPP6110007", "BEPP6120007"]}
        >
          Cohort G
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130006", "STAT6210005", "MKTG6110007", "BEPP6110008", "BEPP6120008"]}
        >
          Cohort H
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130005", "STAT6210003", "MKTG6110011", "BEPP6110009", "BEPP6120009"]}
        >
          Cohort I
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130003", "STAT6210005", "MKTG6110023", "BEPP6110010", "BEPP6120010"]}
        >
          Cohort J
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130002", "STAT6210003", "MKTG6110003", "BEPP6110011", "BEPP6120011"]}
        >
          Cohort K
        </PresetSelectionButton>
        <PresetSelectionButton
          courseIds={["STAT6130003", "STAT6210005", "MKTG6110015", "BEPP6110012", "BEPP6120012"]}
        >
          Cohort L
        </PresetSelectionButton>
      </div>
    </div>
  );
}

interface LiveFixedCourseCatalogTableProps {
  name?: string;
}

export function LiveFixedCourseCatalogTable({ name }: LiveFixedCourseCatalogTableProps) {
  const courseStore = useCourseStore();
  const handleRemove = useStore(courseStore, state => state.removeFixedCourse);

  const fixed = useStore(courseStore, state => state.selectedFixedCourses);
  const fixedCourses = useMemo(() => Array.from(fixed.values()), [fixed]);

  return fixedCourses.length === 0 ? (
    <PresetSelection />
  ) : (
    <FixedCourseCatalogTable name={name} courses={fixedCourses} onRemove={handleRemove} />
  );
}
