"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/activityLogs?page=${page}&limit=${limit}`
        );
        setLogs(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Admin Logs</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-orange-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Action
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Details
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              : logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {log.action}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.user ? `${log.user.name} (${log.user.email})` : "-"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.details ? (
                        <pre className="bg-gray-100 p-2 rounded-lg overflow-x-auto">
                          {log.details}
                        </pre>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            Prev
          </button>

          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
