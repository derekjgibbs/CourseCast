import Link from "next/link";
import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScenarioDialog } from "@/features/scenario/create";
import type { UserScenarioDoc } from "@/convex/types";

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CreateScenarioCardProps {
  onSuccess: (id: string) => void;
}

export function CreateScenarioCard({ onSuccess }: CreateScenarioCardProps) {
  return (
    <ScenarioDialog onSuccess={onSuccess}>
      <Card className="cursor-pointer border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:scale-[1.02] hover:border-gray-400 hover:bg-gray-100 hover:shadow-md">
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

interface ScenarioCardProps {
  scenario: UserScenarioDoc;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Link href={`/dashboard/${scenario._id}`}>
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
            <span>Maximum Credits</span>
            <span className="font-medium">{scenario.max_credits.toFixed(2)} Credits</span>
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
  );
}
