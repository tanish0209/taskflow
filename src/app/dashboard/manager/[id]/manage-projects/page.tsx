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

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user.id;
  useEffect(() => {
    const fetchProjects = async () => {
      try {
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
    const socket = getSocket();
    socket.on("project-created", (newProject: Project) => {
      if (newProject.owner.id === userId) {
        setProjects((prev) => [newProject, ...prev]);
      }
    });
    socket.on("project-updated", (updatedProject: Project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    });
  }, [userId]);
  const ownedProjects = projects.filter((p) => p.owner.id === userId);
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="h-48 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return <p className="text-center text-gray-500">No projects found.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
        {ownedProjects.map((project) => {
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
              role="manager"
              projectId={project.id}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}
