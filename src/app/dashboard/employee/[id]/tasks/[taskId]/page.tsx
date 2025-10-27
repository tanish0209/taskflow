"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskPage from "@/components/shared/TaskPage";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

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
  tag: {
    id: string;
    name: string;
  };
  tagId: string;
  taskId: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
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
  id: string;
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
  subtasks?: Subtask[];
  comments?: Comment[];
  tags?: TaskTag[];
  attachments?: Attachment[];
  activityLogs?: ActivityLog[];
}

export default function EmployeeTaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [task, setTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        const data: Task = res.data.data || res.data;
        setTask(data);
        setAttachments(data.attachments || []);
      } catch (err) {
        console.error("Failed to fetch task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);
  useEffect(() => {
    const socket: Socket = getSocket();

    const onConnect = () => {
      setIsSocketConnected(true);
      socket.emit("join-task", taskId);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      if (updatedTask.id === taskId) {
        setTask(updatedTask);
      }
    };

    const handleSubtaskUpdated = (updatedSubtask: Subtask) => {
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks?.map((s) =>
                s.id === updatedSubtask.id ? updatedSubtask : s
              ),
            }
          : prev
      );
    };

    const handleCommentCreated = (comment: Comment) => {
      setTask((prev) => {
        if (!prev) return prev;
        if (prev.comments?.some((c) => c.id === comment.id)) {
          return prev;
        }
        return {
          ...prev,
          comments: [...(prev.comments || []), comment],
        };
      });
    };

    const handleCommentUpdated = (comment: Comment) => {
      setTask((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.map((c) =>
                c.id === comment.id ? comment : c
              ),
            }
          : prev
      );
    };

    const handleCommentDeleted = ({ id }: { id: string }) => {
      setTask((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.filter((c) => c.id !== id),
            }
          : prev
      );
    };

    const handleAttachmentCreated = (attachment: Attachment) => {
      setAttachments((prev) => {
        if (prev.some((a) => a.id === attachment.id)) {
          return prev;
        }
        return [...prev, attachment];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("subtask-updated", handleSubtaskUpdated);
    socket.on("comment-created", handleCommentCreated);
    socket.on("comment-updated", handleCommentUpdated);
    socket.on("comment-deleted", handleCommentDeleted);
    socket.on("attachment-created", handleAttachmentCreated);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("subtask-updated", handleSubtaskUpdated);
      socket.off("comment-created", handleCommentCreated);
      socket.off("comment-updated", handleCommentUpdated);
      socket.off("comment-deleted", handleCommentDeleted);
      socket.off("attachment-created", handleAttachmentCreated);

      socket.emit("leave-task", taskId);
      console.log(`🔌 Left task room: task_${taskId}`);
    };
  }, [taskId]);
  const updateStatus = async (id: string, newStatus: SubtaskStatus) => {
    if (!task?.subtasks) return;
    try {
      await axios.patch(`/api/subtasks/${id}`, { status: newStatus });
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: (prev.subtasks || []).map((sub) =>
                sub.id === id ? { ...sub, status: newStatus } : sub
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to update subtask:", err);
    }
  };

  // Add a comment
  const addComment = async () => {
    if (!newComment.trim() || !userId) return;
    try {
      const res = await axios.post("/api/comments/", {
        content: newComment,
        authorId: userId,
        taskId,
      });
      const newCommentData: Comment = res.data.data;

      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // File upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);
      formData.append("fileType", file.type);
      formData.append("filename", file.name);
      formData.append("uploadedBy", session?.user.id || "");

      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAttachments((prev) => [...prev, data.data]);
      }
    } catch (err) {
    } finally {
      setFileUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-4 w-full bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-40 w-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Connection indicator */}
      <div className="mb-2 text-right">
        {isSocketConnected ? (
          <span className="text-green-600 text-xs">🟢 Live</span>
        ) : (
          <span className="text-gray-400 text-xs">🔴 Connecting...</span>
        )}
      </div>

      <TaskPage
        task={task}
        attachments={attachments}
        loading={loading}
        newComment={newComment}
        setNewComment={setNewComment}
        addComment={addComment}
        updateStatus={updateStatus}
        handleFileUpload={handleFileUpload}
        fileUploading={fileUploading}
        role="employee"
      />
    </div>
  );
}
