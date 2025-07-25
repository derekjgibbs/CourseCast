"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ScenarioDialog } from "@/features/scenario/create";

export function Dashboard() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Manage your course scenarios and run Monte Carlo simulations to optimize your course
          selection.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Start by creating a new scenario to define your course preferences and constraints.
            </p>
            <ScenarioDialog onSuccess={id => router.push(`/dashboard/${id}`)}>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Scenario
              </Button>
            </ScenarioDialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and manage your existing scenarios from the sidebar. Each scenario contains your
              course preferences and simulation results.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monte Carlo Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Run simulations on your scenarios to find optimal course combinations based on your
              constraints and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
