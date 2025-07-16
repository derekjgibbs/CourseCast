import type { Metadata } from "next";

import { LiveCourseCatalogTable } from "@/features/live-course-catalog-table";

export const metadata: Metadata = {
  title: "CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-purple-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <LiveCourseCatalogTable />
      </div>
    </main>
  );
}
