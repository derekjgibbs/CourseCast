"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScenarioDialog } from "@/features/scenario/create";
import type { UserScenarioDoc } from "@/convex/types";

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CreateScenarioCardProps {
  onSuccess: (id: string) => void;
}

function CreateScenarioCard({ onSuccess }: CreateScenarioCardProps) {
  return (
    <ScenarioDialog onSuccess={onSuccess}>
      <Card className="cursor-pointer border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100 hover:scale-[1.02] hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Plus className="h-5 w-5" />
            Create New Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Start by creating a new scenario to define your course preferences and constraints.
          </p>
        </CardContent>
      </Card>
    </ScenarioDialog>
  );
}

interface DashboardContentProps {
  scenarios: UserScenarioDoc[];
}

function DashboardContent({ scenarios }: DashboardContentProps) {
  const router = useRouter();
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CreateScenarioCard onSuccess={id => router.push(`/dashboard/${id}`)} />
      {scenarios.map(scenario => (
        <Link key={scenario._id} href={`/dashboard/${scenario._id}`}>
          <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
            <CardHeader>
              <CardTitle>
                <span className="truncate">{scenario.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Token Budget</span>
                <span className="font-medium">{scenario.token_budget.toString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Credit Range</span>
                <span className="font-medium">
                  {scenario.min_credits.toFixed(1)} - {scenario.max_credits.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Fixed Courses</span>
                <span className="font-medium">{scenario.fixed_courses.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Course Utilities</span>
                <span className="font-medium">{Object.keys(scenario.utilities).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created</span>
                <span>{formatDate(scenario.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function Dashboard() {
  const scenarios = useQuery(api.scenarios.list);
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Manage your course scenarios and run Monte Carlo simulations to optimize your course
          selection.
        </p>
      </div>
      {typeof scenarios === "undefined" ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <Loader2 className="size-16 animate-spin text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Loading scenarios</span>
        </div>
      ) : (
        <DashboardContent scenarios={scenarios} />
      )}
    </div>
  );
}
