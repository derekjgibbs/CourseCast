"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar, LiveAppHeader } from "@/features/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function RedirectToHome() {
  const router = useRouter();
  useEffect(() => router.push("/"), [router]);
  return null;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } }),
  );
  return (
    <SidebarProvider>
      <QueryClientProvider client={client}>
        <AuthLoading>
          <div className="flex grow items-center justify-center">
            <Loader2 className="size-32 animate-spin text-gray-400" />
          </div>
        </AuthLoading>
        <Unauthenticated>
          <RedirectToHome />
        </Unauthenticated>
        <Authenticated>
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
        </Authenticated>
      </QueryClientProvider>
    </SidebarProvider>
  );
}
