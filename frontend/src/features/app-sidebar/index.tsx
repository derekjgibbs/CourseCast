import Link from "next/link";

import { Home, Ellipsis } from "lucide-react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import type { UserScenarioId } from "@/convex/types";
import { api } from "@/convex/_generated/api";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";

import { ScenarioGroupAction } from "./button";
import { MenuItem, ScenarioMenu } from "./menu";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
        >
          CourseCast
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <MenuItem href="/dashboard">
              <Home />
              <span>Course Catalog</span>
            </MenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Scenarios</SidebarGroupLabel>
          <ScenarioGroupAction />
          <SidebarGroupContent>
            <ScenarioMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function LiveAppHeader() {
  const { scenarioId } = useParams();
  return typeof scenarioId === "string" ? (
    <LiveAppHeaderTitle scenarioId={scenarioId} />
  ) : (
    <AppHeaderBreadcrumbs />
  );
}

interface LiveAppHeaderTitleProps {
  scenarioId: string;
}

function LiveAppHeaderTitle({ scenarioId }: LiveAppHeaderTitleProps) {
  const scenarioName = useQuery(api.scenarios.get, { id: scenarioId as UserScenarioId })?.name ?? (
    <Ellipsis />
  );
  return (
    <AppHeaderBreadcrumbs href={`/dashboard/${scenarioId}`}>{scenarioName}</AppHeaderBreadcrumbs>
  );
}

interface AppHeaderBreadcrumbsProps {
  href?: string;
  children?: ReactNode;
}

function AppHeaderBreadcrumbs({ href, children }: AppHeaderBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Course Catalog</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {typeof href === "undefined" ? null : (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={href}>{children}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
