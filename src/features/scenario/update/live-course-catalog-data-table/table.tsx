"use client";
"use no memo"; // https://github.com/TanStack/table/issues/5567

import {
  ArrowBigLeft,
  ArrowBigRight,
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  BookmarkPlus,
  BookOpen,
  Building,
  ClipboardList,
  Clock,
  DollarSign,
  Download,
  HeartPlus,
  Pencil,
  Search,
  User,
} from "lucide-react";
import { type ChangeEvent, type MouseEvent, useCallback, useState } from "react";
import {
  type Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import { unparse } from "papaparse";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyToClipboardButton } from "@/features/copy-to-clipboard-button";
import type { Course } from "@/lib/schema/course";
import { DepartmentBadge } from "@/features/department-badge";
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

const helper = createColumnHelper<Course>();
const columns = [
  helper.display({
    id: "fixed",
    cell: function Cell({ table, row }) {
      const onFixedCourseAdd = table.options.meta?.onFixedCourseAdd;
      const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          if (typeof onFixedCourseAdd === "undefined") return;
          const id = event.currentTarget.dataset["id"];
          if (typeof id === "undefined") return;
          onFixedCourseAdd(id);
        },
        [onFixedCourseAdd],
      );
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-id={row.original.forecast_id}
              onClick={handleClick}
              className="border-0 bg-blue-800 text-blue-100 hover:bg-blue-900 hover:text-blue-50"
            >
              <BookmarkPlus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to Fixed Courses</TooltipContent>
        </Tooltip>
      );
    },
  }),
  helper.display({
    id: "selected",
    cell: function Cell({ table, row }) {
      const onCourseSelected = table.options.meta?.onCourseSelected;
      const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          if (typeof onCourseSelected === "undefined") return;
          const id = event.currentTarget.dataset["id"];
          if (typeof id === "undefined") return;
          onCourseSelected(id);
        },
        [onCourseSelected],
      );
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-id={row.original.forecast_id}
              onClick={handleClick}
              className="border-0 bg-pink-800 text-pink-100 hover:bg-pink-900 hover:text-pink-50"
            >
              <HeartPlus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to Selected Courses</TooltipContent>
        </Tooltip>
      );
    },
  }),
  helper.accessor("section_code", {
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
            <span>Section Code</span>
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
    ({ days_code, start_time, stop_time }) => ({
      days: days_code,
      time: `${start_time} - ${stop_time}`,
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

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onFixedCourseAdd?: (id: string) => void;
    onCourseSelected?: (id: string) => void;
  }
}

interface CourseCatalogTableProps {
  initialPageSize?: number;
  courses: Course[];
  onFixedCourseAdd: (course: string) => void;
  onCourseSelected: (course: string) => void;
}

export function CourseCatalogDataTable({
  courses,
  initialPageSize = 20,
  onFixedCourseAdd,
  onCourseSelected,
}: CourseCatalogTableProps) {
  const table = useReactTable({
    columns,
    data: courses,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: initialPageSize },
      sorting: [{ id: "title", desc: false }],
    },
    meta: { onFixedCourseAdd, onCourseSelected },
  });

  const previousPage = useCallback(() => table.previousPage(), [table]);
  const nextPage = useCallback(() => table.nextPage(), [table]);

  const [selectedFilter, setSelectedFilter] = useState("section_code");
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
          "forecast_id",
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
            <SelectItem value="section_code">Section Code</SelectItem>
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
