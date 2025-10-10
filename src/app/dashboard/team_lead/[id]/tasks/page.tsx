"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskCard from "@/components/ui/TaskCard";
import { useSession } from "next-auth/react";

interface Task {
  id: string;
  title: string;
  project: { name: string };
  dueDate: string;
  employee: { id: string };
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
}

export default function TeamLeadTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchTasks() {
      try {
        if (!session?.user) return;
        const userId = session.user.id;
        const res = await axios.get(`/api/tasks/user/${userId}`);
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [session]);

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="h-40 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p className="text-center py-10 text-gray-500">No tasks found.</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          taskId={task.id}
          title={task.title}
          projectName={task.project.name}
          employeeId={task.employee.id}
          dueDate={task.dueDate}
          status={task.status}
          priority={task.priority}
          role="team_lead"
          taskLink={`/dashboard/team_lead/${task.employee.id}/task/${task.id}`}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
