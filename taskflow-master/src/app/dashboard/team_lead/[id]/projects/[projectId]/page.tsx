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
  assignee: User;
  tags: TaskTag[];
  attachments: Attachment[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}
function ProjectInfoSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-300 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <div className="animate-pulse p-4 border border-gray-200 rounded-lg bg-white shadow">
      <div className="h-6 w-2/3 bg-gray-300 rounded mb-3"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();
  const userId = session?.user?.id || "";

  useEffect(() => {
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

    if (status === "authenticated") {
      fetchProject();
    }
  }, [projectId, status]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-project", projectId);
    socket.on("task-created", (task: Task) => {
      setProject((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, task] } : prev
      );
    });

    socket.on("task-updated", (updatedTask: Task) => {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === updatedTask.id ? updatedTask : t
              ),
            }
          : prev
      );
    });

    socket.on("task-deleted", (deletedId: string) => {
      setProject((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== deletedId) }
          : prev
      );
    });

    socket.on("project-updated", (updated: Project) => {
      if (updated.id === projectId) setProject(updated);
    });
  }, [projectId]);
  if (loading) {
    return (
      <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
        {/* Project Info Skeleton */}
        <ProjectInfoSkeleton />

        {/* Task Skeletons */}
        <h2 className="text-xl font-semibold mt-4">Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const { tasks, description } = project;

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
      {/* Project Info */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-orange-600">
          {project.name}
        </h1>
        <p className="text-xl font-semibold">
          Description: {description || "No description"}
        </p>
        <p className="text-gray-500">
          Created At: {new Date(project.createdAt).toLocaleString()}
        </p>
        <p className="text-gray-500">
          Updated At: {new Date(project.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Project Tasks */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Tasks</h2>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const taskLink = `/dashboard/team_lead/${userId}/manage-tasks/${task.id}`;

              return (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  projectName={project.name}
                  dueDate={task.dueDate || task.createdAt}
                  employeeId={task.assignee?.id || ""}
                  status={task.status}
                  role="team_lead"
                  taskLink={taskLink}
                  priority={task.priority}
                />
              );
            })}
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
