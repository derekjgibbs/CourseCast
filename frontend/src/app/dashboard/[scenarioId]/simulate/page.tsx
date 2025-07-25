interface Params {
  scenarioId: string;
}

interface SimulatePageProps {
  params: Promise<Params>;
}

export default async function SimulatePage({ params }: SimulatePageProps) {
  const { scenarioId } = await params;
  return scenarioId;
}
