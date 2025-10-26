"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await axios.get(
        `/api/activityLogs?page=${page}&limit=${limit}`
      );
      setLogs(res.data.data);
      setTotal(res.data.total);
    };
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl min-h-screen ">
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
            {logs.map((log) => (
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
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
