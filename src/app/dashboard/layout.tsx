"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "@/styles/calendarOverrides.css";
import {
  ChevronUp,
  ClipboardList,
  House,
  BookCheck,
  CalendarDays,
  ClipboardCheck,
  Users,
  BookOpenCheck,
  UserPlus,
  SquareActivity,
  UserCog,
  SquareKanban,
  X,
  Menu,
} from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";

type Props = { children: ReactNode };

export default function DashboardLayout({ children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ----------------------------- AUTH REDIRECT -----------------------------
  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status, router]);

  // ------------------------ RESPONSIVE SIDEBAR CONTROL ----------------------
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop); // Desktop = sidebar open by default
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 bg-gray-300 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-gray-700 font-bold text-2xl">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user.role;
  const id = session.user.id;

  // ------------------------ LINKS BASED ON ROLE ------------------------
  const commonLinks = [
    { href: `/dashboard/${role}/${id}`, label: "Dashboard", icon: House },
  ];

  const roleLinks: Record<
    string,
    { href: string; label: string; icon: any }[]
  > = {
    employee: [
      {
        href: `/dashboard/${role}/${id}/tasks`,
        label: "My Tasks",
        icon: ClipboardList,
      },
      {
        href: `/dashboard/${role}/${id}/projects`,
        label: "My Projects",
        icon: BookCheck,
      },
      {
        href: `/dashboard/${role}/${id}/calendar`,
        label: "Calendar",
        icon: CalendarDays,
      },
    ],
    team_lead: [
      {
        href: `/dashboard/${role}/${id}/tasks`,
        label: "My Tasks",
        icon: ClipboardList,
      },
      {
        href: `/dashboard/${role}/${id}/manage-tasks`,
        label: "Manage Tasks",
        icon: ClipboardCheck,
      },
      {
        href: `/dashboard/${role}/${id}/projects`,
        label: "My Projects",
        icon: BookCheck,
      },
      {
        href: `/dashboard/${role}/${id}/calendar`,
        label: "Calendar",
        icon: CalendarDays,
      },
    ],
    manager: [
      {
        href: `/dashboard/${role}/${id}/manage-projects`,
        label: "Manage Projects",
        icon: BookOpenCheck,
      },
      {
        href: `/dashboard/${role}/${id}/manage-tasks`,
        label: "Manage Tasks",
        icon: ClipboardCheck,
      },
      {
        href: `/dashboard/${role}/${id}/manage-requests`,
        label: "Join Requests",
        icon: UserPlus,
      },
      {
        href: `/dashboard/${role}/${id}/members`,
        label: "Project Members",
        icon: Users,
      },
      {
        href: `/dashboard/${role}/${id}/reports`,
        label: "Reports",
        icon: SquareActivity,
      },
      {
        href: `/dashboard/${role}/${id}/calendar`,
        label: "Calendar",
        icon: CalendarDays,
      },
    ],
    admin: [
      {
        href: `/dashboard/${role}/${id}/manage-users`,
        label: "User Management",
        icon: UserCog,
      },
      {
        href: `/dashboard/${role}/${id}/manage-projects`,
        label: "Manage Projects",
        icon: BookOpenCheck,
      },
      {
        href: `/dashboard/${role}/${id}/manage-requests`,
        label: "Join Requests",
        icon: UserPlus,
      },
      {
        href: `/dashboard/${role}/${id}/global-logs`,
        label: "Global Activity Logs",
        icon: SquareKanban,
      },
    ],
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* -------------------------------- OVERLAY FOR MOBILE -------------------------------- */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* -------------------------------- SIDEBAR -------------------------------- */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-orange-600 text-white flex flex-col justify-between
        transition-all duration-300 z-40 overflow-hidden
        ${sidebarOpen ? "w-64" : "w-0 lg:w-20"}`}
      >
        {/* ---------- TOP SECTION ---------- */}
        <div>
          {/* Logo + Toggle */}
          <div className="border-b border-orange-800 flex items-center justify-between px-4 py-3">
            {sidebarOpen && (
              <Link
                href="/"
                className="text-2xl font-bold bg-amber-100 text-black px-4 py-1 rounded-full"
              >
                Taskflow<span className="text-orange-700">.</span>
              </Link>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-white hover:bg-orange-700 rounded-full"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Common Links */}
          <nav className="p-4 space-y-2">
            {commonLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-orange-700 font-medium transition"
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && label}
              </Link>
            ))}
          </nav>

          {/* Role-specific Links */}
          <div className="p-4">
            {sidebarOpen && (
              <h2 className="text-sm uppercase text-orange-200 font-bold mb-2">
                {role === "admin"
                  ? "Admin Panel"
                  : role === "manager"
                  ? "Manager Tools"
                  : role === "team_lead"
                  ? "Team Lead Tools"
                  : "Employee Tools"}
              </h2>
            )}

            <nav className="space-y-2">
              {roleLinks[role]?.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-orange-700 font-bold transition"
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* ---------- PROFILE DROPDOWN ---------- */}
        <div className="p-4 border-t border-orange-800">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 text-orange-800 font-bold">
              {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>

            {sidebarOpen && (
              <>
                <div className="ml-3">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-gray-200 capitalize">
                    {role.replace("_", " ")}
                  </p>
                </div>

                <ChevronUp
                  className={`ml-auto w-5 h-5 transition-transform ${
                    profileExpanded ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </div>

          {profileExpanded && sidebarOpen && (
            <div className="mt-2 space-y-2">
              <Link
                href={`/dashboard/user-profile/${session.user.id}`}
                className="block text-sm p-2 hover:bg-orange-700 rounded"
              >
                Settings
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left text-sm p-2 bg-amber-100 text-red-800 rounded hover:bg-amber-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* -------------------------------- MAIN AREA -------------------------------- */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between bg-white shadow px-4 sm:px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-orange-600 text-white rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div>
              <h1 className="text-sm sm:text-xl font-bold">
                Welcome, {session.user.name}
              </h1>
              <p className="text-[10px] sm:text-sm text-gray-400">
                Here’s what’s waiting today
              </p>
            </div>
          </div>

          <NotificationBell />
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
