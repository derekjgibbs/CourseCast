"use client";
"use no memo"; // https://github.com/TanStack/table/issues/5567

import {
  ArrowBigLeft,
  ArrowBigRight,
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  BookOpen,
  Building,
  ClipboardList,
  Clock,
  DollarSign,
  Download,
  Pencil,
  Search,
  User,
} from "lucide-react";
import { type ChangeEvent, type MouseEvent, useCallback, useState } from "react";
import {
  type Column,
  type SortDirection,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { unparse } from "papaparse";

import type { CourseDoc } from "@/convex/types";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CopyToClipboardButton } from "@/features/copy-to-clipboard-button";

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

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export type Course = Pick<
  CourseDoc,
  | "course_id"
  | "title"
  | "department"
  | "instructor"
  | "days"
  | "start_time"
  | "end_time"
  | "credits"
  | "price_forecast"
>;
const helper = createColumnHelper<Course>();
const columns = [
  helper.accessor("course_id", {
    sortingFn: "alphanumeric",
    filterFn: "includesString",
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
            <span>Course ID</span>
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
    filterFn: "includesString",
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
    cell: info => {
      const dept = info.getValue();
      let gradientClass: string;
      switch (dept) {
        case "ACCT":
          gradientClass = "bg-gradient-to-r from-blue-500 to-indigo-600";
          break;
        case "REAL":
          gradientClass = "bg-gradient-to-r from-green-500 to-emerald-600";
          break;
        case "FINC":
          gradientClass = "bg-gradient-to-r from-purple-500 to-violet-600";
          break;
        case "MKTG":
          gradientClass = "bg-gradient-to-r from-pink-500 to-rose-600";
          break;
        case "OIDD":
          gradientClass = "bg-gradient-to-r from-orange-500 to-amber-600";
          break;
        case "MGMT":
          gradientClass = "bg-gradient-to-r from-cyan-500 to-blue-600";
          break;
        case "STAT":
          gradientClass = "bg-gradient-to-r from-red-500 to-pink-600";
          break;
        case "BEPP":
          gradientClass = "bg-gradient-to-r from-teal-500 to-cyan-600";
          break;
        case "LGST":
          gradientClass = "bg-gradient-to-r from-slate-500 to-gray-600";
          break;
        default:
          gradientClass = "bg-gradient-to-r from-gray-500 to-gray-600";
      }
      return (
        <span
          className={cn(
            "bg-opacity-90 rounded-full px-3 py-1 text-center text-xs font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl",
            gradientClass,
          )}
        >
          {dept}
        </span>
      );
    },
  }),
  helper.accessor("instructor", {
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
    cell: info => <span className="font-medium text-gray-600">{info.getValue()}</span>,
  }),
  helper.accessor(
    ({ days, start_time, end_time }) => ({ days, time: `${start_time} - ${end_time}` }),
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
        const { days, time } = info.getValue();
        return (
          <div className="text-sm">
            <div className="font-semibold text-gray-900">{days}</div>
            <div className="text-gray-500">{time}</div>
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
  helper.accessor("price_forecast", {
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
    cell: info => {
      const value = info.getValue();
      const formattedPrice = formatter.format(value);
      return <span className="text-lg font-bold text-red-500">{formattedPrice}</span>;
    },
  }),
];

interface FilterInputProps {
  column: Column<Course, unknown>;
}

function FilterInput({ column }: FilterInputProps) {
  const value = column.getFilterValue() ?? "";
  if (typeof value !== "string") throw new Error("unexpected filter value type");

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => column.setFilterValue(event.target.value),
    [column],
  );

  return <Input placeholder="Search..." value={value} onChange={handleChange} />;
}

interface CourseCatalogTableProps {
  initialPageSize?: number;
  courses: Course[];
}

export function CourseCatalogDataTable({ courses, initialPageSize = 20 }: CourseCatalogTableProps) {
  const table = useReactTable({
    columns,
    data: courses,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  const previousPage = useCallback(() => table.previousPage(), [table]);
  const nextPage = useCallback(() => table.nextPage(), [table]);

  const [selectedFilter, setSelectedFilter] = useState("course_id");
  const handleValueChange = useCallback(
    (value: string) => {
      setSelectedFilter(value);
      table.resetColumnFilters();
    },
    [table],
  );

  const downloadCsv = useCallback(() => {
    const { rows } = table.getFilteredRowModel();
    const csv = unparse(
      rows.map(({ original }) => original),
      {
        header: true,
        columns: [
          "course_id",
          "title",
          "department",
          "instructor",
          "days",
          "start_time",
          "end_time",
          "credits",
          "price_forecast",
        ],
      },
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "courses.csv";
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [table]);

  let filterColumn: Column<Course, unknown> | undefined;
  if (typeof selectedFilter !== "undefined") filterColumn = table.getColumn(selectedFilter);

  const rowModel = table.getRowModel();
  const pageCount = table.getPageCount();
  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        <Select value={selectedFilter} onValueChange={handleValueChange}>
          <SelectTrigger>
            <Search />
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="course_id">Course ID</SelectItem>
            <SelectItem value="title">Course Title</SelectItem>
          </SelectContent>
        </Select>
        {typeof filterColumn === "undefined" ? (
          <Input disabled placeholder="Search..." />
        ) : (
          <FilterInput column={filterColumn} />
        )}
        <Button type="button" size="icon" onClick={downloadCsv}>
          <Download className="size-4" />
          <span className="sr-only">Download CSV</span>
        </Button>
      </div>
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
          {rowModel.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex flex-col items-center space-y-2 p-4">
                  <BookOpen className="size-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">No courses found</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rowModel.rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageCount === 0 ? null : (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={previousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowBigLeft />
          </Button>
          <span className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={!table.getCanNextPage()}
          >
            <ArrowBigRight />
          </Button>
        </div>
      )}
    </div>
  );
}
