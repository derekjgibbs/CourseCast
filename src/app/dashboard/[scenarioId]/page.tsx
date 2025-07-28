"use client";

import { LiveScenarioUpdate } from "@/features/scenario/update";
import { useCurrentUserScenario } from "@/features/scenario/get";

export default function Page() {
  const scenario = useCurrentUserScenario();
  return scenario === null ? null : <LiveScenarioUpdate scenario={scenario} />;
}
