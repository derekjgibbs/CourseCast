"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { UserScenarioDoc } from "@/convex/types";

// Type for the scenario returned by api.scenarios.get (excludes user_id)
export type ScenarioData = Omit<UserScenarioDoc, "user_id">;

const ScenarioContext = createContext<ScenarioData | null>(null);

interface ScenarioProviderProps {
  scenario: ScenarioData | null;
  children: ReactNode;
}

export function ScenarioProvider({ scenario, children }: ScenarioProviderProps) {
  return <ScenarioContext.Provider value={scenario}>{children}</ScenarioContext.Provider>;
}

export function useCurrentUserScenario() {
  return useContext(ScenarioContext);
}
