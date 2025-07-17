"use client";

import { NotepadTextDashed, Save } from "lucide-react";
import { useCallback, useId, useState } from "react";

import { CONSTRAINTS, isValidCreditsRange } from "@/convex/types";

import { Button } from "@/components/ui/button";
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

  // TODO: Use <Form> from next/form.
  return (
    <form className="contents">
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
      <CardFooter className="justify-end gap-1">
        <Button type="submit" variant="outline" disabled>
          <NotepadTextDashed />
          <span>Save Template</span>
        </Button>
        <Button type="submit" disabled>
          <Save />
          <span>Submit Constraints</span>
        </Button>
      </CardFooter>
    </form>
  );
}
