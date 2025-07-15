"use client";

import type { Metadata } from 'next';

import { useQuery } from 'convex/react'

import CourseCatalogTable from "@/components/CourseCatalogTable";
import { api } from '@/convex/_generated/api'

export const metadata: Metadata = {
  title: "CourseCast",
  description: "Course optimization using Monte Carlo simulation.",
};

export default function Page() {
  const courses = useQuery(api.courses.list) ?? [];
  return (
    <main className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CourseCatalogTable courses={courses} />
      </div>
    </main>
  );
}
