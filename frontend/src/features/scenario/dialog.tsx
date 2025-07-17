"use client";

import * as v from "valibot";
import { Loader2, Plus } from "lucide-react";
import { decode } from "decode-formdata";
import { useId, useState } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";

import type { UserScenarioId } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScenarioDialogProps {
  onSuccess: (id: UserScenarioId) => void;
}

const CreateScenarioSchema = v.object({ name: v.pipe(v.string(), v.nonEmpty()) });

/** Needs a submit button elsewhere. */
function ScenarioCreateDialogBox({ onSuccess }: ScenarioDialogProps) {
  const id = useId();
  const [name, setName] = useState("");
  const mutationFn = useConvexMutation(api.scenarios.create);
  const mutation = useTanstackMutation({ mutationFn, onSuccess });
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        const data = new FormData(event.currentTarget);
        const args = v.parse(CreateScenarioSchema, decode(data));
        mutation.mutate(args);
      }}
      className="contents"
    >
      <div className="space-y-2">
        <Label htmlFor={id}>Name</Label>
        <Input
          id={id}
          type="text"
          required
          placeholder="My Scenario Name"
          name="name"
          value={name}
          onChange={event => setName(event.target.value)}
        />
      </div>
      <DialogFooter className="justify-end">
        {mutation.isPending ? (
          <Button type="button" disabled>
            <Loader2 className="animate-spin" />
            <span>Creating...</span>
          </Button>
        ) : (
          <Button type="submit" disabled={!name}>
            <Plus />
            <span>Create</span>
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}

interface ScenarioDialogProps {
  onSuccess: (id: UserScenarioId) => void;
}

export function ScenarioDialog({ onSuccess }: ScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          <span>New Scenario</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Scenario</DialogTitle>
          <DialogDescription>Create a new scenario to simulate.</DialogDescription>
        </DialogHeader>
        <ScenarioCreateDialogBox
          onSuccess={id => {
            setOpen(false);
            onSuccess(id);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
