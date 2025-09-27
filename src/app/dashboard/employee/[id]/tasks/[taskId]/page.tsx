"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import SubtaskCard from "@/components/ui/SubtaskCard";

type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "todo" | "in_progress" | "review" | "done";
type SubtaskStatus = "todo" | "done";

interface Subtask {
  id: string;
  title: string;
  status: SubtaskStatus;
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: string;
}

interface TaskTag {
  id: string;
  name: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
}

interface ActivityLog {
  id: string;
  description: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface Task {
  taskId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignee: User;
  subtasks: Subtask[];
  comments: Comment[];
  tags: TaskTag[];
  attachments: Attachment[];
  activityLogs: ActivityLog[];
}

export default function TaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileUploading, setFileUploading] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        const data = res.data.data || res.data;

        setTask({
          ...data,
          subtasks: data.subtasks || [],
          comments: data.comments || [],
          tags: data.tags || [],
          attachments: data.attachments || [],
          activityLogs: data.activityLogs || [],
        });

        setAttachments(data.attachments || []);
      } catch (err) {
        console.error("Failed to fetch task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, session]);

  const updateStatus = async (id: string, newStatus: "todo" | "done") => {
    try {
      const res = await axios.patch(`/api/subtasks/${id}`, {
        status: newStatus,
      });
      setTask((prev) => {
        if (!prev) return prev;
        const updatedSubtasks = prev.subtasks.map((sub) =>
          sub.id === id ? { ...sub, status: newStatus } : sub
        );
        return { ...prev, subtasks: updatedSubtasks };
      });
    } catch (err) {
      console.error("Failed to update subtask status:", err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !userId) return;
    try {
      const res = await axios.post(`/api/comments/`, {
        content: newComment,
        authorId: userId,
        taskId,
      });
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, res.data.data] } : prev
      );
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`/api/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAttachments((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setFileUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (loading) return <div>Loading task details...</div>;
  if (!task) return <div>Task not found</div>;

  const { subtasks, comments, activityLogs } = task;

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold text-orange-600">
              Title: {task.title}
            </h1>
            <div className="flex gap-4">
              <span
                className={`px-3 py-1 rounded-full ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority === "high"
                  ? "High"
                  : task.priority === "low"
                  ? "Low"
                  : "Medium"}
              </span>
              <span
                className={`px-3 py-1 rounded-full ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status === "done"
                  ? "Done"
                  : task.status === "in_progress"
                  ? "In Progress"
                  : task.status === "review"
                  ? "Review"
                  : "Todo"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xl font-semibold">
          Description: {task.description || "No description"}
        </p>
        <p className="text-xl font-bold">
          Project: {task.project?.name || "N/A"}
        </p>
        <p className="text-gray-500">
          Updated At: {new Date(task.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Tags */}
      <section className="flex gap-4">
        <h2 className="text-xl font-semibold">Tags</h2>
        <div className="flex gap-2 flex-wrap items-center">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-orange-200 rounded-full text-sm text-orange-600"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </section>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Comments</h2>
        <div className="py-4 px-6 border border-gray-400 rounded-2xl">
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                <div className="flex space-x-4">
                  <strong className="text-md text-orange-600">
                    {c.author?.name}
                  </strong>
                  <p className="text-sm font-light">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mb-3">{c.content}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add comment"
            className="border border-gray-400 px-2 py-1 flex-1 rounded-2xl"
          />
          <button
            onClick={addComment}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 transition duration-300"
          >
            Post
          </button>
        </div>
      </section>

      {/* Attachments */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Attachments</h2>
        <ul>
          {attachments.map((att) => (
            <li key={att.id}>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {att.filename}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <input type="file" onChange={handleFileUpload} />
          {fileUploading && <p>Uploading...</p>}
        </div>
      </section>

      {/* Subtasks */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Subtasks</h2>
        <div className="flex flex-wrap gap-4">
          {subtasks.length > 0 ? (
            subtasks.map((sub) => (
              <SubtaskCard
                key={sub.id}
                id={sub.id}
                title={sub.title}
                status={sub.status}
                onStatusChange={updateStatus}
              />
            ))
          ) : (
            <p className="text-gray-500 italic">
              No subtasks yet for this project
            </p>
          )}
        </div>
      </section>

      {/* Activity Logs */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Activity Logs</h2>
        {activityLogs.length > 0 ? (
          <ul>
            {activityLogs.map((log) => (
              <li key={log.id}>
                {log.description} - {new Date(log.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity logs</p>
        )}
      </section>
    </div>
  );
}

// Helpers
function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "bg-orange-200 text-orange-600 px-2 py-1 rounded-full";
    case "in_progress":
      return "bg-blue-200 text-blue-600 px-2 py-1 rounded-full";
    case "review":
      return "bg-yellow-200 text-yellow-600 px-2 py-1 rounded-full";
    case "done":
      return "bg-green-200 text-green-600 px-2 py-1 rounded-full";
    default:
      return "bg-gray-200 text-gray-600 px-2 py-1 rounded-full";
  }
}

function getPriorityColor(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "bg-red-200 text-red-600 px-2 py-1 rounded-full";
    case "medium":
      return "bg-yellow-200 text-yellow-600 px-2 py-1 rounded-full";
    case "low":
      return "bg-green-200 text-green-600 px-2 py-1 rounded-full";
    default:
      return "bg-gray-200 text-gray-600 px-2 py-1 rounded-full";
  }
}
