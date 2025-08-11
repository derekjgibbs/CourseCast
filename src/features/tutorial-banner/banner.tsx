import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

export function TutorialBannerContent() {
  return (
    <div className="rounded-lg border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-6 text-white shadow-lg">
      <div className="flex items-center justify-between gap-6">
        <div className="grow">
          <h1 className="text-2xl font-bold text-white">CourseCast Dashboard</h1>
          <p className="mt-1 text-sm text-blue-50">
            New to CourseCast? Watch our tutorial video to learn how to optimize your course
            selection with Monte Carlo simulation.
          </p>
        </div>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:text-white"
            variant="outline"
          >
            <Play className="mr-2" />
            <span>Watch Tutorial</span>
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
}
