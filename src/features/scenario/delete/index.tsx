"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { type UserScenarioId } from "@/convex/types";

function onSuccess() {
  toast.success("Scenario successfully deleted");
}

function onError() {
  toast.error("Failed to delete scenario", {
    description: "Please try again later.",
    duration: Infinity,
    dismissible: true,
  });
}

interface ScenarioDeleteButtonProps {
  scenarioId: UserScenarioId;
}

export function ScenarioDeleteAlert({ scenarioId }: ScenarioDeleteButtonProps) {
  const mutationFn = useConvexMutation(api.scenarios.remove);
  const mutation = useTanstackMutation({ mutationFn, onSuccess, onError });
  return (
    <div className="flex items-center gap-3 rounded-lg bg-red-50/60 p-4">
      <form
        onSubmit={event => {
          event.preventDefault();
          event.stopPropagation();
          if (
            window.confirm("Are you sure you want to delete this scenario?") &&
            event.nativeEvent instanceof SubmitEvent
          ) {
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
          className="h-auto border-red-300/80 p-2 text-red-600 hover:border-red-400/90 hover:bg-red-100/70 hover:text-red-700"
        >
          <Trash2 className="size-5" />
        </Button>
      </form>
      <div>
        <p className="text-sm font-medium text-red-800">Delete Scenario</p>
        <p className="text-xs text-red-600/80">This action cannot be undone.</p>
      </div>
    </div>
  );
}
