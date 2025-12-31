"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ProjectCard from "@/components/ui/ProjectCard";
import { getSocket } from "@/lib/socket";
import { Plus } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "completed" | "archived",
  });

  const { data: session } = useSession();
  const userId = session?.user.id;
  const fetchProjects = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await axios.get(`/api/projects/user/${userId}`);
      setProjects(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, [userId]);
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const handleCreated = (newProject: Project) => {
      if (newProject.owner.id === userId) {
        setProjects((prev) => [newProject, ...prev]);
      }
    };

    const handleUpdated = (updatedProject: Project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    };

    socket.on("project-created", handleCreated);
    socket.on("project-updated", handleUpdated);

    return () => {
      socket.off("project-created", handleCreated);
      socket.off("project-updated", handleUpdated);
    };
  }, [userId]);

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    try {
      await axios.post(`/api/projects`, {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        ownerId: userId,
      });

      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
      await fetchProjects();
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  }

  const ownedProjects = projects.filter((p) => p.owner.id === userId);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold mb-6">Manage Projects</h1>
          <button className="bg-orange-600 text-white rounded-2xl flex items-center space-x-2 px-3 py-1.5">
            <Plus />
            New Project
          </button>
        </div>

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

  if (!loading && ownedProjects.length === 0) {
    return <p className="text-center text-gray-500">No projects found.</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="md:flex items-center justify-between">
        <h1 className="text-lg md:text-2xl font-bold">Manage Projects</h1>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center mt-3 md:mt-0 space-x-2 px-4 py-2 rounded-full bg-linear-to-r from-orange-500 to-orange-700 text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus className="size-4" />
          <p>New Project</p>
        </button>
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 h-screen flex items-center justify-center bg-gray-400/80">
          <form
            onSubmit={handleAddProject}
            className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-lg"
          >
            <h2 className="text-xl font-bold text-center">Add New Project</h2>

            <input
              type="text"
              placeholder="Project Title"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as "active" | "completed" | "archived",
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Project
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
