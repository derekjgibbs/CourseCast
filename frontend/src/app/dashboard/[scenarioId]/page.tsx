import type { UserScenarioId } from "@/convex/types";

import { LiveScenarioUpdate } from "@/features/scenario/update";

interface Params {
  scenarioId: UserScenarioId;
}

interface PageProps {
  params: Promise<Params>;
}

export default async function Page({ params }: PageProps) {
  const { scenarioId } = await params;
  return <LiveScenarioUpdate id={scenarioId} />;
}
