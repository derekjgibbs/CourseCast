import type { Metadata } from "next";

import { Dashboard } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  return <Dashboard />;
}
