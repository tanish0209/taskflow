"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import ProjectCard from "@/components/ui/ProjectCard";

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const session = await getSession();
        if (!session?.user) return;

        const userId = session.user.id;
        const res = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = res.data.data || [];

        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          // 🔹 Show 4 skeleton cards while loading
          Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No projects found.
          </p>
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
