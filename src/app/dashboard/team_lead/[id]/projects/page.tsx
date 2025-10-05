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

  if (loading) {
    return <p className="text-center text-gray-500">Loading projects...</p>;
  }

  if (projects.length === 0) {
    return <p className="text-center text-gray-500">No projects found.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
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
        })}
      </div>
    </div>
  );
}
