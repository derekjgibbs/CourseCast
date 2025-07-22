"use client";

import * as v from "valibot";
import { Loader2, Save } from "lucide-react";
import { decode } from "decode-formdata";
import { toast } from "sonner";
import { useId, useState } from "react";
import { useMutation as useConvexMutation, useQuery } from "convex/react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";

import {
  CONSTRAINTS,
  type UserScenarioDoc,
  type UserScenarioId,
  isValidCreditsRange,
  isValidScenarioName,
} from "@/convex/types";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SliderWithArrowStickyLabel } from "@/components/ui/slider-with-arrow-sticky-label";

import { CourseProvider } from "./store";
import { LiveCourseCatalogDataTable } from "./live-course-catalog-data-table";
import { LiveCourseUtilityTable } from "./live-course-utility-table";
import { LiveFixedCourseCatalogTable } from "./live-fixed-course-catalog-table";

function onSuccess() {
  toast.success("Scenario successfully updated");
}

function onError() {
  toast.error("Failed to update scenario", {
    description: "Please try again later.",
    duration: Infinity,
    dismissible: true,
  });
}

type UserScenario = Pick<UserScenarioDoc, "name" | "token_budget" | "min_credits" | "max_credits">;
interface ScenarioUpdateFormProps extends UserScenario {
  id: string;
}

const stringAsNumberSchema = v.pipe(
  v.string(),
  v.transform(val => Number.parseFloat(val)),
);
const updateUserScenarioSchema = v.object({
  id: v.string(),
  name: v.string(),
  token_budget: v.pipe(v.number(), v.integer()),
  credit_range: v.tuple([stringAsNumberSchema, stringAsNumberSchema]),
});

/** Needs a submit button elsewhere. */
function ScenarioUpdateForm({
  id: scenarioId,
  name: initialName,
  token_budget: initialTokenBudget,
  min_credits: initialMinCredits,
  max_credits: initialMaxCredits,
}: ScenarioUpdateFormProps) {
  const id = useId();
  const [name, setName] = useState(initialName);
  const [tokenBudget, setTokenBudget] = useState(Number(initialTokenBudget));
  const [creditRange, setCreditRange] = useState<[number, number]>([
    initialMinCredits,
    initialMaxCredits,
  ]);

  const mutationFn = useConvexMutation(api.scenarios.update);
  const mutation = useTanstackMutation({ mutationFn, onSuccess, onError });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        const data = new FormData(event.currentTarget);
        const json = decode(data, { arrays: ["credit_range"], numbers: ["token_budget"] });
        const {
          id,
          token_budget,
          credit_range: [min_credits, max_credits],
          ...rest
        } = v.parse(updateUserScenarioSchema, json);
        mutation.mutate({
          ...rest,
          id: id as UserScenarioId,
          token_budget: BigInt(token_budget),
          min_credits,
          max_credits,
          // TODO: utilities and fixed_courses
        });
      }}
      className="space-y-8"
    >
      <input type="hidden" name="id" value={scenarioId} />
      <Card>
        <CardHeader>
          <CardTitle>Configure Constraints</CardTitle>
          <CardDescription>Configure the simulation constraints for the scenario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-token-budget`}>Token Budget</Label>
              <Input
                id={`${id}-token-budget`}
                type="number"
                required
                placeholder={CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT.toString()}
                min={1}
                step={1}
                name="token_budget"
                value={tokenBudget}
                onChange={event => {
                  const value = event.target.valueAsNumber;
                  if (value > 0) setTokenBudget(value);
                }}
              />
            </div>
            <div className="grow space-y-2">
              <Label htmlFor={`${id}-name`}>Scenario Name</Label>
              <Input
                id={`${id}-name`}
                type="text"
                required
                placeholder={name}
                name="name"
                value={name}
                onChange={event => {
                  const value = event.target.value;
                  if (isValidScenarioName(value)) setName(value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-credit-range`}>Credit Range</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT.toFixed(1)}
              </span>
              <SliderWithArrowStickyLabel
                id={`${id}-credit-range`}
                min={CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT}
                max={CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}
                step={0.5}
                name="credit_range"
                value={creditRange}
                onValueChange={([min, max]) => {
                  if (typeof min === "undefined" || typeof max === "undefined") return;
                  if (isValidCreditsRange(min, max)) setCreditRange([min, max]);
                }}
                formatValue={value => <span>{value.toFixed(1)} Credits</span>}
              />
              <span className="text-sm text-gray-500">
                {CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fixed Courses</CardTitle>
          <CardDescription>Set up the courses that are fixed by your curriculum</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveFixedCourseCatalogTable />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Course Utility</CardTitle>
          <CardDescription>Configure the utility for each of your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveCourseUtilityTable />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>Courses available for the upcoming semester</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveCourseCatalogDataTable />
        </CardContent>
      </Card>
      <Button
        type="submit"
        size="icon"
        className="fixed right-0 bottom-0 m-4 rounded-full p-8 shadow-2xl disabled:opacity-100"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="size-8 animate-spin" />
        ) : (
          <Save className="size-8" />
        )}
        <span className="sr-only">Save Scenario</span>
      </Button>
    </form>
  );
}

interface ScenarioUpdateProps {
  id: UserScenarioId;
}

export function LiveScenarioUpdate({ id }: ScenarioUpdateProps) {
  const courses = useQuery(api.courses.list);
  const scenario = useQuery(api.scenarios.get, { id });
  return typeof courses === "undefined" || typeof scenario === "undefined" ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <Loader2 className="size-16 animate-spin text-gray-400" />
      <span className="text-sm font-medium text-gray-600">Fetching scenario</span>
    </div>
  ) : (
    <div className="relative mx-auto w-full max-w-7xl grow justify-center px-6 py-8">
      <CourseProvider courses={courses}>
        <ScenarioUpdateForm
          id={id}
          name={scenario.name}
          token_budget={scenario.token_budget}
          min_credits={scenario.min_credits}
          max_credits={scenario.max_credits}
        />
      </CourseProvider>
    </div>
  );
}
