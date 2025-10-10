"use client";
import OverviewCard from "@/components/ui/OverviewCard";
import UpcomingCard from "@/components/ui/UpcomingCard";
import axios from "axios";
import { Check, ListChecks, LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assigneeId: string;
  projectId: string;
  ownerId: string;
};
type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: string;
};

function ManagerDashboard() {
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchedData = async () => {
      if (!session?.user) return;
      const userId = session.user.id;

      try {
        const assignedTasksRes = await axios.get(`/api/tasks/owner/${userId}`);
        const assignedTasks: Task[] = assignedTasksRes.data.data || [];

        const projectsRes = await axios.get(`/api/projects/user/${userId}`);
        const projectsData: Project[] = projectsRes.data.data || [];

        setTeamTasks(assignedTasks);
        setProjects(projectsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchedData();
  }, [session]);

  const tasksAssigned = teamTasks.length;
  const totalProjects = projects.length;
  const tasksCompleted = teamTasks.filter((t) => t.status === "done").length;
  const tasksInProgress = teamTasks.filter(
    (t) => t.status === "in_progress"
  ).length;

  const upcomingTasks = [...teamTasks]
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5); // Limit to 5 upcoming tasks

  const formatDueDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4">
        {/* Overview Section */}
        <section className="p-6 border border-gray-200 bg-white rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  title="Tasks Assigned"
                  value={tasksAssigned}
                  description="Tasks Assigned to the Team"
                  icon={<ListChecks className="w-5 h-5 text-white" />}
                  bgColor="bg-orange-500"
                  chipColor="bg-orange-700"
                  chiptextColor="text-white"
                  countColor="text-white"
                  subtextColor="text-white"
                />
                <OverviewCard
                  title="Projects"
                  value={totalProjects}
                  description="Number of Projects"
                  icon={<ListChecks className="w-5 h-5 text-blue-500" />}
                  chipColor="bg-blue-200"
                  chiptextColor="text-blue-500"
                />
                <OverviewCard
                  title="Tasks Completed"
                  value={tasksCompleted}
                  description="Tasks Completed by the Team"
                  icon={<Check className="w-5 h-5 text-green-600" />}
                  chipColor="bg-green-200"
                  chiptextColor="text-green-600"
                />
                <OverviewCard
                  title="Tasks In Progress"
                  value={tasksInProgress}
                  description="Number of Tasks In Progress"
                  icon={<LoaderCircle className="w-5 h-5 text-yellow-500" />}
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
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow">
            {loading ? (
              <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              <Calendar
                onChange={(date) => setSelectedDate(date as Date)}
                value={selectedDate}
                tileClassName={({ date }) => {
                  const formatted = date.toISOString().split("T")[0];
                  const taskDue = [...teamTasks].find(
                    (t) => t.dueDate === formatted
                  );
                  return taskDue ? "bg-orange-200 rounded-full" : "";
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Team Tasks Section */}
      <section className="border border-gray-200 p-6 rounded-2xl bg-white">
        <h2 className="text-xl font-bold mb-4">Tasks Assigned to Team</h2>
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
            : upcomingTasks.map((task) => (
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
                const projectTasks = [...teamTasks].filter(
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
      </section>
    </div>
  );
}

export default ManagerDashboard;
