"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import SubtaskCard from "@/components/ui/SubtaskCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "todo" | "in_progress" | "review" | "done";
type SubtaskStatus = "todo" | "done";

export interface Subtask {
  id: string;
  title: string;
  status: SubtaskStatus;
}

export interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: string;
}

export interface TaskTag {
  tag: {
    id: string;
    name: string;
  };
  tagId: string;
  taskId: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

export interface ActivityLog {
  id: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignee: User;
  subtasks?: Subtask[];
  comments?: Comment[];
  tags?: TaskTag[];
  attachments?: Attachment[];
  activityLogs?: ActivityLog[];
}

export interface TaskPageProps {
  task: Task | null;
  attachments?: Attachment[];
  loading: boolean;
  newComment: string;
  setNewComment: (val: string) => void;
  addComment: () => void;
  updateStatus: (id: string, status: SubtaskStatus) => void;
  updateTaskField?: (field: keyof Task, value: any) => void | Promise<void>;
  handleFileUpload?: (e: ChangeEvent<HTMLInputElement>) => void;
  fileUploading?: boolean;
  role: "employee" | "team_lead" | "manager" | "admin";
}

export default function TaskPage({
  task,
  attachments,
  loading,
  newComment,
  setNewComment,
  addComment,
  updateStatus,
  updateTaskField,
  handleFileUpload,
  fileUploading,
  role,
}: TaskPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [attachment, setAttachments] = useState<Attachment[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!task?.id) return;
    const fetchAttachments = async () => {
      try {
        const res = await axios.get(`/api/attachments/task/${task.id}`);
        console.log(res.data.data);
        setAttachments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch attachments", err);
      }
    };
    fetchAttachments();
  }, [task?.id]);

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6 animate-pulse">
        {/* Title & Description skeleton */}
        <div>
          <div className="h-16 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-12 w-16 bg-gray-200 rounded-full" />
            ))}
        </div>

        {/* Comments skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-1/2 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
        </div>

        {/* Subtasks skeleton */}
        <div className="flex gap-3">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded" />
            ))}
        </div>

        {/* Attachments skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-1/4 bg-gray-200 rounded" />
          <div className="h-8 w-1/3 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!task) return <div>Task not found</div>;

  const subtasks = task.subtasks || [];
  const comments = task.comments || [];
  const activityLogs = task.activityLogs || [];
  const tags = task.tags || [];

  async function deleteTask() {
    if (!task?.id) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert("Task deleted successfully!");
        router.back();
      } else {
        alert(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Something went wrong!");
    }
  }

  const canEdit = role !== "employee";

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6 relative">
      {/* Task Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            {isEditing && canEdit ? (
              <>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => updateTaskField?.("title", e.target.value)}
                  className="border px-2 py-1 rounded w-full text-3xl font-extrabold"
                />
                <textarea
                  value={task.description || ""}
                  onChange={(e) =>
                    updateTaskField?.("description", e.target.value)
                  }
                  className="border px-2 py-1 rounded w-full"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      updateTaskField?.(
                        "priority",
                        e.target.value as TaskPriority
                      )
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTaskField?.("status", e.target.value as TaskStatus)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold text-orange-600">
                  {task.title}
                </h1>
                <p className="text-xl">
                  {task.description || "No description"}
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </>
            )}
          </div>
          <div>
            <p className="text-gray-500">
              Updated: {new Date(task.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <section className="flex gap-4 flex-wrap items-center">
        <h2 className="text-xl font-semibold">Tags</h2>
        {tags.length > 0 ? (
          tags.map((t) => (
            <span
              key={t.tag.id}
              className="px-2 py-1 bg-orange-200 rounded-full text-sm text-orange-600"
            >
              {t.tag.name || "Unnamed"}
            </span>
          ))
        ) : (
          <p className="text-gray-500 italic">No tags assigned</p>
        )}
      </section>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Comments</h2>
        <div className="py-4 px-6 border border-gray-400 rounded-2xl space-y-2">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="flex justify-between items-start">
                <div>
                  <strong className="text-md text-orange-600">
                    {c.author?.name}
                  </strong>
                  <p className="text-sm font-light">{c.content}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No comments yet</p>
          )}
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
            className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 transition"
          >
            Post
          </button>
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
                disabled={!canEdit}
              />
            ))
          ) : (
            <p className="text-gray-500 italic">No subtasks yet</p>
          )}
        </div>
      </section>

      {/* Attachments */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Attachments</h2>
        <ul>
          {attachment.map((att, index) => {
            if (!att.url) return null;

            const ext = att.filename.split(".").pop()?.toLowerCase();

            const isImage =
              att.fileType?.startsWith("image") ||
              ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext || "");
            const isVideo =
              att.fileType?.startsWith("video") ||
              ["mp4", "mov", "webm"].includes(ext || "");
            const isPDF = att.fileType === "application/pdf" || ext === "pdf";
            const isDocx =
              att.fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              ext === "docx";
            const isZip = att.fileType === "application/zip" || ext === "zip";

            return (
              <li
                key={`${att.id}-${index}`}
                className="mb-4 flex items-center space-x-4"
              >
                {/* IMAGE */}
                {isImage && (
                  <Image
                    src={att.url}
                    alt={att.filename || "image"}
                    width={128}
                    height={128}
                    className="object-contain border rounded"
                  />
                )}

                {/* VIDEO */}
                {isVideo && (
                  <video
                    src={att.url}
                    controls
                    className="w-64 h-auto border rounded"
                  />
                )}

                {/* PDF */}
                {isPDF && (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 underline"
                  >
                    {att.filename}
                  </a>
                )}

                {/* DOCX */}
                {isDocx && (
                  <a
                    href={att.url}
                    download
                    className="flex items-center gap-2 text-blue-600 underline"
                  >
                    {att.filename}
                  </a>
                )}

                {/* ZIP */}
                {isZip && (
                  <a
                    href={att.url}
                    download
                    className="flex items-center gap-2 text-blue-600 underline"
                  >
                    {att.filename}
                  </a>
                )}

                {/* OTHER FILE TYPES */}
                {!isImage && !isVideo && !isPDF && !isDocx && !isZip && (
                  <a
                    href={att.url}
                    download
                    className="flex items-center gap-2 text-blue-600 underline"
                  >
                    {att.filename}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        {handleFileUpload && (
          <div className="mt-2">
            <input type="file" onChange={handleFileUpload} />
            {fileUploading && <p>Uploading...</p>}
          </div>
        )}
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
          <p className="text-gray-500 italic">No activity logs yet</p>
        )}
      </section>

      {/* Edit & Delete Buttons */}
      {canEdit && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={deleteTask}
            className="px-5 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---
function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "bg-orange-200 text-orange-600";
    case "in_progress":
      return "bg-blue-200 text-blue-600";
    case "review":
      return "bg-yellow-200 text-yellow-600";
    case "done":
      return "bg-green-200 text-green-600";
    default:
      return "bg-gray-200 text-gray-600";
  }
}

function getPriorityColor(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "bg-red-200 text-red-600";
    case "medium":
      return "bg-yellow-200 text-yellow-600";
    case "low":
      return "bg-green-200 text-green-600";
    default:
      return "bg-gray-200 text-gray-600";
  }
}
