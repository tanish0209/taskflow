"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

interface Project {
  id: string;
  name: string;
  status?: string;
}

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
}

interface ProjectMember {
  id: string;
  user: { id: string; name: string; email: string };
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [membersByProject, setMembersByProject] = useState<
    Record<string, ProjectMember[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all projects
        const projRes = await axios.get<{ data: Project[] }>("/api/projects");
        const projData = projRes.data.data;
        setProjects(projData);

        // Fetch all tasks
        const taskRes = await axios.get<{ data: Task[] }>("/api/tasks");
        setTasks(taskRes.data.data);

        // Fetch members per project
        const membersData: Record<string, ProjectMember[]> = {};
        await Promise.all(
          projData.map(async (proj) => {
            const memRes = await axios.get<{ data: ProjectMember[] }>(
              `/api/projectMembers/${proj.id}`
            );
            membersData[proj.id] = memRes.data.data;
          })
        );
        setMembersByProject(membersData);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const socket = getSocket();
    socket.on("task-created", (newTask: Task) => {
      setTasks((prev) => [...prev, newTask]);
    });

    socket.on("task-updated", (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    socket.on("project-updated", (updatedProject: Project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    });

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

  const SkeletonBox = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  if (loading) {
    return (
      <div className="p-6 space-y-10">
        <h1 className="text-3xl font-bold">Reports Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overview Skeletons */}
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 shadow rounded-lg p-6 text-center animate-pulse"
              >
                <SkeletonBox className="h-5 w-1/2 mx-auto mb-3" />
                <SkeletonBox className="h-7 w-1/4 mx-auto" />
              </div>
            ))}
          </div>

          {/* Upcoming Deadlines Skeleton */}
          <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
            <SkeletonBox className="h-6 w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-gray-200 pb-2"
                >
                  <SkeletonBox className="h-4 w-1/3" />
                  <SkeletonBox className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Status Skeleton */}
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <SkeletonBox className="h-6 w-1/4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-center shadow-sm animate-pulse"
              >
                <SkeletonBox className="h-4 w-1/2 mx-auto mb-2" />
                <SkeletonBox className="h-6 w-1/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Member Analytics Skeleton */}
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <SkeletonBox className="h-6 w-1/4 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-gray-200 py-2 animate-pulse"
              >
                <SkeletonBox className="h-4 w-1/4" />
                <SkeletonBox className="h-4 w-12" />
                <SkeletonBox className="h-4 w-12" />
                <SkeletonBox className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // --- Task Status Aggregation ---
  const taskStats = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    { todo: 0, in_progress: 0, review: 0, done: 0 } as Record<string, number>
  );

  // --- Upcoming Deadlines ---
  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate || "").getTime() -
        new Date(b.dueDate || "").getTime()
    )
    .slice(0, 5);

  // --- Member Analytics (unique across projects) ---
  type MemberAnalytics = {
    userId: string;
    name: string;
    tasksAssigned: number;
    tasksCompleted: number;
    completionRate: number;
  };

  const memberMap = new Map<string, ProjectMember>();
  Object.values(membersByProject).forEach((projMembers) => {
    projMembers.forEach((mem) => {
      if (!memberMap.has(mem.user.id)) {
        memberMap.set(mem.user.id, mem);
      }
    });
  });
  const uniqueMembers = Array.from(memberMap.values());

  const memberAnalytics: MemberAnalytics[] = uniqueMembers.map((mem) => {
    const assignedTasks = tasks.filter((t) => t.assigneeId === mem.user.id);
    const completedTasks = assignedTasks.filter((t) => t.status === "done");
    return {
      userId: mem.user.id,
      name: mem.user.name,
      tasksAssigned: assignedTasks.length,
      tasksCompleted: completedTasks.length,
      completionRate:
        assignedTasks.length > 0
          ? Math.round((completedTasks.length / assignedTasks.length) * 100)
          : 0,
    };
  });

  return (
    <div className="p-6 space-y-10 bg-white rounded-2xl border border-gray-200">
      <h1 className="text-3xl font-bold">Reports Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-orange-600 text-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Total Projects</h2>
            <p className="text-2xl">{projects.length}</p>
          </div>
          <div className="bg-orange-600 text-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Total Tasks</h2>
            <p className="text-2xl ">{tasks.length}</p>
          </div>
          <div className="bg-orange-600 text-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <p className="text-2xl ">{uniqueMembers.length}</p>
          </div>
        </div>
        {/* Upcoming Deadlines */}
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
          <div className="max-h-60 overflow-y-auto">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center border-b border-gray-200 p-2"
                >
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(task.dueDate || "").toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>
      {/* Task Status Report */}
      <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Status Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(taskStats).map(([status, count]) => (
            <div
              key={status}
              className="p-4 rounded-lg bg-white border border-gray-200 text-center shadow-sm"
            >
              <p className="capitalize font-medium">
                {status.replace("_", " ")}
              </p>
              <p className="text-xl text-orange-600">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member Analytics */}
      <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Member Analytics</h2>
        <div className="max-h-60 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border border-gray-200">
                <th className="px-4 py-2 ">Member</th>
                <th className="px-4 py-2 ">Tasks Assigned</th>
                <th className="px-4 py-2">Tasks Completed</th>
                <th className="px-4 py-2">% Completion</th>
              </tr>
            </thead>
            <tbody>
              {memberAnalytics.length > 0 ? (
                memberAnalytics.map((ma) => (
                  <tr key={ma.userId} className="text-center">
                    <td className="px-4 py-2 border-b border-b-gray-200">
                      {ma.name}
                    </td>
                    <td className="px-4 py-2 border-b border-b-gray-200">
                      {ma.tasksAssigned}
                    </td>
                    <td className="px-4 py-2 border-b border-b-gray-200">
                      {ma.tasksCompleted}
                    </td>
                    <td className="px-4 py-2 border-b border-b-gray-200">
                      {ma.completionRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-gray-500 italic py-3"
                  >
                    No member analytics available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
