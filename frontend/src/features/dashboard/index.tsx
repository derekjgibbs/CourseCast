"use client";

import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";

import { AuthenticationForm } from "./form";

export function Dashboard() {
  return (
    <>
      <AuthLoading>
        <div className="flex w-full grow items-center justify-center">
          <Loader2 className="size-32 animate-spin text-gray-400" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="mx-auto w-full max-w-7xl grow justify-center space-y-8 px-6 py-8">
          <AuthenticationForm />
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="mx-auto w-full max-w-7xl justify-center space-y-8 px-6 py-8">
          (scenarios)
        </div>
      </Authenticated>
    </>
  );
}
