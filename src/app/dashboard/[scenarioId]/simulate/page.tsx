import { LiveSimulation } from "@/features/simulation";
import type { UserScenarioId } from "@/convex/types";

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
