"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  taskId: string;
  title: string;
  projectName: string;
  dueDate: string;
  employeeId: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  role: "employee" | "team_lead" | "manager" | "admin";
  taskLink: string;
  onStatusChange?: (taskId: string, newStatus: TaskCardProps["status"]) => void;
}

function TaskCard({
  taskId,
  title,
  projectName,
  employeeId,
  dueDate,
  status,
  taskLink,
  priority,
  role,
  onStatusChange,
}: TaskCardProps) {
  const router = useRouter();

  const getStatusColor = () => {
    switch (status) {
      case "todo":
        return "bg-orange-200 text-orange-600";
      case "in_progress":
        return "bg-blue-200 text-blue-600";
      case "review":
        return "bg-yellow-200 text-yellow-600";
      case "done":
        return "bg-green-200 text-green-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "bg-red-200 text-red-600";
      case "medium":
        return "bg-yellow-200 text-yellow-600";
      case "low":
        return "bg-green-200 text-green-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="p-6 rounded-xl shadow hover:shadow-md transition border border-gray-200 bg-white cursor-pointer">
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 ${getStatusColor()}`}
      >
        <p className="text-sm font-medium">
          {status === "done"
            ? "Done"
            : status === "in_progress"
            ? "In Progress"
            : status === "review"
            ? "Review"
            : "Todo"}
        </p>
      </div>

      <div
        className={`inline-flex items-center rounded-full px-3 py-1 mx-2 ${getPriorityColor()}`}
      >
        <p className="text-sm font-medium">
          {priority === "high" ? "High" : priority === "low" ? "Low" : "Medium"}
        </p>
      </div>

      <h3 className="text-lg font-bold mt-3 text-black">{title}</h3>
      <p className="text-sm text-gray-500 font-medium">
        Project: {projectName}
      </p>

      <hr className="my-2 text-gray-200" />

      <p className="text-sm font-medium text-gray-800">
        Due: {new Date(dueDate).toLocaleDateString()}
      </p>

      {/* 👇 Role-based condition */}
      {role === "employee" && onStatusChange && (
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(taskId, e.target.value as TaskCardProps["status"])
          }
          className="mt-3 w-full border border-gray-300 hover:bg-gray-100 duration-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      )}
      <button
        onClick={() => router.push(taskLink)}
        className="px-3 py-2 mt-3 w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
      >
        Go to Task
      </button>
    </div>
  );
}

export default TaskCard;
