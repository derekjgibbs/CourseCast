import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manual - CourseCast",
  description: "User manual and documentation for CourseCast.",
};

export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Manual</h1>
      <p className="text-gray-600">Manual content will be added here.</p>
    </div>
  );
}

