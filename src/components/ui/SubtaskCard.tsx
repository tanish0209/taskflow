import React from "react";
interface SubtaskCardProps {
  id: string;
  title: string;
  status: "todo" | "done";
  disabled?: boolean;
  onStatusChange: (id: string, newStatus: SubtaskCardProps["status"]) => void;
}
function SubtaskCard({ id, title, status, onStatusChange }: SubtaskCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "todo":
        return "bg-orange-200 text-orange-600";
      case "done":
        return "bg-green-200 text-green-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };
  return (
    <div className="p-3 sm:p-6 rounded-xl shadow hover:shadow-md transition border border-gray-200 bg-white max-w-xs cursor-pointer">
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 ${getStatusColor()}`}
      >
        <p className="text-[10px] sm:text-sm font-medium">
          {status === "done" ? "Done" : "Todo"}
        </p>
      </div>
      <h3 className="text-sm sm:text-lg font-bold mt-3 text-black">{title}</h3>

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(id, e.target.value as SubtaskCardProps["status"])
        }
        className="mt-3 w-full border border-gray-300 hover:bg-gray-100 duration-300 rounded-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="todo">Todo</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}

export default SubtaskCard;
