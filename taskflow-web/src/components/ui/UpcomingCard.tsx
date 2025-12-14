import React from "react";

interface UpcomingCardProps {
  chiptext: string;
  statuschiptext: string;
  title: string;
  dueDate: string;
  statuschipColor?: string;
  bgColor?: string;
  chipColor?: string;
  chiptextColor?: string;
  statuschiptextColor?: string;
}

function UpcomingCard({
  chiptext,
  title,
  dueDate,
  statuschiptext,
  bgColor = "bg-white",
  statuschipColor = "bg-gray-200",
  chipColor = "bg-gray-200",
  chiptextColor = "text-gray-600",
  statuschiptextColor = "text-gray-600",
}: UpcomingCardProps) {
  return (
    <div
      className={`py-3 sm:py-6 px-4 rounded-xl max-w-60 min-w-50 shadow border border-gray-200 hover:shadow-md transition ${bgColor}`}
    >
      <div
        className={`rounded-full px-3 py-1  inline-flex items-center ${statuschipColor}`}
      >
        <p
          className={`text-[10px] sm:text-sm font-medium ${statuschiptextColor}`}
        >
          {statuschiptext}
        </p>
      </div>
      <div
        className={`rounded-full px-3 py-1 mx-2 inline-flex items-center ${chipColor}`}
      >
        <p className={`text-[10px] sm:text-sm font-medium ${chiptextColor}`}>
          {chiptext}
        </p>
      </div>

      <h3 className="text-sm md:text-lg font-bold text-black mt-3 line-clamp-1 break-words">
        {title}
      </h3>
      <hr className="text-gray-200 my-2" />
      <p className={`text-xs md:text-sm  font-medium text-gray-800`}>
        Due: {dueDate}
      </p>
    </div>
  );
}

export default UpcomingCard;
