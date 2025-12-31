"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
}

interface JoinRequest {
  id: string;
  user: User;
  project: Project;
  status: JoinRequestStatus;
  createdAt: string;
}

export default function ManagerJoinRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get<{ data: JoinRequest[] }>(
          `/api/joinRequests`
        );
        setRequests(res.data.data);
      } catch (err) {
        console.error("Failed to fetch join requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    const socket = getSocket();
    socket.on("joinrequest-created", (req: JoinRequest) => {
      setRequests((prev) => [req, ...prev]);
    });

    socket.on("joinrequest-updated", (updated: JoinRequest) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    });
  }, []);

  // Group requests by project
  const requestsByProject = requests.reduce<Record<string, JoinRequest[]>>(
    (acc, req) => {
      if (!acc[req.project.id]) {
        acc[req.project.id] = [];
      }
      acc[req.project.id].push(req);
      return acc;
    },
    {}
  );

  // Approve
  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/joinRequests/${id}/approve`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "APPROVED" } : req
        )
      );
    } catch (err) {
      console.error("Failed to approve request:", err);
    }
  };

  // Reject
  const handleReject = async (id: string) => {
    try {
      await axios.post(`/api/joinRequests/${id}/reject`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "REJECTED" } : req
        )
      );
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

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
      <div className="border p-3 md:p-6 border-gray-200 bg-white rounded-2xl space-y-10">
        <h1 className="text-2xl md:text-3xl font-bold">Join Requests</h1>
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
    <div className="border border-gray-200 bg-white rounded-2xl p-4 md:p-6 space-y-4 md:space-y-10">
      <h1 className="text-lg md:text-xl font-bold mb-6">Join Requests</h1>

      {Object.keys(requestsByProject).length === 0 ? (
        <p className="text-gray-500">No join requests found.</p>
      ) : (
        Object.entries(requestsByProject).map(
          ([projectId, projectRequests]) => {
            const projectName =
              projectRequests[0]?.project.name || "Unnamed Project";
            return (
              <div key={projectId} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold text-orange-600">
                  {projectName}
                </h2>

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white p-4 space-y-4 shadow">
                  {projectRequests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-gray-300 p-4 rounded-lg bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm md:text-base font-semibold">
                          {req.user.name}
                        </p>
                        <p className="text-[10px] md:text-sm text-gray-500">
                          {req.user.email}
                        </p>
                        <p className="text-[8px] md:text-xs text-gray-400">
                          Requested: {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className=" space-y-2 md:space-y-0 md:flex text-xs md:text-base gap-2">
                        {req.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-4 py-2 bg-green-400 text-white hover:bg-green-500  rounded-full"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-4 py-2 bg-red-400 text-white rounded-full hover:bg-red-500"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                              req.status === "APPROVED"
                                ? "bg-green-200 text-green-700"
                                : "bg-red-200 text-red-700"
                            }`}
                          >
                            {req.status.charAt(0).toUpperCase() +
                              req.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )
      )}
    </div>
  );
}
