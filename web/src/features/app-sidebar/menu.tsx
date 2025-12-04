"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CURRENT_TERM, compareTermsDescending, getTermLabel } from "@/lib/term";
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

/** Represents a group of scenarios for a specific term */
interface TermGroup {
  term: string;
  label: string;
  scenarios: ReadonlyArray<Pick<UserScenarioDoc, "_id" | "name">>;
}

/**
 * Groups scenarios by term and sorts terms in descending order.
 * Scenarios without a term are assigned to CURRENT_TERM.
 */
function groupScenariosByTerm(scenarios: ReadonlyArray<UserScenarioDoc>) {
  const groups = new Map<string, Array<Pick<UserScenarioDoc, "_id" | "name">>>();

  for (const scenario of scenarios) {
    const term = scenario.term;
    const existing = groups.get(term);
    if (typeof existing === "undefined")
      groups.set(term, [{ _id: scenario._id, name: scenario.name }]);
    else existing.push({ _id: scenario._id, name: scenario.name });
  }

  const sortedTerms = Array.from(groups.keys()).sort(compareTermsDescending);

  return sortedTerms.map(term => {
    const scenariosForTerm = groups.get(term);
    if (typeof scenariosForTerm === "undefined")
      throw new Error(`Expected scenarios for term ${term}`);
    return {
      term,
      label: getTermLabel(term),
      scenarios: scenariosForTerm,
    } as TermGroup;
  });
}

type ScenarioMenuItemProps = Pick<UserScenarioDoc, "_id" | "name">;

function ScenarioMenuItem({ _id: id, name }: ScenarioMenuItemProps) {
  const { scenarioId } = useParams();
  const isActive = id === scenarioId;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/dashboard/${id}`} title={name}>
          <span className="truncate">{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface TermGroupSectionProps {
  group: TermGroup;
  defaultOpen: boolean;
}

function TermGroupSection({ group, defaultOpen }: TermGroupSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <CollapsibleTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium">
        <span>{group.label}</span>
        <ChevronDown className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenu className="border-sidebar-border mt-1 ml-2 border-l pl-2">
          {group.scenarios.map(scenario => (
            <ScenarioMenuItem key={scenario._id} {...scenario} />
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ScenarioMenuSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 5 }, (_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton disabled asChild>
            <Skeleton />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function ScenarioMenu() {
  const scenarios = useQuery(api.scenarios.list);

  const termGroups = useMemo(
    () => (typeof scenarios === "undefined" ? null : groupScenariosByTerm(scenarios)),
    [scenarios],
  );

  if (termGroups === null) {
    return <ScenarioMenuSkeleton />;
  }

  if (termGroups.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <span className="text-muted-foreground px-2 text-sm">No scenarios yet</span>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {termGroups.map(group => (
        <TermGroupSection
          key={group.term}
          group={group}
          defaultOpen={group.term === CURRENT_TERM}
        />
      ))}
    </div>
  );
}
