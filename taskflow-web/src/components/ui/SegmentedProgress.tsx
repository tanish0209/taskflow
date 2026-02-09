"use client";

type SegmentedProgressProps = {
  value: number;
  segments?: number;
};

export default function SegmentedProgress({
  value,
  segments = 40,
}: SegmentedProgressProps) {
  const activeSegments = Math.round((value / 100) * segments);

  return (
    <div className="flex items-center gap-4">
      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-6 w-2 rounded-full transition-colors
              ${i < activeSegments ? "bg-orange-500" : "bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Percentage */}
      <span className="text-[14px] text-black">{value}% Completed</span>
    </div>
  );
}
