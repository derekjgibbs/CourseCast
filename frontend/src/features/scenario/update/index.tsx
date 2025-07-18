import type { UserScenarioId } from "@/convex/types";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LiveScenarioUpdate } from "./form";

interface ScenarioUpdateCardProps {
  id: UserScenarioId;
}

export function LiveScenarioUpdateCard({ id }: ScenarioUpdateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constraint Setup</CardTitle>
        <CardDescription>
          Configure your course selection parameters and requirements
        </CardDescription>
      </CardHeader>
      <LiveScenarioUpdate id={id} />
    </Card>
  );
}
