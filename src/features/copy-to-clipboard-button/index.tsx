"use client";

import { type ComponentProps, type MouseEvent, type ReactNode, useCallback } from "react";

import { Copy, CopyCheck, CopyX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function onSuccess() {
  toast.success("Copied to clipboard!");
}

function onError() {
  toast.error("Failed to copy to clipboard", {
    description: "Enable clipboard access in your browser settings.",
    duration: Infinity,
    dismissible: true,
  });
}

type ButtonProps = ComponentProps<typeof Button>;
interface CopyToClipboardButtonProps extends Pick<ButtonProps, "variant" | "size"> {
  value: string;
  children: ReactNode;
}

export function CopyToClipboardButton({ value, children, ...props }: CopyToClipboardButtonProps) {
  const [_, mutationFn] = useCopyToClipboard();
  const { isIdle, isPending, isSuccess, mutate } = useMutation({ mutationFn, onSuccess, onError });
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const value = event.currentTarget.dataset["value"];
      if (typeof value === "undefined") return;
      mutate(value);
    },
    [mutate],
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isIdle ? (
          <Button type="button" onClick={handleClick} data-value={value} {...props}>
            {children}
            <Copy />
          </Button>
        ) : isPending ? (
          <Button type="button" {...props} disabled>
            {children}
            <Loader2 className="animate-spin" />
          </Button>
        ) : isSuccess ? (
          <Button type="button" onClick={handleClick} data-value={value} {...props}>
            {children}
            <CopyCheck />
          </Button>
        ) : (
          <Button type="button" onClick={handleClick} data-value={value} {...props}>
            {children}
            <CopyX />
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>Click to copy</TooltipContent>
    </Tooltip>
  );
}
