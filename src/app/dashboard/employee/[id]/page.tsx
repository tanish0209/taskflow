"use client";

import OverviewCard from "@/components/ui/OverviewCard";
import UpcomingCard from "@/components/ui/UpcomingCard";
import axios from "axios";
import { CalendarX2, Check, Clock, ListChecks } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";

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
        const projectsRes = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = projectsRes.data.data || [];
        setProjects(projectsData);
        setTasks(projectsData.flatMap((p) => p.tasks || []));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const todoTasks = tasks.filter((t) => t.status == "todo").length;

  const upcomingTasks = [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatDueDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4">
        <section className="p-6 border border-gray-200 bg-white rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              // Skeleton for Overview Cards
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
                  description="Tasks past their due date"
                  icon={<CalendarX2 className="w-5 h-5 text-yellow-500" />}
                  chipColor="bg-yellow-200"
                  chiptextColor="text-yellow-500"
                />
              </>
            )}
          </div>
        </section>

        {/* Calendar Section */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Calendar</h2>
          {loading ? (
            <div className="w-full h-72 bg-gray-200 animate-pulse rounded-xl" />
          ) : (
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow">
              <Calendar
                onChange={(date) => setSelectedDate(date as Date)}
                value={selectedDate}
                tileClassName={({ date }) => {
                  const formatted = date.toISOString().split("T")[0];
                  const taskDue = tasks.find((t) => t.dueDate === formatted);
                  return taskDue ? "bg-orange-200 rounded-full" : "";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <section className="border border-gray-200 p-6 rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4">Upcoming Tasks</h2>
        <ul className="flex space-x-3">
          {loading
            ? Array(5)
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
      <section className=" border rounded-2xl bg-white p-6 border-gray-200 ">
        <div>
          <h2 className="text-xl font-bold mb-6">My Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading
              ? Array(2)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="h-40 bg-gray-200 animate-pulse rounded-xl"
                    />
                  ))
              : projects.slice(0, 4).map((project) => {
                  const projectTasks = tasks.filter(
                    (t) => t.projectId === project.id
                  );
                  const completedCount = projectTasks.filter(
                    (t) => t.status === "done"
                  ).length;
                  const progress =
                    projectTasks.length > 0
                      ? Math.round((completedCount / projectTasks.length) * 100)
                      : 0;

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
                            {project.status}
                          </span>
                        </p>
                      </div>

                      <p className="text-lg text-gray-600 font-semibold">
                        {project.description}
                      </p>

                      <p className="text-md text-gray-500">
                        Created At:{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full flex space-x-4">
                        <div className="mt-2 w-3/4 bg-gray-200 h-3 rounded-full">
                          <div
                            className="h-3 rounded-full bg-green-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm mt-1">{progress}% completed</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>
    </div>
  );
}
