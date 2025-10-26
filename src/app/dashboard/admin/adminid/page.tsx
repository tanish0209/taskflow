"use client";
import OverviewCard from "@/components/ui/OverviewCard";
import axios from "axios";
import { ListChecks } from "lucide-react";
import React, { useEffect, useState } from "react";

function AdminDashboard() {
  type Project = {
    id: string;
    name: string;
    description: string;
    status: "active" | "archived" | "completed";
    createdAt: string;
  };
  type User = {
    id: string;
    name: string;
    role: string;
    createdAt: string;
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchedData = async () => {
      try {
        const projectsRes = await axios.get("/api/projects");
        const usersRes = await axios.get("/api/users?overview=true");
        const projectData: Project[] = projectsRes.data.data || [];
        const userData: User[] = usersRes.data || [];
        console.log(usersRes);
        setProjects(projectData);
        setUsers(userData);
      } catch (err) {
        console.log("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchedData();
  }, []);
  const projectCount = projects.length;
  const userCount = users.length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const formatDueDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-x-4">
        {/* Overview Section */}
        <section className="p-6 border border-gray-200 bg-white rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 lg:flex lg:justify-around">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))
            ) : (
              <>
                <OverviewCard
                  title="Total Users"
                  value={userCount}
                  description="Number of Users"
                  icon={<ListChecks className="w-5 h-5 text-white" />}
                  bgColor="bg-orange-500"
                  chipColor="bg-orange-700"
                  chiptextColor="text-white"
                  countColor="text-white"
                  subtextColor="text-white"
                />
                <OverviewCard
                  title="Projects"
                  value={projectCount}
                  description="Number of Projects"
                  icon={<ListChecks className="w-5 h-5 text-blue-500" />}
                  chipColor="bg-blue-200"
                  chiptextColor="text-blue-500"
                />
                <OverviewCard
                  title="Completed Projects"
                  value={completedProjects}
                  description="Number of Projects completed"
                  icon={<ListChecks className="w-5 h-5 text-green-600" />}
                  chipColor="bg-green-200"
                  chiptextColor="text-green-600"
                />
                <OverviewCard
                  title="Active Projects"
                  value={activeProjects}
                  description="Number of Projects active"
                  icon={<ListChecks className="w-5 h-5 text-yellow-500" />}
                  chipColor="bg-yellow-200"
                  chiptextColor="text-yellow-500"
                />
              </>
            )}
          </div>
        </section>
      </div>

      {/* Recent Users Section */}
      <section className="border border-gray-200 p-6 rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4">Recently Registered Users</h2>
        <ul className="flex space-x-3 overflow-x-auto">
          {loading
            ? Array(5)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="w-48 h-32 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))
            : users.map((user) => (
                <li
                  key={user.id}
                  className="bg-white rounded-2xl border p-6 border-gray-200"
                >
                  <h2 className="text-lg text-black font-bold">{user.name}</h2>
                  <h3 className="text-md text-gray-700 font-medium">
                    {user.role === "employee"
                      ? "Employee"
                      : user.role === "team_lead"
                      ? "Team Lead"
                      : "Manager"}
                  </h3>
                  <h4 className="text-sm text-gray-500 font-light">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h4>
                </li>
              ))}
        </ul>
      </section>

      {/* Projects Section */}
      <section className="border rounded-2xl bg-white p-6 border-gray-200">
        <h2 className="text-xl font-bold mb-6">Projects</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="p-6 h-48 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))
            : projects.map((project) => {
                return (
                  <div
                    key={project.id}
                    className="p-6 bg-white rounded-xl space-y-4 border border-gray-200 shadow hover:shadow-md transition"
                  >
                    <div className="flex justify-between">
                      <h3 className="text-2xl font-bold">{project.name}</h3>
                      <p className="text-sm font-medium">
                        <span
                          className={
                            project.status === "active"
                              ? "text-green-600 bg-green-200 px-3 py-2 rounded-full"
                              : project.status === "archived"
                              ? "text-gray-500 bg-gray-200 px-3 py-2 rounded-full"
                              : "text-blue-600 bg-blue-200 px-3 py-2 rounded-full"
                          }
                        >
                          {project.status === "active"
                            ? "Active"
                            : project.status === "archived"
                            ? "Archived"
                            : "Completed"}
                        </span>
                      </p>
                    </div>

                    <p className="text-lg text-gray-600 font-semibold">
                      {project.description}
                    </p>
                    <p className="text-md text-gray-500">
                      Created At: {formatDueDate(project.createdAt)}
                    </p>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
