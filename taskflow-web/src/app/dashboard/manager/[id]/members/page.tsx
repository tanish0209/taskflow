"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface Project {
  id: string;
  name: string;
}
interface ProjectMember {
  id: string;
  user: User;
  joinedAt: string;
}
export default function ProjectMembersPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [membersByProject, setMembersByProject] = useState<
    Record<string, ProjectMember[]>
  >({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get<{ data: Project[] }>("/api/projects");
        setProjects(res.data.data);

        const membersData: Record<string, ProjectMember[]> = {};
        await Promise.all(
          res.data.data.map(async (project) => {
            try {
              const memRes = await axios.get<{ data: ProjectMember[] }>(
                `/api/projectMembers/${project.id}`
              );
              membersData[project.id] = memRes.data.data;
            } catch (err) {
              console.error(
                `Failed to fetch members for project ${project.id}`,
                err
              );
              membersData[project.id] = [];
            }
          })
        );
        setMembersByProject(membersData);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
    const socket = getSocket();
    socket.on(
      "projectmember-updated",
      (data: { projectId: string; members: ProjectMember[] }) => {
        setMembersByProject((prev) => ({
          ...prev,
          [data.projectId]: data.members,
        }));
      }
    );
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse border border-gray-200 p-4 rounded-lg bg-gray-100 flex justify-between items-center">
      <div className="space-y-2 w-full">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/5"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-10">
        <h1 className="text-lg md:text-xl font-bold mb-6">Project Members</h1>
        {[1, 2].map((proj) => (
          <div key={proj} className="space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white p-4 space-y-4 shadow">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl border border-gray-200">
      <h1 className="text-lg md:text-xl font-bold mb-6">Project Members</h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        projects.map((project) => {
          const members = membersByProject[project.id] || [];
          const sortedMembers = [...members].sort((a, b) =>
            a.user.name.localeCompare(b.user.name)
          );

          return (
            <div
              key={project.id}
              className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6"
            >
              <h2 className="text-sm md:text-lg  font-semibold text-orange-600">
                {project.name}
              </h2>

              <div className="border border-gray-400 rounded-md overflow-x-auto bg-white shadow">
                <div className="overflow-x-auto">
                  {/* Table wrapper with fixed min width */}
                  <div className="min-w-160">
                    {/* Header Row */}
                    <div className="grid grid-cols-4 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2 border-b border-b-gray-200">
                      <p className="text-center">Name</p>
                      <p className="text-center">Email</p>
                      <p className="text-center">Joined</p>
                      <p className="text-center">Role</p>
                    </div>

                    {/* Scrollable body (vertical only) */}
                    <div className="max-h-64 overflow-y-auto">
                      {sortedMembers.map((mem) => (
                        <div
                          key={mem.id}
                          className="grid grid-cols-4 px-4 py-2 border-b border-b-gray-200"
                        >
                          <p className="font-medium text-sm text-center">
                            {mem.user.name}
                          </p>
                          <p className="text-sm text-gray-500 text-center">
                            {mem.user.email}
                          </p>
                          <p className="text-sm text-gray-400 text-center">
                            {new Date(mem.joinedAt).toLocaleDateString()}
                          </p>
                          <div className="flex justify-center">
                            <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-700 text-sm">
                              {mem.user.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
