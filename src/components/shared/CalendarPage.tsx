"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasksOnDate, setTasksOnDate] = useState<Task[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user) return;
      const userId = session.user.id;

      try {
        const [userTasksRes, ownerTasksRes] = await Promise.allSettled([
          axios.get(`/api/tasks/user/${userId}`),
          axios.get(`/api/tasks/owner/${userId}`),
        ]);

        let combinedTasks: Task[] = [];

        if (userTasksRes.status === "fulfilled") {
          combinedTasks = [
            ...combinedTasks,
            ...(userTasksRes.value.data.data || userTasksRes.value.data),
          ];
        }
        if (ownerTasksRes.status === "fulfilled") {
          combinedTasks = [
            ...combinedTasks,
            ...(ownerTasksRes.value.data.data || ownerTasksRes.value.data),
          ];
        }

        setTasks(combinedTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [session]);

  const dueDates = tasks.map((task) => new Date(task.dueDate).toDateString());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const filtered = tasks.filter(
      (task) => new Date(task.dueDate).toDateString() === date.toDateString()
    );
    setTasksOnDate(filtered);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && dueDates.includes(date.toDateString())) {
      return (
        <div className="flex justify-center mt-1">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-2xl">
      <h1 className="text-2xl font-bold text-black">My Calendar</h1>

      <div className="w-full">
        <Calendar
          onClickDay={handleDateClick}
          tileContent={tileContent}
          className="rounded-xl shadow border border-gray-200 w-full"
        />
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-orange-600">
            Tasks due on {selectedDate.toDateString()}:
          </h2>
          {tasksOnDate.length > 0 ? (
            <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tasksOnDate.map((task) => (
                <li
                  key={task.id}
                  className="p-3 border border-gray-400 rounded-lg flex justify-between items-center"
                >
                  <span className="font-medium">{task.title}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === "high"
                        ? "bg-red-200 text-red-600"
                        : task.priority === "medium"
                        ? "bg-yellow-200 text-yellow-600"
                        : "bg-green-200 text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2 italic">No tasks due</p>
          )}
        </div>
      )}
    </div>
  );
}
