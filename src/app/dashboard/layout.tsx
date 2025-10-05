"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  Search,
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
  BellRing,
} from "lucide-react";
import NotificationBell from "@/components/ui/Notifications";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileExpanded, setProfileExpanded] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;
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
      { href: "/dashboard/members", label: "Project Members", icon: Users },
      { href: "/dashboard/reports", label: "Reports", icon: SquareActivity },
      {
        href: `/dashboard/${role}/${id}/calendar`,
        label: "Calendar",
        icon: CalendarDays,
      },
    ],
    admin: [
      { href: "/dashboard/users", label: "User Management", icon: UserCog },
      {
        href: "/dashboard/global-logs",
        label: "Global Activity Logs",
        icon: SquareKanban,
      },
      {
        href: "/dashboard/global-notifications",
        label: "Global Notifications",
        icon: BellRing,
      },
    ],
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-orange-600 opacity-90 text-white flex flex-col justify-between rounded-r-4xl">
        <div>
          <div className="border-b border-orange-800 flex p-4 items-center">
            <Link
              href="/"
              className="py-2 px-4 text-2xl font-bold rounded-full text-black bg-amber-100 flex"
            >
              Taskflow
              <span className="text-2xl font-bold text-orange-700">.</span>
            </Link>
          </div>
          <nav className="p-4 space-y-2">
            {commonLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-full font-medium hover:bg-orange-700 duration-300"
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {roleLinks[role]?.length > 0 && (
            <div className="p-4">
              <h2 className="text-sm uppercase text-orange-200 font-bold mb-2">
                {role === "admin"
                  ? "Admin Panel"
                  : role === "manager"
                  ? "Manager Tools"
                  : "Team Lead Tools"}
              </h2>
              <nav className="space-y-2">
                {roleLinks[role].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-full font-bold hover:bg-orange-700 duration-300"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-orange-800">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 text-orange-800 font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-200 capitalize">{role}</p>
            </div>
            <ChevronUp
              className={`ml-auto w-5 h-5 transition-transform ${
                profileExpanded ? "rotate-180" : ""
              }`}
            />
          </div>

          {profileExpanded && (
            <div className="mt-2 space-y-1">
              <Link
                href="/dashboard/settings"
                className="block text-sm p-2 hover:bg-orange-700 rounded"
              >
                Settings
              </Link>
              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/login", // redirect to login after logout
                    redirect: true,
                  })
                }
                className="w-full text-left text-sm p-2 bg-amber-100 text-red-800 rounded hover:bg-amber-200 duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between bg-white shadow px-6 py-3">
          <div>
            <h1 className="text-xl font-bold mb-1">
              Welcome, {session?.user?.name}
            </h1>
            <h3 className="text-sm font-medium text-gray-400">
              Here&apos;s what&apos;s waiting for you today.
            </h3>
          </div>
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by task, project, or label..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
