"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import * as SliderPrimitive from "@radix-ui/react-slider";

interface SliderWithArrowStickyLabelProps {
  id?: string;
  name?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  formatValue?: (value: number) => React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderWithArrowStickyLabel({
  id,
  name,
  value,
  onValueChange,
  formatValue,
  min = 0,
  max = 100,
  step = 1,
}: SliderWithArrowStickyLabelProps) {
  return (
    <div className="relative flex w-full flex-col items-center">
      <SliderPrimitive.Root
        id={id}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        className="relative flex w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Range className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>
        {value.map((value, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="group border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            {typeof name === "undefined" ? null : <input type="hidden" name={name} value={value} />}
            {/* Sticky label */}
            <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
              {typeof formatValue === "undefined" ? <span>{value}</span> : formatValue(value)}
              {/* Arrow */}
              <div className="border-t-primary absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent" />
            </Badge>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}
