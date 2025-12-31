import { ReactNode } from "react";

interface OverviewCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  bgColor?: string;
  chipColor?: string;
  chiptextColor?: string;
  countColor?: string;
  subtextColor?: string;
}

export default function OverviewCard({
  title,
  value,
  description,
  icon,
  bgColor = "bg-white",
  chipColor = "bg-gray-200",
  chiptextColor = "text-gray-700",
  countColor = "text-black",
  subtextColor = "text-gray-600",
}: OverviewCardProps) {
  return (
    <div
      className={`p-4 w-full sm:min-w-60 rounded-xl shadow border border-gray-200 ${bgColor}
        flex flex-col gap-1 sm:gap-3`}
    >
      <div className="grid grid-cols-[6fr_1fr] gap-8 items-center">
        <div className="space-y-2">
          {/* Icon + Title chip */}
          <div
            className={`rounded-full px-2 py-1 sm:px-3 sm:py-2 inline-flex items-center sm:space-x-2 ${chipColor}
        w-fit max-w-full`}
          >
            <span className="shrink-0 scale-50 sm:scale-100">{icon}</span>
            <p
              className={`text-[10px] sm:text-sm font-medium ${chiptextColor} truncate`}
            >
              {title}
            </p>
          </div>
          {/* Subtext */}
          <p className={`text-sm sm:text-base font-light ${subtextColor}`}>
            {description}
          </p>
        </div>
        {/* Count / Value */}
        <p
          className={`text-2xl sm:text-4xl font-bold ${countColor} wrap-break-word leading-tight`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
