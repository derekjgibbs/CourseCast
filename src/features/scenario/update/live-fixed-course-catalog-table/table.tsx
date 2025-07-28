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
  getFilteredRowModel,
  type RowData,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import { type MouseEvent, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyToClipboardButton } from "@/features/copy-to-clipboard-button";
import type { Course } from "@/lib/schema/course";
import { DepartmentBadge } from "@/features/department-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    id: "remove",
    cell: function Cell({ table, row }) {
      const onRemove = table.options.meta?.onRemove;
      const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          if (typeof onRemove === "undefined") return;
          const id = event.currentTarget.dataset["id"];
          if (typeof id === "undefined") return;
          onRemove(id);
        },
        [onRemove],
      );
      return (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          data-id={row.original.forecast_id}
          onClick={handleClick}
        >
          <Trash2 />
        </Button>
      );
    },
  }),
  helper.accessor("section_code", {
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

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    name?: string;
    onRemove?: (id: string) => void;
  }
}

interface FixedCourseCatalogTableProps {
  name?: string;
  courses: Course[];
  onRemove: (id: string) => void;
}

export function FixedCourseCatalogTable({ name, courses, onRemove }: FixedCourseCatalogTableProps) {
  const table = useReactTable({
    columns,
    data: courses,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: { name, onRemove },
  });
  const { rows } = table.getRowModel();
  return (
    <>
      {typeof name === "undefined"
        ? null
        : rows.map(row => (
            <input
              key={row.original.forecast_id}
              type="hidden"
              name={name}
              value={row.original.forecast_id}
            />
          ))}
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
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex flex-col items-center space-y-2 p-4">
                  <BookOpen className="size-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    No fixed courses selected
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
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
    </>
  );
}
