import type { UserScenarioId } from "@/convex/types";

import { LiveScenarioUpdateCard } from "@/features/scenario/update";

interface Params {
  scenarioId: UserScenarioId;
}

interface PageProps {
  params: Promise<Params>;
}

export default async function Page({ params }: PageProps) {
  const { scenarioId } = await params;
  return (
    <div className="mx-auto w-full max-w-7xl justify-center space-y-8 px-6 py-8">
      <LiveScenarioUpdateCard id={scenarioId} />
    </div>
  );
}
