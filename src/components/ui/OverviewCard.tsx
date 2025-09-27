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
    <div className={`p-6 rounded-xl shadow border border-gray-200 ${bgColor}`}>
      <div
        className={`rounded-full px-3 py-2 inline-flex items-center space-x-2 ${chipColor}`}
      >
        {icon}
        <p className={`text-sm font-medium ${chiptextColor}`}>{title}</p>
      </div>

      <p className={`text-2xl font-bold ${countColor} mt-3`}>{value}</p>
      <p className={`text-sm font-light ${subtextColor}`}>{description}</p>
    </div>
  );
}
