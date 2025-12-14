"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskPage from "@/components/shared/TaskPage";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export default function ManagerTaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [task, setTask] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
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

  useEffect(() => {
    const socket: Socket = getSocket();

    const onConnect = () => {
      setIsSocketConnected(true);
      socket.emit("join-task", taskId);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleTaskUpdated = (updatedTask: any) => {
      if (updatedTask.id === taskId) {
        setTask(updatedTask);
      }
    };

    const handleSubtaskUpdated = (updatedSubtask: any) => {
      setTask((prev: any) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks?.map((sub: any) =>
                sub.id === updatedSubtask.id ? updatedSubtask : sub
              ),
            }
          : prev
      );
    };

    const handleCommentCreated = (comment: any) => {
      setTask((prev: any) => {
        if (!prev) return prev;
        if (prev.comments?.some((c: any) => c.id === comment.id)) {
          return prev;
        }

        console.log("✅ Adding new comment to state");
        return {
          ...prev,
          comments: [...(prev.comments || []), comment],
        };
      });
    };

    const handleCommentUpdated = (comment: any) => {
      setTask((prev: any) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.map((c: any) =>
                c.id === comment.id ? comment : c
              ),
            }
          : prev
      );
    };

    const handleCommentDeleted = ({ id }: { id: string }) => {
      setTask((prev: any) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.filter((c: any) => c.id !== id),
            }
          : prev
      );
    };

    const handleAttachmentCreated = (attachment: any) => {
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

  const updateTaskField = async (field: string, value: any) => {
    if (!task) return;
    try {
      await axios.patch(`/api/tasks/${taskId}`, { [field]: value });
      setTask({ ...task, [field]: value });
    } catch (err) {
      console.error("Failed to update task field:", err);
    }
  };

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
  const addComment = async () => {
    if (!newComment.trim() || !userId) return;
    try {
      await axios.post("/api/comments/", {
        content: newComment,
        authorId: userId,
        taskId,
      });
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
      const file = e.target.files?.[0];
      if (!file) return;

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
      console.error("Failed to upload file:", err);
    } finally {
      setFileUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div>
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
        role="manager"
      />
    </div>
  );
}
