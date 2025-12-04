"use client";

import * as v from "valibot";
import Link from "next/link";
import { CircleAlert, Heart, Loader2, Save, Settings } from "lucide-react";
import { decode } from "decode-formdata";
import { toast } from "sonner";
import { useId, useState } from "react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CONSTRAINTS,
  isValidCreditsRange,
  type UserScenarioDoc,
  type UserScenarioId,
} from "@/convex/types";
import { FetchedCoursesProvider, useFetchedCourses } from "@/hooks/use-fetch-courses";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioData } from "@/features/scenario/get";
import { ScenarioDeleteAlert } from "@/features/scenario/delete";
import { SliderWithArrowStickyLabel } from "@/components/ui/slider-with-arrow-sticky-label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ScenarioDuplicateAlert } from "../duplicate";

import { LiveCourseCatalogDataTable } from "./live-course-catalog-data-table";
import { LiveCourseUtilityTable } from "./live-course-utility-table";
import { LiveFixedCourseCatalogTable } from "./live-fixed-course-catalog-table";
import { UserScenarioProvider } from "./store";

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

type UserScenario = Pick<UserScenarioDoc, "name" | "token_budget" | "max_credits">;
interface ScenarioUpdateFormProps extends UserScenario {
  id: string;
  defaultTabValue: "pre-term" | "regular";
}

const stringAsNumberSchema = v.pipe(
  v.string(),
  v.transform(val => Number.parseFloat(val)),
);
const updateUserScenarioSchema = v.object({
  id: v.string(),
  name: v.string(),
  token_budget: v.pipe(v.number(), v.integer()),
  credit_range: v.tuple([stringAsNumberSchema]),
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
  max_credits: initialMaxCredits,
  defaultTabValue,
}: ScenarioUpdateFormProps) {
  const id = useId();

  const [name, setName] = useState(initialName);
  const [tokenBudget, setTokenBudget] = useState(Number(initialTokenBudget));
  const [creditRange, setCreditRange] = useState<[number]>([initialMaxCredits]);

  const mutationFn = useConvexMutation(api.scenarios.update);
  const mutation = useTanstackMutation({
    mutationFn,
    onSuccess: onSaveSuccess,
    onError: onSaveError,
  });

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
          const {
            id,
            token_budget,
            credit_range: [max_credits],
            ...rest
          } = parsed;
          mutation.mutate({
            ...rest,
            id: id as UserScenarioId,
            token_budget: BigInt(token_budget),
            max_credits,
          });
        }
      }}
      className="space-y-8"
    >
      <input type="hidden" name="id" value={scenarioId} />
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Settings className="fill-gray-200 text-gray-500" />
            <span>Configure Constraints</span>
          </CardTitle>
          <CardDescription>Configure the simulation constraints for the scenario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Scenario Name</Label>
            <Input
              id={`${id}-name`}
              type="text"
              required
              placeholder={name}
              name="name"
              value={name}
              onChange={event => {
                const name = event.target.value;
                if (name.length <= CONSTRAINTS.USER_SCENARIO.NAME_MAX_LENGTH) setName(name);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-credit-range`}>Maximum Credits</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">0.00</span>
              <SliderWithArrowStickyLabel
                id={`${id}-credit-range`}
                max={CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}
                step={0.25}
                name="credit_range"
                value={creditRange}
                onValueChange={([max]) => {
                  if (typeof max === "undefined") return;
                  if (isValidCreditsRange(0, max)) setCreditRange([max]);
                }}
                formatValue={value => <span>{value.toFixed(2)} Credits</span>}
              />
              <span className="text-sm text-gray-500">
                {CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Settings className="fill-gray-200 text-gray-500" />
            <span>Are you a pre-term student?</span>
          </CardTitle>
          <CardDescription>
            Pre-term students are subject to additional constraints on their token budget and the
            courses they can take (i.e., the fixed core).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTabValue}>
            <TabsList>
              <TabsTrigger value="pre-term">For Pre-term Students</TabsTrigger>
              <TabsTrigger value="regular">For Everyone Else</TabsTrigger>
            </TabsList>
            <div className="p-2">
              <TabsContent value="regular" className="space-y-4">
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
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>Only for Regular Students</AlertTitle>
                  <AlertDescription>
                    <span>
                      This module is intended to be only for <strong>regular students</strong>. If
                      you are a pre-term student, please use the other module.
                    </span>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="pre-term" className="space-y-4">
                <LiveFixedCourseCatalogTable name="fixed_courses" />
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>Only for Pre-term Students</AlertTitle>
                  <AlertDescription>
                    <span>
                      This module is intended to be only for <strong>pre-term students</strong>. If
                      you are a regular student, please use the other module.
                    </span>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Heart className="fill-red-800 text-red-800" />
            <span>Course Utility</span>
          </CardTitle>
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
              type="submit"
              size="icon"
              disabled={mutation.isPending}
              className="rounded-full border-0 bg-linear-to-br from-blue-500 via-purple-500 to-indigo-500 p-8 text-white shadow-2xl hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 disabled:opacity-100"
            >
              {mutation.isPending ? (
                <Loader2 className="size-8 animate-spin" />
              ) : (
                <Save className="size-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent collisionPadding={16}>Save Scenario</TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
}

interface LiveScenarioUpdateProps {
  scenario: ScenarioData;
}

export function LiveScenarioUpdate({ scenario }: LiveScenarioUpdateProps) {
  const data = useFetchedCourses();
  return (
    <div className="relative mx-auto w-full max-w-7xl grow justify-center space-y-8 px-6 py-8">
      <div className="flex items-center justify-between gap-6 rounded-lg border-0 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 text-white shadow-lg">
        <div className="grow">
          <h3 className="font-semibold text-white">Ready to run a simulation?</h3>
          <p className="mt-1 text-sm text-blue-50">
            Discover optimal strategies by simulating a hundred possible course registration
            outcomes to see the probability of landing your desired classes.
          </p>
        </div>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="shrink-0 bg-white font-medium text-blue-600 hover:bg-blue-50"
        >
          <Link href={`/dashboard/${scenario._id}/simulate`}>Let&apos;s go!</Link>
        </Button>
      </div>
      <FetchedCoursesProvider courses={data}>
        <UserScenarioProvider fixedCourses={scenario.fixed_courses} utilities={scenario.utilities}>
          <ScenarioUpdateForm
            id={scenario._id}
            name={scenario.name}
            token_budget={scenario.token_budget}
            max_credits={scenario.max_credits}
            defaultTabValue={scenario.fixed_courses.length === 0 ? "regular" : "pre-term"}
          />
        </UserScenarioProvider>
      </FetchedCoursesProvider>
      <div className="space-y-2">
        <ScenarioDuplicateAlert scenarioId={scenario._id} />
        <ScenarioDeleteAlert scenarioId={scenario._id} />
      </div>
    </div>
  );
}
