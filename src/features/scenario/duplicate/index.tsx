"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { type UserScenarioId } from "@/convex/types";

function onSuccess() {
  toast.success("Scenario successfully duplicated", {
    description: "Please save any unsaved progress before visiting the duplicated scenario.",
  });
}

function onError() {
  toast.error("Failed to duplicate scenario", {
    description: "Please try again later.",
    duration: Infinity,
    dismissible: true,
  });
}

interface ScenarioDuplicateAlertProps {
  scenarioId: UserScenarioId;
}

export function ScenarioDuplicateAlert({ scenarioId }: ScenarioDuplicateAlertProps) {
  const mutationFn = useConvexMutation(api.scenarios.duplicate);
  const mutation = useTanstackMutation({ mutationFn, onSuccess, onError });
  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50/60 p-4">
      <form
        onSubmit={event => {
          event.preventDefault();
          event.stopPropagation();
          if (event.nativeEvent instanceof SubmitEvent) {
            const data = new FormData(event.currentTarget);
            const id = data.get("id");
            if (typeof id === "string") mutation.mutate({ id: id as UserScenarioId });
          }
        }}
        className="contents"
      >
        <input type="hidden" name="id" value={scenarioId} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={mutation.isPending}
          className="h-auto border-blue-300/80 p-2 text-blue-600 hover:border-blue-400/90 hover:bg-blue-100/70 hover:text-blue-700"
        >
          <Copy className="size-5" />
        </Button>
      </form>
      <div>
        <p className="text-sm font-medium text-blue-800">Duplicate Scenario</p>
        <p className="text-xs text-blue-600/80">
          This will create a new scenario with the same settings. Only saved values will carry over.
        </p>
      </div>
    </div>
  );
}
