"use client";
"use no memo"; // https://github.com/TanStack/table/issues/5567

import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  BookOpen,
  Building,
  ClipboardList,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import { type MouseEvent, useCallback, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyToClipboardButton } from "@/features/copy-to-clipboard-button";
import type { Course } from "@/lib/schema/course";
import { DepartmentBadge } from "@/features/department-badge";
import { formatTimeRange } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SortSymbolProps {
  direction: SortDirection | false;
}

function SortSymbol({ direction }: SortSymbolProps) {
  switch (direction) {
    case "asc":
      return <ArrowUpNarrowWide />;
    case "desc":
      return <ArrowDownWideNarrow />;
    default:
      return <ArrowUpDown />;
  }
}

// HACK: We hard-code the STAT substitutions for now.
const STAT_SUBSTITUTIONS = new Map([
  ["STAT6130001", "STAT6210001"],
  ["STAT6130002", "STAT6210003"],
  ["STAT6130003", "STAT6210005"],
  ["STAT6130004", "STAT6210001"],
  ["STAT6130005", "STAT6210003"],
  ["STAT6130006", "STAT6210005"],
]);

const helper = createColumnHelper<Course>();
const columns = [
  helper.display({
    id: "remove",
    cell: function Cell({ table, row }) {
      const onRemove = table.options.meta?.onRemove;
      const onAdd = table.options.meta?.onAdd;
      const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          const id = event.currentTarget.dataset["id"];
          if (typeof id === "undefined") return;

          const substitution = STAT_SUBSTITUTIONS.get(id);
          if (typeof substitution === "undefined") {
            if (!window.confirm("Are you sure you want to waive this course?")) return;
          } else {
            if (
              !window.confirm(
                `Are you sure you want to waive ${id}? This will be replaced with ${substitution}, which you may also waive later.`,
              )
            )
              return;
            onAdd?.(substitution);
          }

          onRemove?.(id);
        },
        [onRemove, onAdd],
      );
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              data-id={row.original.forecast_id}
              onClick={handleClick}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Waive Course</TooltipContent>
        </Tooltip>
      );
    },
  }),
  helper.accessor("forecast_id", {
    sortingFn: "alphanumeric",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="size-4" />
            <span>Section</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info => {
      const value = info.getValue();
      return (
        <CopyToClipboardButton value={value} variant="ghost" size="sm">
          <span className="text-sm font-medium text-gray-600">{value}</span>
        </CopyToClipboardButton>
      );
    },
  }),
  helper.accessor("title", {
    sortingFn: "alphanumeric",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Pencil className="size-4" />
            <span>Title</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info => (
      <div className="size-full text-left font-semibold text-gray-900">{info.getValue()}</div>
    ),
  }),
  helper.accessor("department", {
    sortingFn: "basic",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Building className="size-4" />
            <span>Department</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info => <DepartmentBadge department={info.getValue()} />,
  }),
  helper.accessor("instructors", {
    sortingFn: "basic",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <User className="size-4" />
            <span>Instructor</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info =>
      info.getValue().map(instructor => (
        <Badge key={instructor} variant="outline">
          {instructor}
        </Badge>
      )),
  }),
  helper.accessor(
    ({ days_code, start_time, stop_time, part_of_term }) => ({
      days: days_code,
      time: formatTimeRange(start_time, stop_time),
      partOfTerm: part_of_term,
    }),
    {
      // TODO: sortingFn
      id: "schedule",
      header: () => (
        <div className="flex items-center space-x-2">
          <Clock className="size-4" />
          <span>Schedule</span>
        </div>
      ),
      cell: info => {
        const { days, time, partOfTerm } = info.getValue();
        return (
          <div className="text-sm">
            <div className="font-semibold text-gray-900">{days}</div>
            <div className="text-gray-500">{time}</div>
            <div className="mt-1 flex flex-wrap justify-center gap-1">
              {partOfTerm.length > 0 ? (
                partOfTerm.map(term => (
                  <Badge key={term} variant="secondary" className="text-xs">
                    {term}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  TBA
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
  ),
  helper.accessor("credits", {
    sortingFn: "basic",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <ClipboardList className="size-4" />
            <span>Credits</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info => <span className="text-lg font-bold text-green-600">{info.getValue()}</span>,
  }),
  helper.accessor("truncated_price_prediction", {
    sortingFn: "basic",
    header: function Header({ column }) {
      const handleClick = useCallback(() => column.toggleSorting(), [column]);
      return (
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="size-4" />
            <span>Price Forecast</span>
          </div>
          <SortSymbol direction={column.getIsSorted()} />
        </Button>
      );
    },
    cell: info => <span className="text-lg font-bold text-red-500">{info.getValue()}</span>,
  }),
];
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    name?: string;
    onRemove?: (id: string) => void;
    onAdd?: (id: string) => void;
  }
}

interface FixedCourseCatalogTableProps {
  name?: string;
  courses: Course[];
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
}

export function FixedCourseCatalogTable({
  name,
  courses,
  onRemove,
  onAdd,
}: FixedCourseCatalogTableProps) {
  const table = useReactTable({
    columns,
    data: courses,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { name, onRemove, onAdd },
  });

  const { rows } = table.getRowModel();
  const inputs = useMemo(
    () =>
      rows.map(row => (
        <input
          key={row.original.forecast_id}
          type="hidden"
          name={name}
          value={row.original.forecast_id}
        />
      )),
    [rows, name],
  );

  // Apply special deduction rules based on how many fixed courses were selected
  const tokenBudget = useMemo(() => {
    const totalCredits = rows.reduce((credits, curr) => credits + curr.original.credits, 0);
    if (totalCredits >= 3) return 2300;
    if (totalCredits >= 2.5) return 2700;
    if (totalCredits >= 2) return 3050;
    if (totalCredits >= 1.5) return 3400;
    if (totalCredits >= 1) return 3700;
    return 4000;
  }, [rows]);

  return (
    <>
      {inputs}
      <input type="hidden" name="token_budget" value={tokenBudget} />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id} className="hover:bg-inherit">
              {group.headers.map(header => (
                <TableHead key={header.id} className="text-gray-700">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="text-center">
          {rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
