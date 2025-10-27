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

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status, router]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(true);
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
            ></div>
          ))}
        </div>
        <p className="text-gray-700 font-bold text-2xl">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user.role;
  const id = session.user.id;

  const commonLinks = [
    { href: `/dashboard/${role}/${id}`, label: "Dashboard", icon: House },
  ];

  const roleLinks: Record<
    string,
    { href: string; label: string; icon: React.ElementType }[]
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
      {/* Sidebar overlay (for mobile) */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-orange-600 opacity-95 text-white flex flex-col justify-between rounded-r-4xl transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-hidden`}
      >
        <div>
          <div className="border-b border-orange-800 flex items-center justify-between px-4 py-3">
            {sidebarOpen && isDesktop && (
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

          <nav className="p-4 space-y-2">
            {commonLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-orange-700 font-medium transition"
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && isDesktop && link.label}
                </Link>
              );
            })}
          </nav>

          {roleLinks[role] && (
            <div className="p-4">
              {sidebarOpen && isDesktop && (
                <h2 className="text-sm uppercase text-orange-200 font-bold mb-2">
                  {role === "admin"
                    ? "Admin Panel"
                    : role === "manager"
                    ? "Manager Tools"
                    : "Team Lead Tools"}
                </h2>
              )}
              <nav className="space-y-2">
                {roleLinks[role].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-orange-700 font-bold transition"
                    >
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && isDesktop && link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Profile section */}
        <div className="p-4 border-t border-orange-800">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 text-orange-800 font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && isDesktop && (
              <>
                <div className="ml-3">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
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

          {profileExpanded && sidebarOpen && isDesktop && (
            <div className="mt-2 space-y-2">
              <Link
                href={`/dashboard/user-profile/${session.user.id}`}
                className="block text-sm p-2 hover:bg-orange-700 rounded"
              >
                Settings
              </Link>
              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                    redirect: true,
                  })
                }
                className="w-full text-left text-sm p-2 bg-amber-100 text-red-800 rounded hover:bg-amber-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-4 sm:px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-orange-600 text-white rounded-full"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                Welcome, {session?.user?.name}
              </h1>
              <p className="text-sm text-gray-400">
                Here’s what’s waiting today
              </p>
            </div>
          </div>

          <NotificationBell />
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
