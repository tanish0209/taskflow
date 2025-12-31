"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import axios from "axios";
import ProjectCard from "@/components/ui/ProjectCard";
import { getSocket } from "@/lib/socket";

type Task = {
  id: string;
  status: "todo" | "in_progress" | "review" | "done";
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  tasks: Task[];
};

// 🔹 Skeleton card component
function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse p-4 border border-gray-200 rounded-lg shadow bg-white">
      <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectCode, setProjectCode] = useState("");
  const { data: session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = res.data.data || [];
        setProjects(projectsData);

        const socket = getSocket();
        socket.emit("register-user", userId);
        socket.on("project-created", (newProject: Project) => {
          if (newProject.owner.id === userId) {
            setProjects((prev) => [...prev, newProject]);
          }
        });
        socket.on("project-updated", (updatedProject: Project) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
          );
        });
        socket.on("project-deleted", (deletedProjectId: string) => {
          setProjects((prev) => prev.filter((p) => p.id !== deletedProjectId));
        });
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);
  const handleProjectRequest = async () => {
    try {
      const res = await axios.post(`/api/joinRequests`, {
        projectId: projectCode,
        userId: userId,
      });

      if (res.data.success) {
        window.postMessage("Join request sent successfully!");
        setProjectCode("");
      } else {
        window.Error(res.data.message || "Failed to send request");
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-white rounded-2xl border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Project Overview</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Enter Project Id to Join"
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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found.</p>
        ) : (
          projects.map((project) => {
            const completedTasks = project.tasks.filter(
              (t) => t.status === "done"
            ).length;
            const progress =
              project.tasks.length > 0
                ? Math.round((completedTasks / project.tasks.length) * 100)
                : 0;

            return (
              <ProjectCard
                key={project.id}
                name={project.name}
                description={project.description || "No description provided"}
                status={
                  project.status === "completed"
                    ? "Completed"
                    : project.status === "active"
                    ? "Active"
                    : "Archived"
                }
                employeeId={project.owner.id}
                role="team_lead"
                projectId={project.id}
                owner={project.owner.name}
                progress={progress}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
