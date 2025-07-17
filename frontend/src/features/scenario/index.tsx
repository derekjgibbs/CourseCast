"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ScenarioSelect } from "./select";

export function ScenarioUpdateCard() {
  const scenarios = useQuery(api.scenarios.list);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constraint Setup</CardTitle>
        <CardDescription>
          Configure your course selection parameters and requirements
        </CardDescription>
      </CardHeader>
      {typeof scenarios === "undefined" ? (
        <CardContent className="flex flex-col items-center space-y-2">
          <Loader2 className="size-16 animate-spin text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Fetching scenarios</span>
        </CardContent>
      ) : (
        <ScenarioSelect scenarios={scenarios} />
      )}
    </Card>
  );
}
