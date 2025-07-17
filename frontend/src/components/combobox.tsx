"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WithLabel {
  label: ReactNode;
}

interface ComboboxProps<V extends WithLabel, K extends string = string> {
  options: Record<K, V>;
  value?: K;
  onValueChange: (value: K) => void;
  placeholder: string;
  children: ReactNode;
  className?: string;
}

export function Combobox<V extends WithLabel, K extends string = string>({
  options,
  value,
  onValueChange,
  placeholder,
  className,
  children,
}: ComboboxProps<V, K>) {
  const [open, setOpen] = useState(false);
  const entries = useMemo(() => Object.entries(options) as [K, V][], [options]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {value ? options[value]?.label : <span>{placeholder}</span>}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command defaultValue={value}>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{children}</CommandEmpty>
            {entries.length === 0 ? null : (
              <CommandGroup>
                {entries.map(([key, { label }]) => (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={currentValue => {
                      onValueChange(currentValue as K);
                      setOpen(false);
                    }}
                  >
                    <span>{label}</span>
                    <Check className={cn("ml-auto", value === key ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
