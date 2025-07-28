import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { ScenarioDialog } from "@/features/scenario/create";
import { SidebarGroupAction } from "@/components/ui/sidebar";

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
