"use client";

import { Loader2, LogOut, Plus } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ScenarioDialog } from "@/features/scenario/create";
import { SidebarGroupAction, SidebarMenuButton } from "@/components/ui/sidebar";

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

export function LogoutButton() {
  const { signOut } = useAuthActions();
  const mutation = useMutation({ mutationFn: signOut });
  const handleClick = useCallback(() => mutation.mutate(), [mutation]);
  return mutation.isPending ? (
    <SidebarMenuButton type="button" onClick={handleClick} disabled>
      <Loader2 className="animate-spin" />
      <span>Logging out...</span>
    </SidebarMenuButton>
  ) : (
    <SidebarMenuButton type="button" onClick={handleClick}>
      <LogOut />
      <span>Log Out</span>
    </SidebarMenuButton>
  );
}
