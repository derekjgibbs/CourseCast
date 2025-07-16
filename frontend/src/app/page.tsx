import type { Metadata } from "next";

import { LiveCourseCatalogDataTable } from "@/features/live-course-catalog-data-table";

export const metadata: Metadata = {
  title: "CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <LiveCourseCatalogDataTable />
      </div>
    </main>
  );
}
