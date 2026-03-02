"use client";

import OverviewCard from "@/components/ui/OverviewCard";
import UpcomingCard from "@/components/ui/UpcomingCard";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { CalendarX2, Check, Clock, ListChecks } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SegmentedProgress from "@/components/ui/SegmentedProgress";
import { formatDate } from "@/lib/formatDate";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  projectId: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
  tasks?: Task[];
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        // Fetch tasks and projects in parallel instead of sequentially
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get(`/api/projects/user/${userId}`),
          axios.get(`/api/tasks/user/${userId}`),
        ]);
        setProjects(projectsRes.data.data || []);
        setTasks(tasksRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = getSocket();
    socket.emit("register-user", userId);

    const handleTaskCreated = (task: Task) => {
      setTasks((prev) => [...prev, task]);
    };
    const handleTaskUpdated = (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    };
    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    };
    const handleProjectCreated = (project: Project) => {
      setProjects((prev) => [...prev, project]);
    };
    const handleProjectUpdated = (project: Project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p)),
      );
    };
    const handleProjectDeleted = ({ id }: { id: string }) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    socket.on("task-created", handleTaskCreated);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("task-deleted", handleTaskDeleted);
    socket.on("project-created", handleProjectCreated);
    socket.on("project-updated", handleProjectUpdated);
    socket.on("project-deleted", handleProjectDeleted);

    // Cleanup listeners on unmount to prevent memory leaks
    return () => {
      socket.off("task-created", handleTaskCreated);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("task-deleted", handleTaskDeleted);
      socket.off("project-created", handleProjectCreated);
      socket.off("project-updated", handleProjectUpdated);
      socket.off("project-deleted", handleProjectDeleted);
    };
  }, [userId]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const todoTasks = tasks.filter((t) => t.status == "todo").length;

  const upcomingTasks = [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );


  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <div>
        <section className="p-6 border border-gray-200 bg-white rounded-2xl">
          <h2 className="text-lg md:text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
                  title="All Tasks"
                  value={totalTasks}
                  description="All tasks you've been assigned to"
                  icon={<ListChecks className="w-5 h-5 text-white" />}
                  bgColor="bg-orange-500"
                  chipColor="bg-orange-700"
                  chiptextColor="text-white"
                  countColor="text-white"
                  subtextColor="text-white"
                />

                <OverviewCard
                  title="Completed"
                  value={completedTasks}
                  description="Tasks you've finished"
                  icon={<Check className="w-5 h-5 text-green-600" />}
                  chipColor="bg-green-200"
                  chiptextColor="text-green-600"
                />

                <OverviewCard
                  title="In Progress"
                  value={inProgressTasks}
                  description="Currently active tasks"
                  icon={<Clock className="w-5 h-5 text-blue-800" />}
                  chipColor="bg-blue-200"
                  chiptextColor="text-blue-800"
                />

                <OverviewCard
                  title="Todo"
                  value={todoTasks}
                  description="Tasks to be started"
                  icon={<CalendarX2 className="w-5 h-5 text-yellow-500" />}
                  chipColor="bg-yellow-200"
                  chiptextColor="text-yellow-500"
                />
              </>
            )}
          </div>
        </section>
      </div>

      {/* Upcoming Tasks */}
      <section className="border border-gray-200 p-6 rounded-2xl bg-white">
        <h2 className="text-lg md:text-xl font-bold mb-4">Recent Tasks</h2>
        <ul className="flex space-x-3 overflow-x-auto">
          {loading
            ? Array(2)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="w-48 h-28 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))
            : upcomingTasks
                .slice(0, 5)
                .map((task) => (
                  <UpcomingCard
                    key={task.id}
                    chiptext={
                      task.priority === "low"
                        ? "Low"
                        : task.priority === "high"
                          ? "High"
                          : "Medium"
                    }
                    statuschiptext={
                      task.status === "done"
                        ? "Done"
                        : task.status === "in_progress"
                          ? "In Progress"
                          : task.status === "review"
                            ? "Review"
                            : "Todo"
                    }
                    title={task.title}
                    dueDate={formatDate(task.dueDate)}
                    statuschipColor={
                      task.status === "todo"
                        ? "bg-orange-200"
                        : task.status === "in_progress"
                          ? "bg-blue-200"
                          : task.status === "review"
                            ? "bg-yellow-200"
                            : "bg-green-200"
                    }
                    statuschiptextColor={
                      task.status === "todo"
                        ? "text-orange-600"
                        : task.status === "in_progress"
                          ? "text-blue-600"
                          : task.status === "review"
                            ? "text-yellow-600"
                            : "text-green-600"
                    }
                    chipColor={
                      task.priority === "high"
                        ? "bg-red-200"
                        : task.priority === "medium"
                          ? "bg-yellow-200"
                          : "bg-green-200"
                    }
                    chiptextColor={
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }
                  />
                ))}
        </ul>
      </section>

      {/* Projects Section */}
      <section className=" border rounded-2xl bg-white p-6 border-gray-200 ">
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-6">My Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading
              ? Array(2)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="p-6 h-48 bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))
              : projects.slice(0, 4).map((project) => {
                  const projectTasks =
                    project.tasks?.filter((t) => t.projectId === project.id) ||
                    [];
                  const completedCount = projectTasks.filter(
                    (t) => t.status === "done",
                  ).length;
                  const progress =
                    projectTasks.length > 0
                      ? Math.round((completedCount / projectTasks.length) * 100)
                      : 0;

                  return (
                    <div
                      key={project.id}
                      className="p-4 md:p-6 bg-white rounded-xl space-y-4 border border-gray-200 shadow hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg md:text-2xl font-bold">
                          {project.name}
                        </h3>
                        <p className="text-[10px] md:text-sm font-medium">
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

                      <p className="text-xs md:text-lg text-gray-600 font-semibold line-clamp-2">
                        {project.description}
                      </p>

                      <p className="text-[10px] md:text-[14px] text-gray-500">
                        Created At:{" "}
                        {formatDate(project.createdAt)}
                      </p>
                      <SegmentedProgress value={progress} />
                    </div>
                  );
                })}
          </div>
        </div>
      </section>
    </div>
  );
}
