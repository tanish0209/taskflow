"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "@/components/ui/ProjectCard";
import { useSession } from "next-auth/react";

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
      <h1 className="text-2xl font-bold mb-6">Project Overview</h1>

      {projects.length === 0 && !loading ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 ">
          {loading
            ? // Skeleton for 4 projects
              Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-48 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))
            : // Actual project cards
              projects.map((project) => (
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
