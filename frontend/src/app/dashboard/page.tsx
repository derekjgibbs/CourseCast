import type { Metadata } from "next";

import { ConstraintSetupCard } from "@/features/constraint-setup";
import { LiveCourseCatalogDataTable } from "@/features/live-course-catalog-data-table";

export const metadata: Metadata = {
  title: "Dashboard | CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <ConstraintSetupCard />
      <LiveCourseCatalogDataTable />
    </div>
  );
}
