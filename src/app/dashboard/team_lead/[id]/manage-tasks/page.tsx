"use client";

import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import TaskCard from "@/components/ui/TaskCard";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  project: { id: string; name: string } | null;
  assignee?: { id: string; name: string } | null;
  assigneeId?: string | null;
  ownerId?: string;
};

type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
};

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<(Task & { assigneeName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // For add task form
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    assigneeId: "",
    priority: "medium",
    status: "todo",
    description: "",
    tags: "",
  });

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  async function fetchAssignedTasks() {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      const res = await axios.get(`/api/tasks/owner/${session.user.id}`);
      const data: Task[] = res.data?.data || [];

      const tasksWithNames = await Promise.all(
        data.map(async (task) => {
          if (task.assignee?.name) {
            return { ...task, assigneeName: task.assignee.name };
          }

          if (task.assigneeId) {
            try {
              const userRes = await axios.get(`/api/users/${task.assigneeId}`);
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

      // fetch projects for dropdown
      const projRes = await axios.get(`/api/projects/user/${session.user.id}`);
      setProjects(projRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAssignedTasks();
    setRefreshing(false);
  }

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handle project change → load members
  async function handleProjectChange(projectId: string) {
    setFormData((prev) => ({ ...prev, projectId, assigneeId: "" }));
    try {
      const res = await axios.get(`/api/projectMembers/${projectId}`);
      const allMembers = res.data?.data || [];

      // Filter out the logged-in user
      const filteredMembers = allMembers
        .filter((m: any) => m.user.id !== userId)
        .map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
        }));

      setMembers(filteredMembers);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
      setMembers([]);
    }
  }

  // Handle task creation
  // Handle task creation
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
      });

      await fetchAssignedTasks();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading assigned tasks...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-2xl">
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
      {/* Add Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 h-screen flex items-center justify-center bg-gray-400/80">
          <form
            onSubmit={handleAddTask}
            className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-lg"
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
                  priority: e.target.value as any,
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
                  status: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

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
                onStatusChange={handleStatusChange}
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
