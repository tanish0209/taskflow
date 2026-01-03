"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  role: string;
}

const getAxiosErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.message ||
      "Request failed"
    );
  }
  return "Unexpected error occurred";
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Record<string, Project[]>>({});
  const [error, setError] = useState("");

  const limit = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/users?page=${page}&limit=${limit}`);

        setUsers(res.data.users);
        setTotalUsers(res.data.total);
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const totalPages = Math.ceil(totalUsers / limit);

  // ---------- Delete User ----------
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/users/${userId}`);

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err));
    }
  };

  // ---------- Change Role ----------
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.patch(`/api/users/${userId}`, { role: newRole });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err));
    }
  };

  // ---------- Fetch Projects for Hover Row ----------
  const fetchProjects = async (userId: string) => {
    if (!projects[userId]) {
      try {
        const res = await axios.get(`/api/projects/user/${userId}`);

        setProjects((prev) => ({
          ...prev,
          [userId]: res.data.data,
        }));
      } catch (err: unknown) {
        alert(getAxiosErrorMessage(err));
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl">
      <h1 className="text-lg md:text-xl lg:text-3xl font-semibold mb-4 md:mb-8 text-gray-800">
        Manage Users
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Skeleton Loader */}
      {loading ? (
        <div className="overflow-x-auto shadow-md rounded-lg animate-pulse">
          <table className="min-w-full border border-gray-200 text-xs md:text-sm">
            <thead className="bg-orange-100 text-orange-700">
              <tr>
                <th className="px-4 py-3 text-left w-[5%]">#</th>
                <th className="px-4 py-3 text-left w-[20%]">Name</th>
                <th className="px-4 py-3 text-left w-[15%]">Role</th>
                <th className="px-4 py-3 text-left w-[25%]">Projects</th>
                <th className="px-4 py-3 text-left w-[15%]">Created At</th>
                <th className="px-4 py-3 text-left w-[10%]">Delete</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-3 w-3 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        users.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border border-gray-200 text-xs md:text-sm">
              <thead className="bg-orange-100 text-orange-700">
                <tr>
                  <th className="px-4 py-3 text-left w-[5%]">#</th>
                  <th className="px-4 py-3 text-left w-[20%]">Name</th>
                  <th className="px-4 py-3 text-left w-[15%]">Role</th>
                  <th className="px-4 py-3 text-left w-[25%]">Projects</th>
                  <th className="px-4 py-3 text-left w-[15%]">Created At</th>
                  <th className="px-4 py-3 w-[10%] text-center">Delete</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-orange-50 transition"
                    onMouseEnter={() => fetchProjects(user.id)}
                  >
                    <td className="px-4 py-3">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="text-xs md:text-sm px-4 py-3 font-medium text-gray-700">
                      {user.name}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-xs md:text-sm"
                      >
                        <option value="employee">Employee</option>
                        <option value="team_lead">Team Lead</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {projects[user.id] ? (
                        projects[user.id].length === 0 ? (
                          <p className="text-gray-400 text-xs md:text-sm">
                            No projects
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {projects[user.id].map((p) => (
                              <div
                                key={p.id}
                                className="px-3 py-2 bg-orange-100 rounded-full"
                              >
                                <span className="text-xs md:text-sm font-medium">
                                  {p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <p className="text-gray-400 text-sm">Loading...</p>
                      )}
                    </td>

                    <td className="text-xs md:text-sm px-4 py-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 flex items-center justify-center">
                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="size-4 md:size-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>

          <p className="text-gray-700">
            Page {page} of {totalPages}
          </p>

          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
