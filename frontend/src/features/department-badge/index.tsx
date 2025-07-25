import { cn } from "@/lib/utils";

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  let gradientClass: string;

  switch (department) {
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
        className,
      )}
    >
      {department}
    </span>
  );
}
