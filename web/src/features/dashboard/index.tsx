"use client";
"use no memo"; // https://github.com/TanStack/table/issues/5567

import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ChevronDown,
  Loader2,
  Search,
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import {
  type Column,
  createColumnHelper,
  type ExpandedState,
  flexRender,
  type GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CURRENT_TERM, compareTermsDescending, getTermLabel } from "@/lib/term";
import { Input } from "@/components/ui/input";
import { TutorialBanner } from "@/features/tutorial-banner";
import type { UserScenarioDoc } from "@/convex/types";

import { CreateScenarioCard, ScenarioCard } from "./card";

const helper = createColumnHelper<UserScenarioDoc>();

const columns = [
  helper.accessor("term", {
    header: "Term",
    cell: info => getTermLabel(info.getValue()),
    enableGrouping: true,
    sortingFn: (a, b) => compareTermsDescending(a.original.term, b.original.term),
  }),
  helper.accessor("name", { header: "Name", sortingFn: "alphanumeric" }),
  helper.accessor("created_at", { header: "Created", sortingFn: "basic" }),
];

const DEFAULT_GROUPING: GroupingState = ["term"];

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

interface TermGroupHeaderProps {
  rowId: string;
  term: string;
  isExpanded: boolean;
  onToggle: (rowId: string, value: boolean) => void;
  children: ReactNode;
}

function TermGroupHeader({ rowId, term, isExpanded, onToggle, children }: TermGroupHeaderProps) {
  const label = getTermLabel(term);
  const handleOpenChange = useCallback(
    (value: boolean) => onToggle(rowId, value),
    [onToggle, rowId],
  );
  return (
    <Collapsible open={isExpanded} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium">
        <span>{label}</span>
        <ChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
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

  const [expanded, setExpanded] = useState<ExpandedState>(() => {
    const expanded: ExpandedState = {};
    const seenTerms = new Set<string>();
    for (const scenario of scenarios) {
      if (seenTerms.has(scenario.term)) continue;
      seenTerms.add(scenario.term);
      expanded[`term:${scenario.term}`] = scenario.term === CURRENT_TERM;
    }
    return expanded;
  });

  const tableState = useMemo(
    () => ({
      globalFilter,
      expanded,
      grouping: DEFAULT_GROUPING,
    }),
    [globalFilter, expanded],
  );

  const table = useReactTable({
    data: scenarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    autoResetExpanded: false,
    globalFilterFn: "includesString",
    state: tableState,
    onGlobalFilterChange: setGlobalFilter,
  });

  const { rows } = table.getRowModel();

  // Filter out term column from sort controls (it's used for grouping)
  const sortableHeaders = table.getFlatHeaders().filter(header => header.column.id !== "term");

  // Stable callback for toggling expanded state
  const handleToggleExpanded = useCallback(
    (rowId: string, value: boolean) =>
      setExpanded(prev => (prev === true ? { [rowId]: value } : { ...prev, [rowId]: value })),
    [],
  );

  // Render grouped rows with collapsible term headers
  const groupedContent = useMemo(
    () =>
      rows.map(row => {
        if (!row.getIsGrouped()) return null;

        const termValue = row.getValue("term");
        if (typeof termValue !== "string") throw new Error("Term value is not a string");

        const isCurrentTerm = termValue === CURRENT_TERM;
        return (
          <TermGroupHeader
            key={row.id}
            rowId={row.id}
            term={termValue}
            isExpanded={row.getIsExpanded()}
            onToggle={handleToggleExpanded}
          >
            {isCurrentTerm && <CreateScenarioCard onSuccess={handleSuccess} />}
            {row.subRows.map(subRow => (
              <ScenarioCard key={subRow.original._id} scenario={subRow.original} />
            ))}
          </TermGroupHeader>
        );
      }),
    [rows, handleSuccess, handleToggleExpanded],
  );

  const sortControls = useMemo(() => {
    return sortableHeaders.map(header => (
      <SortControl key={header.id} column={header.column}>
        {flexRender(header.column.columnDef.header, header.getContext())}
      </SortControl>
    ));
  }, [sortableHeaders]);

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
      <div className="space-y-6">{groupedContent}</div>
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
