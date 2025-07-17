"use client";

import Form from "next/form";
import { useCallback, useId, useState } from "react";

import { CONSTRAINTS, isValidCreditsRange } from "@/convex/types";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SliderWithArrowStickyLabel } from "@/components/ui/slider-with-arrow-sticky-label";

export function ConstraintSetupForm() {
  const id = useId();
  const [creditRange, setCreditRange] = useState<[number, number]>([
    CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT,
    CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT,
  ]);

  const handleValueChange = useCallback(([min, max]: number[]) => {
    if (typeof min === "undefined" || typeof max === "undefined") return;
    if (isValidCreditsRange(min, max)) setCreditRange([min, max]);
  }, []);

  return (
    <Form action="/" className="contents">
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-token-budget`}>Token Budget</Label>
          <Input
            id={`${id}-token-budget`}
            type="number"
            required
            placeholder="4500"
            defaultValue={4500}
          />
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
              value={creditRange}
              onValueChange={handleValueChange}
              formatValue={value => <span>{value.toFixed(1)} Credits</span>}
            />
            <span className="text-sm text-gray-500">
              {CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>(footer)</CardFooter>
    </Form>
  );
}
