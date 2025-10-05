"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskCard from "@/components/ui/TaskCard";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  dueDate: string;
  projectId: string;
  priority: "low" | "medium" | "high";
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
  tasks?: Task[];
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: session } = useSession();

  const updateStatus = async (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: t.status } : t))
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user) return;
        const userId = session.user.id;

        const projectsRes = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = projectsRes.data.data || [];
        setProjects(projectsData);

        const tasksArr = projectsData.flatMap((project) => project.tasks || []);
        setTasks(tasksArr);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchData();
  }, [session]);

  if (!session?.user) return <p>Loading...</p>;
  const userId = session.user.id;

  return (
    <div className="p-6 space-y-8 border border-gray-200 bg-white rounded-2xl">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      {projects.map((project) => {
        const projectTasks = tasks.filter((t) => t.projectId === project.id);

        return (
          <div
            key={project.id}
            className="space-y-4 p-6 border border-gray-200 rounded-2xl "
          >
            <h2 className="text-2xl font-bold text-orange-600">
              Project: {project.name}
            </h2>

            <div className="flex flex-wrap gap-4">
              {projectTasks.length > 0 ? (
                projectTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    taskId={task.id}
                    title={task.title}
                    projectName={project.name}
                    dueDate={task.dueDate}
                    status={task.status}
                    priority={task.priority}
                    employeeId={userId}
                    onStatusChange={updateStatus}
                    role="employee"
                    taskLink={`/dashboard/employee/${userId}/tasks/${task.id}`}
                  />
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No tasks yet for this project
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
