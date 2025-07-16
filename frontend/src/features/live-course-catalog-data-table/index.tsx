"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CourseCatalogDataTable } from "./table";

export function LiveCourseCatalogDataTable() {
  const courses = useQuery(api.courses.list);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Catalog</CardTitle>
        <CardDescription>Discover and explore available courses</CardDescription>
      </CardHeader>
      <CardContent>
        {typeof courses === "undefined" ? (
          <div className="flex flex-col items-center space-y-2 p-4">
            <Loader2 className="size-16 animate-spin text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Fetching courses</span>
          </div>
        ) : (
          <CourseCatalogDataTable courses={courses} />
        )}
      </CardContent>
    </Card>
  );
}
