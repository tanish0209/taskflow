"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import TaskCard from "@/components/ui/TaskCard";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  dueDate: string;
  assigneeId: string;
  projectId: string;
  priority: "low" | "medium" | "high";
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
  tasks?: Task[];
};

export default function TeamLeadTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { data: session } = useSession();

  const updateStatus = async (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: t.status } : t))
      );
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user) return;
        const userId = session.user.id;

        // Fetch projects where user is a member
        const projectsRes = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = projectsRes.data.data || [];
        setProjects(projectsData);

        // Fetch tasks assigned to this team lead
        const tasksRes = await axios.get(`/api/tasks/user/${userId}`);
        const tasksData: Task[] = tasksRes.data.data || [];
        setTasks(tasksData);

        console.log("📊 Fetched projects:", projectsData.length);
        console.log("📋 Fetched tasks:", tasksData.length);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);
  useEffect(() => {
    if (projects.length === 0) return;

    const socket: Socket = getSocket();

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setIsSocketConnected(true);

      // Join all project rooms
      projects.forEach((project) => {
        socket.emit("join-project", project.id);
        console.log(`🔌 Joined project room: project_${project.id}`);
      });
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleTaskCreated = (task: Task) => {
      if (session?.user && task.assigneeId === session.user.id) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === task.id)) {
            return prev;
          }
          return [...prev, task];
        });
      }
    };

    const handleTaskUpdated = (task: Task) => {
      setTasks((prev) => {
        if (session?.user && task.assigneeId === session.user.id) {
          const exists = prev.some((t) => t.id === task.id);
          if (!exists) {
            return [...prev, task];
          }
          return prev.map((t) => (t.id === task.id ? task : t));
        }
        if (session?.user && task.assigneeId !== session.user.id) {
          return prev.filter((t) => t.id !== task.id);
        }

        return prev.map((t) => (t.id === task.id ? task : t));
      });
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("task-created", handleTaskCreated);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("task-deleted", handleTaskDeleted);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("task-created", handleTaskCreated);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("task-deleted", handleTaskDeleted);

      projects.forEach((project) => {
        socket.emit("leave-project", project.id);
      });
    };
  }, [projects, session]);

  if (!session?.user) return <p>Loading...</p>;
  const userId = session.user.id;

  return (
    <div className="p-6 space-y-8 border border-gray-200 bg-white rounded-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Tasks</h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="space-y-4 p-6 border border-gray-200 rounded-2xl animate-pulse"
            >
              <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
              <div className="flex flex-wrap gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-60 h-32 bg-gray-300 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">No projects assigned yet</p>
          ) : (
            projects.map((project) => {
              const projectTasks = tasks.filter(
                (t) => t.projectId === project.id
              );

              return (
                <div
                  key={project.id}
                  className="space-y-4 p-6 border border-gray-200 rounded-2xl mb-6"
                >
                  <h2 className="text-2xl font-bold text-orange-600">
                    Project: {project.name}
                  </h2>

                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {projectTasks.length > 0 ? (
                      projectTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          taskId={task.id}
                          title={task.title}
                          projectName={project.name}
                          dueDate={task.dueDate}
                          status={task.status}
                          priority={task.priority}
                          employeeId={userId}
                          onStatusChange={updateStatus}
                          role="team_lead"
                          taskLink={`/dashboard/team_lead/${userId}/tasks/${task.id}`}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No tasks yet for this project
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
