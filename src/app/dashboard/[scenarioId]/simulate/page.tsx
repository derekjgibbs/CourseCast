"use client";

import { LiveSimulation } from "@/features/simulation";
import { useCurrentUserScenario } from "@/features/scenario/get";

export default function Page() {
  const scenario = useCurrentUserScenario();
  return scenario === null ? null : <LiveSimulation scenario={scenario} />;
}
