"use client";

import * as v from "valibot";
import { Loader2, Play, Save } from "lucide-react";
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

import type { OptimizationResponse } from "@/lib/solver/schema";
import { spawnOptimizerPool } from "@/lib/solver";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SliderWithArrowStickyLabel } from "@/components/ui/slider-with-arrow-sticky-label";

import { UserScenarioProvider } from "./store";
import { LiveCourseCatalogDataTable } from "./live-course-catalog-data-table";
import { LiveCourseUtilityTable } from "./live-course-utility-table";
import { LiveFixedCourseCatalogTable } from "./live-fixed-course-catalog-table";
import { FetchedCoursesProvider, useFetchCourses, useFetchedCourses } from "./query";

function onSaveSuccess() {
  toast.success("Scenario successfully updated");
}

function onSaveError() {
  toast.error("Failed to update scenario", {
    description: "Please try again later.",
    duration: Infinity,
    dismissible: true,
  });
}

function onSimulateSuccess(results: OptimizationResponse[]) {
  console.log(results);
  toast.success("Simulation completed");
}

function onSimulateError() {
  toast.error("Failed to run simulation", {
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
  fixed_courses: v.optional(v.array(v.string())),
  utilities: v.optional(
    v.record(
      v.string(),
      v.pipe(
        v.string(),
        v.transform(val => BigInt(val)),
      ),
    ),
  ),
});

function parseUpdateUserScenarioFormData(data: FormData) {
  const json = decode(data, {
    arrays: ["credit_range", "fixed_courses"],
    numbers: ["token_budget"],
  });
  return v.parse(updateUserScenarioSchema, json);
}

/** Needs a submit button elsewhere. */
function ScenarioUpdateForm({
  id: scenarioId,
  name: initialName,
  token_budget: initialTokenBudget,
  min_credits: initialMinCredits,
  max_credits: initialMaxCredits,
}: ScenarioUpdateFormProps) {
  const id = useId();
  const saveId = `${id}-save`;
  const runId = `${id}-run`;

  const [name, setName] = useState(initialName);
  const [tokenBudget, setTokenBudget] = useState(Number(initialTokenBudget));
  const [creditRange, setCreditRange] = useState<[number, number]>([
    initialMinCredits,
    initialMaxCredits,
  ]);

  const mutationFn = useConvexMutation(api.scenarios.update);
  const saveMutation = useTanstackMutation({
    mutationFn,
    onSuccess: onSaveSuccess,
    onError: onSaveError,
  });
  const simulateMutation = useTanstackMutation({
    mutationFn: spawnOptimizerPool,
    onSuccess: onSimulateSuccess,
    onError: onSimulateError,
  });
  const isPending = saveMutation.isPending || simulateMutation.isPending;

  const fetchedCourses = useFetchedCourses();
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.reportValidity() && event.nativeEvent instanceof SubmitEvent) {
          const button = event.nativeEvent.submitter;
          if (button === null) return;

          const data = new FormData(event.currentTarget);
          const parsed = parseUpdateUserScenarioFormData(data);
          switch (button.id) {
            case saveId: {
              const {
                id,
                token_budget,
                credit_range: [min_credits, max_credits],
                ...rest
              } = parsed;
              saveMutation.mutate({
                ...rest,
                id: id as UserScenarioId,
                token_budget: BigInt(token_budget),
                min_credits,
                max_credits,
              });
              break;
            }
            case runId: {
              const {
                token_budget,
                credit_range: [min_credits, max_credits],
                fixed_courses = [],
                utilities = {},
              } = parsed;
              simulateMutation.mutate({
                budget: token_budget,
                min_credits,
                max_credits,
                utilities: new Map(
                  Object.entries(utilities).map(([forecast_id, utility]) => [
                    forecast_id,
                    Number(utility),
                  ]),
                ),
                fixed_courses,
                courses: fetchedCourses,
              });
              break;
            }
            default:
              return;
          }
        }
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
          <LiveFixedCourseCatalogTable name="fixed_courses" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Course Utility</CardTitle>
          <CardDescription>Configure the utility for each of your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveCourseUtilityTable name="utilities" />
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
      <div className="fixed right-0 bottom-0 m-4 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id={saveId}
              type="submit"
              size="icon"
              className="rounded-full p-8 shadow-2xl disabled:opacity-100"
              disabled={isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-8 animate-spin" />
              ) : (
                <Save className="size-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent collisionPadding={16}>Save Scenario</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id={runId}
              type="submit"
              size="icon"
              className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-100"
              disabled={isPending}
            >
              {simulateMutation.isPending ? (
                <Loader2 className="size-8 animate-spin" />
              ) : (
                <Play className="size-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent collisionPadding={16}>Run Simulation</TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
}

interface ScenarioUpdateProps {
  id: UserScenarioId;
}

export function LiveScenarioUpdate({ id }: ScenarioUpdateProps) {
  const { data } = useFetchCourses();
  const scenario = useQuery(api.scenarios.get, { id });
  return typeof data === "undefined" || typeof scenario === "undefined" ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <Loader2 className="size-16 animate-spin text-gray-400" />
      <span className="text-sm font-medium text-gray-600">Fetching scenario</span>
    </div>
  ) : (
    <div className="relative mx-auto w-full max-w-7xl grow justify-center px-6 py-8">
      <FetchedCoursesProvider courses={data}>
        <UserScenarioProvider fixedCourses={scenario.fixed_courses} utilities={scenario.utilities}>
          <ScenarioUpdateForm
            id={id}
            name={scenario.name}
            token_budget={scenario.token_budget}
            min_credits={scenario.min_credits}
            max_credits={scenario.max_credits}
          />
        </UserScenarioProvider>
      </FetchedCoursesProvider>
    </div>
  );
}
