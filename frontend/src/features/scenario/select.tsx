import { useMemo, useState } from "react";

import type { UserScenarioDoc, UserScenarioId } from "@/convex/types";

import { CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";

import { ScenarioDialog } from "./dialog";
import { ScenarioUpdate } from "./form";

interface ScenarioSelectProps {
  scenarios: UserScenarioDoc[];
}

export function ScenarioSelect({ scenarios }: ScenarioSelectProps) {
  const options = useMemo(
    () =>
      Object.fromEntries(
        scenarios.map(
          ({ _id, ...scenario }) =>
            [
              _id,
              {
                ...scenario,
                get label() {
                  return this.name;
                },
              },
            ] as const,
        ),
      ),
    [scenarios],
  );

  const [id, setId] = useState<string>("");
  return (
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <ScenarioDialog onSuccess={setId} />
        <Combobox
          options={options}
          value={id}
          onValueChange={setId}
          placeholder="Select a scenario..."
          className="grow"
        >
          <span className="text-sm text-gray-400">No scenarios found.</span>
        </Combobox>
      </div>
      {id.length === 0 ? null : <ScenarioUpdate id={id as UserScenarioId} />}
    </CardContent>
  );
}
