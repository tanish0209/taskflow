"use client";

import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import TaskCard from "@/components/ui/TaskCard";
import { getSocket } from "@/lib/socket";

// --- Types ---
interface User {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  project: Project | null;
  assignee?: User | null;
  assigneeId?: string | null;
  ownerId?: string;
}

// API response type for project members
interface ProjectMember {
  user: User;
}

export default function TeamLeadManageTasksPage() {
  const [tasks, setTasks] = useState<(Task & { assigneeName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    assigneeId: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in_progress" | "review" | "done",
    description: "",
    tags: "",
    dueDate: "",
  });

  const [userProjects, setUserProjects] = useState<string[]>([]);

  // --- Fetch tasks and projects ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const session = await getSession();
        if (!session?.user) return;

        setUserId(session.user.id);

        // Fetch tasks
        const res = await axios.get(`/api/tasks/owner/${session.user.id}`);
        const data: Task[] = res.data?.data || [];

        const tasksWithNames = await Promise.all(
          data.map(async (task) => {
            if (task.assignee?.name)
              return { ...task, assigneeName: task.assignee.name };

            if (task.assigneeId) {
              try {
                const userRes = await axios.get<{ data: User }>(
                  `/api/users/${task.assigneeId}`
                );
                const user = userRes.data?.data;
                return { ...task, assigneeName: user?.name || "Unknown User" };
              } catch {
                return { ...task, assigneeName: "Unknown User" };
              }
            }

            return { ...task, assigneeName: "Unassigned" };
          })
        );

        setTasks(tasksWithNames);
        const projRes = await axios.get(
          `/api/projects/user/${session.user.id}`
        );
        const userProjectsData: Project[] = projRes.data?.data || [];
        setProjects(userProjectsData);
        setUserProjects(userProjectsData.map((p) => p.id));
      } catch (err) {
        console.error("Failed to fetch tasks/projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  useEffect(() => {
    if (!userId || userProjects.length === 0) return;

    const socket = getSocket();
    userProjects.forEach((projId) => socket.emit("join-project", projId));
    socket.on("task-created", (task: Task) => {
      if (task.ownerId === userId) {
        setTasks((prev) => [
          { ...task, assigneeName: task.assignee?.name || "Unassigned" },
          ...prev,
        ]);
      }
    });

    socket.on("task-updated", (task: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...task } : t))
      );
    });

    socket.on("task-deleted", (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });
  }, [userId, userProjects]);
  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (userId) {
        const res = await axios.get(`/api/tasks/owner/${userId}`);
        const data: Task[] = res.data?.data || [];
        const tasksWithNames = await Promise.all(
          data.map(async (task) => {
            if (task.assignee?.name)
              return { ...task, assigneeName: task.assignee.name };
            if (task.assigneeId) {
              try {
                const userRes = await axios.get<{ data: User }>(
                  `/api/users/${task.assigneeId}`
                );
                const user = userRes.data?.data;
                return { ...task, assigneeName: user?.name || "Unknown User" };
              } catch {
                return { ...task, assigneeName: "Unknown User" };
              }
            }
            return { ...task, assigneeName: "Unassigned" };
          })
        );
        setTasks(tasksWithNames);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  // --- Change task status ---
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
      console.error(err);
    }
  };

  // --- Handle project selection ---
  async function handleProjectChange(projectId: string) {
    setFormData((prev) => ({ ...prev, projectId, assigneeId: "" }));
    try {
      const res = await axios.get<{ data: ProjectMember[] }>(
        `/api/projectMembers/${projectId}`
      );
      const allMembers = res.data?.data || [];
      const filteredMembers: User[] = allMembers
        .filter((m) => m.user.id !== userId)
        .map((m) => ({ id: m.user.id, name: m.user.name }));
      setMembers(filteredMembers);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
      setMembers([]);
    }
  }

  // --- Add task ---
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    try {
      await axios.post(`/api/tasks`, {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        projectId: formData.projectId,
        assigneeId: formData.assigneeId,
        ownerId: userId,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      });

      setShowForm(false);
      setFormData({
        title: "",
        projectId: "",
        assigneeId: "",
        priority: "medium",
        status: "todo",
        description: "",
        tags: "",
        dueDate: "",
      });

      await handleRefresh();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Assigned Tasks</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col w-full bg-white p-6 rounded-xl border border-gray-200 animate-pulse"
              >
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="flex gap-2 mt-auto">
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
                <div className="mt-4 h-6 w-2/3 bg-gray-200 rounded self-center" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Assigned Tasks</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            {showForm ? "Cancel" : "Add Task"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 h-screen flex items-center justify-center bg-gray-400/80">
          <form
            onSubmit={handleAddTask}
            className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-lg"
          >
            {/* Form inputs here (same as before) */}
          </form>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">
          You have not assigned any tasks to employees yet.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col w-full bg-white p-6">
              <TaskCard
                taskId={task.id}
                title={task.title}
                projectName={task.project?.name || "No project"}
                dueDate={task.dueDate || ""}
                employeeId={userId || ""}
                status={task.status}
                priority={task.priority}
                role="team_lead"
                taskLink={`/dashboard/team_lead/${userId}/manage-tasks/${task.id}`}
              />
              <p className="mt-2 py-2 px-2 bg-white rounded-xl text-sm font-bold text-orange-600 border text-center border-gray-200">
                Assigned to:{" "}
                <span className="font-bold text-orange-600">
                  {task.assigneeName}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
