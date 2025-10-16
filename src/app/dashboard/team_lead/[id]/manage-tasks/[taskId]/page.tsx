"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskPage from "@/components/shared/TaskPage";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
}

interface Subtask {
  id: string;
  title: string;
  status: "todo" | "done";
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "review" | "done";
  dueDate?: string;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
}

export default function TeamLeadTaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [task, setTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        const data: Task = res.data.data || res.data;
        setTask(data);
        setAttachments(data.attachments || []);
      } catch (err) {
        console.error("Failed to fetch task:", err);
        toast?.error("Failed to fetch task data");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);
  useEffect(() => {
    if (!taskId) return;
    const socket = getSocket();

    socket.emit("join-task", taskId);

    socket.on("comment-added", (comment: Comment) => {
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev
      );
    });

    socket.on("subtask-updated", (subtask: Subtask) => {
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks.map((st) =>
                st.id === subtask.id ? subtask : st
              ),
            }
          : prev
      );
    });

    socket.on("attachment-added", (attachment: Attachment) => {
      setAttachments((prev) => [...prev, attachment]);
    });
  }, [taskId]);

  // --- Update Task Field ---
  const updateTaskField = async (field: keyof Task, value: any) => {
    if (!task) return;
    const oldTask = { ...task };
    setTask({ ...task, [field]: value }); // optimistic
    try {
      await axios.patch(`/api/tasks/${taskId}`, { [field]: value });
      toast?.success("Task updated successfully");
    } catch (err) {
      console.error("Failed to update task:", err);
      setTask(oldTask);
      toast?.error("Failed to update task");
    }
  };

  // --- Update Subtask ---
  const updateStatus = async (
    subtaskId: string,
    newStatus: "todo" | "done"
  ) => {
    if (!task) return;
    const oldSubtasks = [...task.subtasks];
    setTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, status: newStatus } : st
            ),
          }
        : prev
    );

    try {
      await axios.patch(`/api/subtasks/${subtaskId}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update subtask:", err);
      setTask((prev) => (prev ? { ...prev, subtasks: oldSubtasks } : prev));
      toast?.error("Failed to update subtask");
    }
  };

  // --- Add Comment ---
  const addComment = async () => {
    if (!newComment.trim() || !userId) return;
    const commentPayload = {
      content: newComment,
      authorId: userId,
      taskId,
    };
    try {
      const res = await axios.post("/api/comments/", commentPayload);
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, res.data.data] } : prev
      );
      setNewComment("");
      toast?.success("Comment added");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast?.error("Failed to add comment");
    }
  };

  // --- File Upload ---
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
      toast?.success("File uploaded");
    } catch (err) {
      console.error("Failed to upload file:", err);
      toast?.error("File upload failed");
    } finally {
      setFileUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <TaskPage
      task={task}
      attachments={attachments}
      loading={loading}
      newComment={newComment}
      setNewComment={setNewComment}
      addComment={addComment}
      updateStatus={updateStatus}
      updateTaskField={updateTaskField}
      handleFileUpload={handleFileUpload}
      fileUploading={fileUploading}
      role="team_lead"
    />
  );
}
