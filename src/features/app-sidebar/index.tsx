import Link from "next/link";
import { Authenticated, useQuery } from "convex/react";
import { Ellipsis, Home } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserScenarioId } from "@/convex/types";

import { LogoutButton, ScenarioGroupAction } from "./button";
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
              <span>Dashboard</span>
            </MenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <Authenticated>
          <SidebarGroup>
            <SidebarGroupLabel>Scenarios</SidebarGroupLabel>
            <ScenarioGroupAction />
            <SidebarGroupContent>
              <ScenarioMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        </Authenticated>
      </SidebarContent>
      <Authenticated>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <LogoutButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Authenticated>
    </Sidebar>
  );
}

export function LiveAppHeader() {
  const { scenarioId } = useParams();
  return typeof scenarioId === "string" ? (
    <Authenticated>
      <LiveAppHeaderTitle scenarioId={scenarioId} />
    </Authenticated>
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
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {typeof href === "undefined" ? null : (
          <AppHeaderDynamicBreadcrumbs href={href}>{children}</AppHeaderDynamicBreadcrumbs>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

interface AppHeaderDynamicBreadcrumbsProps {
  href: string;
  children: ReactNode;
}

function AppHeaderDynamicBreadcrumbs({ href, children }: AppHeaderDynamicBreadcrumbsProps) {
  const pathname = usePathname();
  const hasSettings = useMemo(() => pathname.endsWith("/simulate"), [pathname]);
  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href={href}>{children}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {hasSettings ? (
        <>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`${href}/settings`}>Simulate</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      ) : null}
    </>
  );
}
