"use client";

import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ScenarioUpdateCard } from "@/features/scenario";
import { LiveCourseCatalogDataTable } from "@/features/live-course-catalog-data-table";

import { AuthenticationForm } from "./form";

export function Dashboard() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthLoading>
        <main className="mx-auto flex max-w-7xl grow items-center justify-center space-y-8 px-6 py-8">
          <Loader2 className="size-32 animate-spin text-gray-400" />
        </main>
      </AuthLoading>
      <Unauthenticated>
        <main className="mx-auto max-w-7xl grow justify-center space-y-8 px-6 py-8">
          <AuthenticationForm />
        </main>
      </Unauthenticated>
      <Authenticated>
        <main className="mx-auto w-full max-w-7xl grow space-y-8 px-6 py-8">
          <ScenarioUpdateCard />
          <LiveCourseCatalogDataTable />
        </main>
      </Authenticated>
    </QueryClientProvider>
  );
}
