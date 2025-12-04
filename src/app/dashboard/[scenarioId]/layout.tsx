import type { ReactNode } from "react";

import type { UserScenarioId } from "@/convex/types";

import { ScenarioProviderWrapper } from "./layout.client";

interface Params {
  scenarioId: string;
}

interface LayoutProps {
  params: Promise<Params>;
  children: ReactNode;
}

export default async function Layout({ params, children }: LayoutProps) {
  const { scenarioId } = await params;
  return (
    <ScenarioProviderWrapper scenarioId={scenarioId as UserScenarioId}>
      {children}
    </ScenarioProviderWrapper>
  );
}
