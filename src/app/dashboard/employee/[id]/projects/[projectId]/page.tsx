"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskCard from "@/components/ui/TaskCard";
import { getSocket } from "@/lib/socket";

interface TaskTag {
  id: string;
  name: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
}

interface User {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "review" | "done";
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  tags?: TaskTag[];
  attachments?: Attachment[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };
  const { data: session } = useSession();
  const employeeId = session?.user?.id || "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}`);
      const data = res.data.data || res.data;
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const socket = getSocket();
    socket.emit("join-project", projectId);
    socket.on("task-created", (newTask: Task) => {
      setProject((prev) =>
        prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : prev
      );
    });
    socket.on("task-updated", (updatedTask: Task) => {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: (prev.tasks || []).map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              ),
            }
          : prev
      );
    });

    socket.on("task-deleted", (deletedTaskId: string) => {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: (prev.tasks || []).filter(
                (task) => task.id !== deletedTaskId
              ),
            }
          : prev
      );
    });
  }, [projectId]);

  const skeletonProjectInfo = (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
    </div>
  );

  const skeletonTasks = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, idx) => (
          <div
            key={idx}
            className="h-32 bg-gray-200 rounded-xl animate-pulse"
          />
        ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
        {skeletonProjectInfo}
        <section>
          <h2 className="text-xl font-semibold mt-4">Tasks</h2>
          {skeletonTasks}
        </section>
      </div>
    );
  }

  if (!project)
    return (
      <div className="p-6 border border-gray-200 bg-white rounded-2xl">
        Project not found
      </div>
    );

  const tasks = project.tasks || [];

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
      {/* Project Info */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-orange-600">
          {project.name}
        </h1>
        <p className="text-lg sm:text-xl font-semibold">
          Description: {project.description || "No description"}
        </p>
        <p className="text-[10px] sm:text-sm text-gray-500">
          Created At: {new Date(project.createdAt).toLocaleString()}
        </p>
        <p className="text-[10px] sm:text-sm text-gray-500">
          Last Updated At: {new Date(project.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Project Tasks */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold my-4">Tasks</h2>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                taskId={task.id}
                title={task.title}
                projectName={project.name}
                dueDate={task.dueDate || task.createdAt}
                employeeId={employeeId}
                status={task.status}
                role="employee"
                priority={task.priority}
                taskLink={`/dashboard/employee/${employeeId}/tasks/${task.id}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No tasks added to this project yet
          </p>
        )}
      </section>
    </div>
  );
}
