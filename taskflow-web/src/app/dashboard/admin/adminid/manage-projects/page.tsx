"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  owner: {
    id: string;
    name: string;
  };
}

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [membersByProject, setMembersByProject] = useState<
    Record<string, ProjectMember[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          axios.get<{ data: Project[] }>("/api/projects"),
          axios.get<{ users: User[] }>("/api/users"),
        ]);
        setProjects(projRes.data.data);
        setUsers(userRes.data.users);

        const membersData: Record<string, ProjectMember[]> = {};
        await Promise.all(
          projRes.data.data.map(async (proj) => {
            try {
              const memRes = await axios.get<{ data: ProjectMember[] }>(
                `/api/projectMembers/${proj.id}`
              );
              membersData[proj.id] = memRes.data.data;
            } catch (err) {
              console.error(`Failed to fetch members for ${proj.id}`, err);
              membersData[proj.id] = [];
            }
          })
        );

        setMembersByProject(membersData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserName = (userId: string) => {
    if (!users) return "Unknown User";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const getUserEmail = (userId: string) => {
    if (!users) return "";
    const user = users.find((u) => u.id === userId);
    return user ? user.email : "";
  };

  const handleAddMember = async () => {
    if (!selectedProject || !selectedUser) return;
    try {
      await axios.post(`/api/projectMembers`, {
        userId: selectedUser,
        projectId: selectedProject.id,
        role: "MEMBER",
      });

      const newMember = {
        id: Math.random().toString(),
        userId: selectedUser,
        role: "MEMBER",
        joinedAt: new Date().toISOString(),
      };

      setMembersByProject((prev) => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), newMember],
      }));

      setShowModal(false);
      setSelectedUser("");
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const handleRemoveMember = async (projectId: string, userId: string) => {
    try {
      console.log("Deleting member:", projectId, userId);
      await axios.delete(`/api/projectMembers/${projectId}/${userId}`);

      setMembersByProject((prev) => ({
        ...prev,
        [projectId]: prev[projectId].filter((m) => m.userId !== userId),
      }));
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-white rounded-2xl border border-gray-200">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Manage Projects
        </h1>

        <div className="space-y-6 animate pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
            >
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between bg-gray-50 px-3 py-3 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="h-4 w-40 bg-gray-200 rounded"></div>
                      <div className="h-3 w-28 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen bg-white rounded-2xl border border-gray-200">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Manage Projects
      </h1>

      <div className="space-y-6">
        {projects.map((project) => {
          const members = membersByProject[project.id] || [];
          return (
            <div
              key={project.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {project.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1 mb-3">
                    {project.description || "No description provided."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowModal(true);
                  }}
                  className="px-3 py-1 rounded-full  from-orange-500 to-orange-700 text-white  hover:bg-linear-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
                >
                  + Add Member
                </button>
              </div>
              <div className="flex gap-2 my-1">
                <p className="font-medium text-gray-800">Owner:</p>
                <p className="font-light text-gray-800">{project.owner.name}</p>
              </div>
              <h3 className="font-medium text-gray-700 mb-2">Members:</h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {getUserName(member.userId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getUserEmail(member.userId)}
                      </p>
                    </div>
                    <div>
                      <p className="font-light text-gray-700">
                        {member.role === "MEMBER" ? "Member" : "Owner"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleRemoveMember(project.id, member.userId)
                        }
                        className="text-red-500 hover:text-red-600 ml-4 text-sm"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Add Member to {selectedProject.name}
            </h2>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
            >
              <option value="">Select User</option>
              {users
                .filter(
                  (user) =>
                    !membersByProject[selectedProject.id]?.some(
                      (member) => member.userId === user.id
                    )
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
