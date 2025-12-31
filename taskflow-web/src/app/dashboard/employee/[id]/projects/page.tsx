"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "@/components/ui/ProjectCard";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  projectId: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  owner: { id: string; name: string };
  tasks?: Task[];
  progress?: number;
};

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectCode, setProjectCode] = useState("");
  const [error, setError] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const fetchProjects = async () => {
      const userId = session.user.id;
      try {
        const res = await axios.get(`/api/projects/user/${userId}`);

        if (res.data.success) {
          const data: Project[] = res.data.data || [];

          const processed = data.map((p) => {
            const done =
              p.tasks?.filter((t) => t.status === "done").length || 0;
            const total = p.tasks?.length || 0;
            const progress = total ? Math.round((done / total) * 100) : 0;

            return { ...p, progress };
          });

          setProjects(processed);
        }
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("project-created", (newProject: Project) => {
      setProjects((prev) =>
        prev.find((p) => p.id === newProject.id)
          ? prev
          : [...prev, { ...newProject, progress: 0 }]
      );
    });

    socket.on("project-updated", (updated: Project) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                ...updated,
                progress: calculateProgress(updated.tasks || []),
              }
            : p
        )
      );
    });

    socket.on("project-deleted", (deletedId: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== deletedId));
    });

    socket.on("task-updated", (task: Task) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== task.projectId) return p;

          const updatedTasks =
            p.tasks?.map((t) => (t.id === task.id ? task : t)) || [];

          return {
            ...p,
            tasks: updatedTasks,
            progress: calculateProgress(updatedTasks),
          };
        })
      );
    });
  }, []);

  const calculateProgress = (tasks: Task[]) => {
    const done = tasks.filter((t) => t.status === "done").length;
    return tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  };

  const handleProjectRequest = async () => {
    try {
      const res = await axios.post(`/api/joinRequests`, {
        projectId: projectCode,
        userId: session?.user.id,
      });

      if (res.data.success) {
        alert("Join request sent!");
        setProjectCode("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!session?.user) return <p>Loading...</p>;

  const userId = session.user.id;

  return (
    <main className="min-h-screen bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Project Overview</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Enter Project Code"
            className="border border-gray-300 rounded-xl px-3 py-2 w-full sm:w-64 text-sm"
          />

          <button
            onClick={handleProjectRequest}
            className="px-4 py-2 rounded-full bg-linear-to-r from-orange-500 to-orange-700 text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Request to Join
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center my-4 text-sm">{error}</p>
      )}

      {projects.length === 0 && !loading ? (
        <p className="text-gray-500 text-center">No projects found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array(6)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-48 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))
            : projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  projectId={project.id}
                  employeeId={userId}
                  name={project.name}
                  role="employee"
                  description={project.description}
                  owner={project.owner?.name || "N/A"}
                  status={
                    project.status === "active"
                      ? "Active"
                      : project.status === "archived"
                      ? "Archived"
                      : "Completed"
                  }
                  progress={project.progress || 0}
                />
              ))}
        </div>
      )}
    </main>
  );
}
