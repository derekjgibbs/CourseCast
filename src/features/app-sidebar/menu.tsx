"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserScenarioDoc } from "@/convex/types";

interface MenuItemProps {
  href: string;
  children: ReactNode;
}

export function MenuItem({ href, children }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = href === pathname;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={href}>{children}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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
