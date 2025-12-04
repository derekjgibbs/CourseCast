"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { oembed } from "@loomhq/loom-embed";
import { useQuery } from "@tanstack/react-query";

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function useLoomVideo(href: string) {
  return useQuery({
    queryKey: ["loom-video", href] as const,
    queryFn: async ({ queryKey: [_, href] }) => await oembed(href),
  });
}

interface LoomVideoPlayerProps {
  href: string;
}

function LoomVideoPlayer({ href }: LoomVideoPlayerProps) {
  const { isPending, isError, data, error } = useLoomVideo(href);

  if (isPending)
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Loader2 className="size-16 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Loading tutorial video...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <AlertCircle className="size-16 text-red-500" />
        <p className="text-sm text-red-600">Failed to load tutorial video</p>
        <p className="text-xs text-gray-500">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );

  return <div className="contents" dangerouslySetInnerHTML={{ __html: data.html }} />;
}

export function TutorialPlayerContent() {
  return (
    <DialogContent className="max-h-[900px] max-w-4xl sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>How to use CourseCast</DialogTitle>
      </DialogHeader>
      <LoomVideoPlayer href="https://www.loom.com/share/5b474f8dabc64b28a2c381b2803d7731" />
    </DialogContent>
  );
}
