"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import type { UserScenarioDoc } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

type ScenarioMenuItemProps = Pick<UserScenarioDoc, "_id" | "name">;
function ScenarioMenuItem({ _id: id, name }: ScenarioMenuItemProps) {
  const { scenarioId } = useParams();
  const isActive = id === scenarioId;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/dashboard/${id}`}>{name}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function ScenarioMenu() {
  const scenarios = useQuery(api.scenarios.list);
  return typeof scenarios === "undefined" ? (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton disabled asChild>
          <Skeleton />
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton disabled asChild>
          <Skeleton />
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton disabled asChild>
          <Skeleton />
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton disabled asChild>
          <Skeleton />
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton disabled asChild>
          <Skeleton />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  ) : (
    <SidebarMenu>
      {scenarios.map(scenario => (
        <ScenarioMenuItem key={scenario._id} {...scenario} />
      ))}
    </SidebarMenu>
  );
}
