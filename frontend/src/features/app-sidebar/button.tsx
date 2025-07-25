import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { SidebarGroupAction } from "@/components/ui/sidebar";

import { ScenarioDialog } from "@/features/scenario/create";

export function ScenarioGroupAction() {
  const router = useRouter();
  return (
    <ScenarioDialog onSuccess={id => router.push(`/dashboard/${id}`)}>
      <SidebarGroupAction title="Create New Scenario">
        <Plus />
      </SidebarGroupAction>
    </ScenarioDialog>
  );
}
