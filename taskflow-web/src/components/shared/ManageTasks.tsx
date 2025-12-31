"use client";

import React, { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import axios from "axios";
import TaskCard from "@/components/ui/TaskCard";
import { getSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  role: "employee" | "manager" | "team_lead" | "admin";
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

interface ProjectMember {
  user: User;
}

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<(Task & { assigneeName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const session = useSession();
  const userRole = session?.data?.user.role;

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const session = await getSession();
        if (!session?.user) return;

        setUserId(session.user.id);

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

  async function handleProjectChange(projectId: string) {
    setFormData((prev) => ({ ...prev, projectId, assigneeId: "" }));

    try {
      const res = await axios.get<{ data: ProjectMember[] }>(
        `/api/projectMembers/${projectId}`
      );

      const allMembers = res.data?.data || [];

      const filteredMembers: User[] = allMembers
        .filter((m) => m.user.id !== userId)
        .map((m) => ({ id: m.user.id, name: m.user.name, role: m.user.role }));

      setMembers(filteredMembers);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
      setMembers([]);
    }
  }

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
          ? new Date(formData.dueDate).toString()
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
        <h1 className="text-lg md:text-xl font-bold mb-6">
          Manage Assigned Tasks
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8)
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-8 border border-gray-200 bg-white rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row mb-6 md:mb-0 gap-3 md:items-center md:justify-between">
        <h1 className="text-lg sm:text-2xl font-bold">Manage Assigned Tasks</h1>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-0 md:mb-8">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-2 rounded-full text-sm md:text-base bg-orange-500 text-white hover:bg-orange-600"
          >
            {showForm ? "Cancel" : "Add Task"}
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-full text-sm md:text-base bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 h-screen flex items-center justify-center bg-gray-400/80 px-3">
          <form
            onSubmit={handleAddTask}
            className="w-full max-w-md sm:max-w-lg p-4 sm:p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-lg"
          >
            <h2 className="text-xl font-bold text-center">Add New Task</h2>

            <input
              type="text"
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <select
              value={formData.projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {formData.projectId && (
              <select
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigneeId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded"
              >
                <option value="">Assign to</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as "low" | "medium" | "high",
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as
                    | "todo"
                    | "in_progress"
                    | "review"
                    | "done",
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
              >
                Assign Task
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">
          You have not assigned any tasks to employees yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col ">
              <TaskCard
                taskId={task.id}
                title={task.title}
                projectName={task.project?.name || "No project"}
                dueDate={task.dueDate || ""}
                employeeId={userId || ""}
                status={task.status}
                priority={task.priority}
                role={userRole}
                taskLink={`/dashboard/${userRole}/${userId}/manage-tasks/${task.id}`}
              />

              <p className="mt-2 max-w-80 py-2 px-2 bg-white rounded-xl text-sm font-bold text-orange-600 border text-center border-gray-200">
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
