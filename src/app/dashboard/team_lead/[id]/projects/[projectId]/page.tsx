"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react"; // 👈 to get logged in team lead
import TaskCard from "@/components/ui/TaskCard";

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
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();
  const userId = session?.user?.id || "";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/projects/${projectId}`);
        const data = res.data.data || res.data;
        setProject(data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProject();
    }
  }, [projectId, status]);

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  const { tasks, description } = project;

  return (
    <div className="p-6 border border-gray-200 bg-white rounded-2xl space-y-6">
      {/* Project Info */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-orange-600">
          {project.name}
        </h1>
        <p className="text-xl font-semibold">
          Description: {description || "No description"}
        </p>
        <p className="text-gray-500">
          Created At: {new Date(project.createdAt).toLocaleString()}
        </p>
        <p className="text-gray-500">
          Updated At: {new Date(project.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Project Tasks */}
      <section>
        <h2 className="text-xl font-semibold mt-4">Tasks</h2>
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
    </div>
  );
}
