"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  role: "manager" | "employee" | "team_lead" | "admin";
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

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { data: session, status } = useSession();
  const userId = session?.user?.id || "";
  const userRole = session?.user?.role;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/projects/${projectId}`);
        const data = res.data.data || res.data;
        setProject(data);
        setFormData({ name: data.name, description: data.description || "" });
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") fetchProject();
  }, [projectId, status]);
  useEffect(() => {
    if (!userId) return;

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

    socket.on("task-deleted", (deletedTaskId: string) => {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((t) => t.id !== deletedTaskId),
            }
          : prev
      );
    });
  }, [projectId, userId]);
  const handleEditToggle = () => setEditMode((prev) => !prev);

  const handleSave = async () => {
    if (!project) return;
    try {
      const res = await axios.patch(`/api/projects/${project.id}`, formData);
      setProject(res.data.data || res.data);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`/api/projects/${project.id}`);
      router.back();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg bg-gray-100 space-y-2"
            >
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const { tasks } = project;

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
      {/* Project Info */}
      <div className="space-y-2">
        {editMode ? (
          <div className="space-y-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save
              </button>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 md:space-y-0 md:flex justify-between">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-orange-600">
                {project.name}
              </h1>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-xs md:text-base bg-orange-600 text-white rounded-full hover:bg-orange-700"
              >
                Edit Project
              </button>
            </div>
            <p className="text-sm md:text-xl font-semibold">
              Description: {project.description || "No description"}
            </p>
            <p className="text-xs md:text-base text-gray-500">
              Created At: {new Date(project.createdAt).toLocaleString()}
            </p>
            <p className="text-xs md:text-base text-gray-500">
              Updated At: {new Date(project.updatedAt).toLocaleString()}
            </p>
          </>
        )}
      </div>

      {/* Project Tasks */}
      <section>
        <h2 className="text-sm md:text-xl font-semibold mt-4">Tasks</h2>
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
      <div className="flex justify-center">
        <button
          onClick={handleDelete}
          className="px-4 py-2 mt-5 bg-orange-600 w-full max-w-lg text-white rounded-full hover:bg-orange-700"
        >
          Delete Project
        </button>
      </div>
    </div>
  );
}
