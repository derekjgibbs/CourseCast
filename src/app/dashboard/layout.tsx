"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { LiveAppHeader, AppSidebar } from "@/features/app-sidebar";
import { LiveConvexProvider } from "@/features/live-convex-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } }),
  );
  return (
    <SidebarProvider>
      <LiveConvexProvider>
        <QueryClientProvider client={client}>
          <div className="flex w-full">
            <nav>
              <AppSidebar />
            </nav>
            <main className="flex grow flex-col overflow-y-auto">
              <header className="bg-background sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b px-2">
                <SidebarTrigger />
                <Separator orientation="vertical" />
                <div className="ml-2">
                  <LiveAppHeader />
                </div>
              </header>
              {children}
            </main>
          </div>
        </QueryClientProvider>
      </LiveConvexProvider>
      <Toaster richColors closeButton position="bottom-left" theme="light" />
    </SidebarProvider>
  );
}
