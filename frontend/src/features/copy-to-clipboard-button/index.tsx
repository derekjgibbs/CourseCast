"use client";

import type { ComponentProps, ReactNode } from "react";

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
  const mutation = useMutation({ mutationFn, onSuccess, onError });
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        const data = new FormData(event.currentTarget);
        const value = data.get("value");
        if (typeof value === "string") mutation.mutate(value);
      }}
      className="contents"
    >
      <input type="hidden" name="value" value={value} />
      <Tooltip>
        <TooltipTrigger asChild>
          {mutation.isIdle ? (
            <Button type="submit" {...props}>
              {children}
              <Copy />
            </Button>
          ) : mutation.isPending ? (
            <Button type="button" {...props} disabled>
              {children}
              <Loader2 className="animate-spin" />
            </Button>
          ) : mutation.isSuccess ? (
            <Button type="submit" {...props}>
              {children}
              <CopyCheck />
            </Button>
          ) : (
            <Button type="submit" {...props}>
              {children}
              <CopyX />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>Click to copy</TooltipContent>
      </Tooltip>
    </form>
  );
}
