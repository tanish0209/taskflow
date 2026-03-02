"use client";

type SegmentedProgressProps = {
  value: number;
  segments?: number;
};

export default function SegmentedProgress({
  value,
  segments = 30,
}: SegmentedProgressProps) {
  const activeSegments = Math.round((value / 100) * segments);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Bar */}
      <div className="flex gap-[2px] sm:gap-1 flex-1 min-w-0 overflow-hidden">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-5 sm:h-6 w-2 rounded-full transition-colors
              ${i < activeSegments ? "bg-orange-500" : "bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Percentage */}
      <span className="text-xs sm:text-[14px] text-black whitespace-nowrap">
        {value}% Completed
      </span>
    </div>
  );
}
