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
import { type MouseEvent, useCallback } from "react";
import {
  type RowData,
  type SortDirection,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { CONSTRAINTS, type CourseDoc, type CourseId } from "@/convex/types";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  | "_id"
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
  helper.display({
    id: "remove",
    cell: function Cell({ table, row }) {
      const onRemove = table.options.meta?.onRemove;
      const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
          if (typeof onRemove === "undefined") return;
          const id = event.currentTarget.dataset["id"];
          if (typeof id === "undefined") return;
          onRemove(id as CourseId);
        },
        [onRemove],
      );
      return (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          data-id={row.original._id}
          onClick={handleClick}
        >
          <Trash2 />
        </Button>
      );
    },
  }),
  helper.display({
    id: "utility",
    cell: () => (
      <Input
        type="number"
        required
        min={CONSTRAINTS.COURSE_UTILITY.MIN_VALUE.toString()}
        max={CONSTRAINTS.COURSE_UTILITY.MAX_VALUE.toString()}
        step={1}
        defaultValue={0}
      />
    ),
  }),
  helper.accessor("course_id", {
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
    cell: info => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
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

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onRemove: (id: CourseId) => void;
  }
}

interface CourseUtilityTableProps {
  courses: Course[];
  onRemove: (id: CourseId) => void;
}

export function CourseUtilityTable({ courses, onRemove }: CourseUtilityTableProps) {
  const table = useReactTable({
    columns,
    data: courses,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: { onRemove },
  });
  const rowModel = table.getRowModel();
  return (
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
                <span className="text-sm font-medium text-gray-600">No classes selected</span>
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
  );
}
