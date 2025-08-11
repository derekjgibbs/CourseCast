"use client";
"use no memo"; // https://github.com/TanStack/table/issues/5567

import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, Loader2, Search } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import {
  type Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TutorialBanner } from "@/features/tutorial-banner";
import type { UserScenarioDoc } from "@/convex/types";

import { CreateScenarioCard, ScenarioCard } from "./card";

const helper = createColumnHelper<UserScenarioDoc>();

const columns = [
  helper.accessor("name", { header: "Name", sortingFn: "alphanumeric" }),
  helper.accessor("created_at", { header: "Created", sortingFn: "basic" }),
];

interface SortControlProps {
  column: Column<UserScenarioDoc>;
  children: React.ReactNode;
}

function SortControl({ column, children }: SortControlProps) {
  const handleClick = useCallback(() => column.toggleSorting(), [column]);

  let icon: ReactNode;
  switch (column.getIsSorted()) {
    case "asc":
      icon = <ArrowUpNarrowWide className="size-3" />;
      break;
    case "desc":
      icon = <ArrowDownWideNarrow className="size-3" />;
      break;
    default:
      icon = <ArrowUpDown className="size-3" />;
      break;
  }

  return (
    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" asChild>
      <button type="button" className="flex items-center gap-1" onClick={handleClick}>
        {children}
        {icon}
      </button>
    </Badge>
  );
}

interface DashboardContentProps {
  scenarios: UserScenarioDoc[];
}

function DashboardContent({ scenarios }: DashboardContentProps) {
  const router = useRouter();
  const handleSuccess = useCallback((id: string) => router.push(`/dashboard/${id}`), [router]);

  const [globalFilter, setGlobalFilter] = useState("");
  const handleFilterChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setGlobalFilter(event.target.value),
    [],
  );

  const table = useReactTable({
    data: scenarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const { rows } = table.getRowModel();
  const cards = useMemo(
    () => rows.map(row => <ScenarioCard key={row.original._id} scenario={row.original} />),
    [rows],
  );

  const flatHeaders = table.getFlatHeaders();
  const sortControls = useMemo(
    () =>
      flatHeaders.map(header => (
        <SortControl key={header.id} column={header.column}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </SortControl>
      )),
    [flatHeaders],
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          id="scenario-search"
          placeholder="Search scenarios..."
          value={globalFilter}
          onChange={handleFilterChange}
          className="w-full pl-10"
        />
      </div>
      <div className="flex items-center gap-2">{sortControls}</div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CreateScenarioCard onSuccess={handleSuccess} />
        {cards}
      </div>
    </div>
  );
}

export function Dashboard() {
  const scenarios = useQuery(api.scenarios.list);
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <TutorialBanner />
      {typeof scenarios === "undefined" ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <Loader2 className="size-16 animate-spin text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Loading scenarios</span>
        </div>
      ) : (
        <DashboardContent scenarios={scenarios} />
      )}
    </div>
  );
}
