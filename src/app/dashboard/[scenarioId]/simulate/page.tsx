import type { UserScenarioId } from "@/convex/types";

import { LiveSimulation } from "@/features/simulation";

interface Params {
  scenarioId: string;
}

interface SimulatePageProps {
  params: Promise<Params>;
}

export default async function SimulatePage({ params }: SimulatePageProps) {
  const { scenarioId } = await params;
  return <LiveSimulation scenarioId={scenarioId as UserScenarioId} />;
}
