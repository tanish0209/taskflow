// pages/dashboard/team_lead/[id]/manage-tasks/[taskId]/page.tsx
"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskPage from "@/components/shared/TaskPage";

export default function TeamLeadTaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [task, setTask] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        const data = res.data.data || res.data;
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

  // Update a task field (title, description, priority, status)
  const updateTaskField = async (field: string, value: any) => {
    if (!task) return;
    try {
      await axios.patch(`/api/tasks/${taskId}`, { [field]: value });
      setTask({ ...task, [field]: value });
    } catch (err) {
      console.error("Failed to update task field:", err);
    }
  };

  // Update subtask status
  const updateStatus = async (id: string, newStatus: "todo" | "done") => {
    try {
      await axios.patch(`/api/subtasks/${id}`, { status: newStatus });
      setTask((prev: any) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks.map((sub: any) =>
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
      setTask((prev: any) =>
        prev ? { ...prev, comments: [...prev.comments, res.data.data] } : prev
      );
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
