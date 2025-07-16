"use client";

import {
  ArrowBigLeft,
  ArrowBigRight,
  BookOpen,
  Building,
  ClipboardList,
  Clock,
  DollarSign,
  Pencil,
  User,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { CourseDoc } from "@/convex/types";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type Course = Pick<
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
    header: () => (
      <div className="flex items-center space-x-2">
        <BookOpen className="size-4" />
        <span>Course ID</span>
      </div>
    ),
    cell: info => <span className="text-sm font-medium text-gray-600">{info.getValue()}</span>,
  }),
  helper.accessor("title", {
    header: () => (
      <div className="flex items-center space-x-2">
        <Pencil className="size-4" />
        <span>Title</span>
      </div>
    ),
    cell: info => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
  }),
  helper.accessor("department", {
    header: () => (
      <div className="flex items-center space-x-2">
        <Building className="size-4" />
        <span>Department</span>
      </div>
    ),
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
    header: () => (
      <div className="flex items-center space-x-2">
        <User className="size-4" />
        <span>Instructor</span>
      </div>
    ),
    cell: info => <span className="font-medium text-gray-600">{info.getValue()}</span>,
  }),
  helper.accessor(
    ({ days, start_time, end_time }) => ({ days, time: `${start_time} - ${end_time}` }),
    {
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
    header: () => (
      <div className="flex items-center space-x-2">
        <ClipboardList className="size-4" />
        <span>Credits</span>
      </div>
    ),
    cell: info => <span className="text-lg font-bold text-green-600">{info.getValue()}</span>,
    sortingFn: "basic",
  }),
  helper.accessor("price_forecast", {
    header: () => (
      <div className="flex items-center space-x-2">
        <DollarSign className="size-4" />
        <span>Price Forecast</span>
      </div>
    ),
    cell: info => {
      const value = info.getValue();
      const formattedPrice = formatter.format(value);
      return <span className="text-lg font-bold text-red-500">{formattedPrice}</span>;
    },
    sortingFn: "basic",
  }),
];

interface CourseCatalogTableProps {
  courses: Course[];
}

export function CourseCatalogDataTable({ courses }: CourseCatalogTableProps) {
  const table = useReactTable({
    data: courses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });
  const rowModel = table.getRowModel();
  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id}>
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
        <TableBody>
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
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
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
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ArrowBigRight />
        </Button>
      </div>
    </div>
  );
}
