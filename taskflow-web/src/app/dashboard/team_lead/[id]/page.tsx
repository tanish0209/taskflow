"use client";

import OverviewCard from "@/components/ui/OverviewCard";
import UpcomingCard from "@/components/ui/UpcomingCard";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { CalendarX2, Check, ListChecks } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "@/styles/calendarOverrides.css";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assigneeId: string;
  ownerId: string;
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

export default function TeamLeadDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const id = session?.user.id;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const myTasksRes = await axios.get(`/api/tasks/user/${id}`);
        const myTasks: Task[] = myTasksRes.data.data || [];

        const assignedTasksRes = await axios.get(`/api/tasks/owner/${id}`);
        const assignedTasks: Task[] = assignedTasksRes.data.data || [];

        const projectsRes = await axios.get(`/api/projects/user/${id}`);
        const projects: Project[] = projectsRes.data.data || [];

        setTasks(myTasks);
        setTeamTasks(assignedTasks);
        setProjects(projects);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const socket = getSocket();
    socket.emit("register-user", id);
    socket.on("task-created", (newTask: Task) => {
      setTasks((prev) => {
        if (newTask.assigneeId === id) {
          return [...prev, newTask];
        }
        return prev;
      });

      setTeamTasks((prev) => {
        if (newTask.ownerId === id) {
          return [...prev, newTask];
        }
        return prev;
      });
    });
    socket.on("task-updated", (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      setTeamTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });
    socket.on("task-deleted", (deletedTaskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
      setTeamTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
    });
  }, [id]);
  // Overview counts
  const tasksAssignedToMe = tasks.length;
  const tasksAssignedByMe = teamTasks.length;
  const completedTasksByMe = tasks.filter((t) => t.status === "done").length;
  const todoTasksByMe = tasks.filter((t) => t.status === "todo").length;

  const formatDueDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
                  title="Tasks Assigned to You"
                  value={tasksAssignedToMe}
                  description="List of tasks assigned to You"
                  icon={<ListChecks className="w-5 h-5 text-white" />}
                  bgColor="bg-orange-500"
                  chipColor="bg-orange-700"
                  chiptextColor="text-white"
                  countColor="text-white"
                  subtextColor="text-white"
                />
                <OverviewCard
                  title="Tasks Assigned by You"
                  value={tasksAssignedByMe}
                  description="Tasks assigned by you to your team"
                  icon={<ListChecks className="w-5 h-5 text-blue-500" />}
                  chipColor="bg-blue-200"
                  chiptextColor="text-blue-500"
                />
                <OverviewCard
                  title="Completed Tasks"
                  value={completedTasksByMe}
                  description="Tasks you have finished"
                  icon={<Check className="w-5 h-5 text-green-600" />}
                  chipColor="bg-green-200"
                  chiptextColor="text-green-600"
                />
                <OverviewCard
                  title="Todo Tasks"
                  value={todoTasksByMe}
                  description="Tasks yet to start"
                  icon={<CalendarX2 className="w-5 h-5 text-yellow-500" />}
                  chipColor="bg-yellow-200"
                  chiptextColor="text-yellow-500"
                />
              </>
            )}
          </div>
        </section>
      </div>

      {/* Team Tasks Section */}
      <section className="border border-gray-200 p-6 rounded-2xl bg-white">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Tasks Assigned to Team
        </h2>
        <ul className="flex space-x-3 overflow-x-auto">
          {loading
            ? Array(2)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="w-48 h-28 bg-gray-200 animate-pulse rounded-xl "
                  />
                ))
            : teamTasks.map((task) => (
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
                  dueDate={formatDueDate(task.dueDate)}
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
      <section className="border rounded-2xl bg-white p-6 border-gray-200">
        <h2 className="text-lg md:text-xl font-bold mb-6">Projects</h2>
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
                  (t) => t.status.toLowerCase() === "done"
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
                    <div className="flex justify-between">
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
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full md:flex space-x-4">
                      <div className="mt-2 w-full md:w-3/4 bg-gray-200 h-3 rounded-full">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] md:text-sm mt-1">
                        {progress}% completed
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
}
