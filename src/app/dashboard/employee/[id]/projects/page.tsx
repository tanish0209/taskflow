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
    const fetchProjects = async () => {
      if (!session?.user) return;
      const userId = session.user.id;

      try {
        const res = await axios.get(`/api/projects/user/${userId}`);
        if (res.data.success) {
          const projectsData: Project[] = res.data.data || [];

          const projectsWithProgress = projectsData.map((project) => {
            const projectTasks = project.tasks || [];
            const completedCount = projectTasks.filter(
              (t) => t.status === "done"
            ).length;
            const progress =
              projectTasks.length > 0
                ? Math.round((completedCount / projectTasks.length) * 100)
                : 0;
            return { ...project, progress };
          });

          setProjects(projectsWithProgress);
        } else {
          setError("Failed to load projects");
        }
      } catch (err) {
        console.error(err);
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
      setProjects((prev) => {
        // Avoid duplicates
        if (prev.find((p) => p.id === newProject.id)) return prev;
        return [...prev, { ...newProject, progress: 0 }];
      });
    });

    socket.on("project-updated", (updated: Project) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                ...p,
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

          const progress = calculateProgress(updatedTasks);
          return { ...p, tasks: updatedTasks, progress };
        })
      );
    });
  }, []);
  const calculateProgress = (tasks: Task[]) => {
    const completed = tasks.filter((t) => t.status === "done").length;
    return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  };
  const handleProjectRequest = async () => {
    try {
      const res = await axios.post(`/api/joinRequests`, {
        projectId: projectCode,
        userId: session?.user.id || [],
      });

      if (res.data.success) {
        window.postMessage("Join request sent successfully!");
        setProjectCode("");
      } else {
        window.Error(res.data.message || "Failed to send request");
      }
    } catch (err: any) {
      console.error(err);
    }
  };
  if (!session?.user) return <p>Loading...</p>;

  const userId = session.user.id;

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between  mb-6">
        <h1 className="text-2xl font-bold">Project Overview</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Enter Project Id to Join"
            className="border border-gray-200 rounded-xl px-2 py-2"
          />
          <button
            onClick={handleProjectRequest}
            className="px-3 py-2 w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white  hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
          >
            Request to Join
          </button>
        </div>
      </div>

      {projects.length === 0 && !loading ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 ">
          {loading
            ? Array(4)
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
                  status={
                    project.status === "active"
                      ? "Active"
                      : project.status === "archived"
                      ? "Archived"
                      : "Completed"
                  }
                  owner={project.owner?.name || "N/A"}
                  progress={project.progress || 0}
                />
              ))}
        </div>
      )}
    </main>
  );
}
