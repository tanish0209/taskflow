import { useRouter } from "next/navigation";
import React from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  employeeId: string;
  projectId: string;
  status: string;
  owner?: string;
  role: "employee" | "team_lead" | "manager" | "admin";
  progress: number;
}

export default function ProjectCard({
  name,
  description,
  status,
  employeeId,
  projectId,
  owner,
  role,
  progress,
}: ProjectCardProps) {
  const router = useRouter();
  const handleNavigate = () => {
    if (role === "employee" || role === "team_lead") {
      router.push(`/dashboard/${role}/${employeeId}/projects/${projectId}`);
    } else {
      router.push(
        `/dashboard/${role}/${employeeId}/manage-projects/${projectId}`
      );
    }
  };
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 w-full border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">{name}</h2>
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            status === "Completed"
              ? "bg-blue-100 text-blue-600"
              : status === "Active"
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 overflow-hidden text-ellipsis">
          {description}
        </p>

        {owner && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Owner:</span> {owner}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-800">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-400 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        onClick={handleNavigate}
        className="px-3 py-2 mt-3 w-full text-[10px] sm:text-sm rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white  hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
      >
        Go to Project
      </button>
    </div>
  );
}
