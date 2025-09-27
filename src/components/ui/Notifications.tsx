"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  read: boolean;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "New task assigned", read: false },
    { id: 2, message: "Project deadline updated", read: false },
    { id: 3, message: "Your report was approved", read: true },
  ]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-200 duration-200"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block w-2 h-2 bg-red-600 rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 z-50">
          <h3 className="font-bold text-gray-800 mb-2">Notifications</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-gray-500 text-sm">No notifications</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex justify-between items-center p-2 rounded-md ${
                  n.read ? "bg-gray-100 text-gray-500" : "bg-orange-50"
                }`}
              >
                <span>{n.message}</span>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-3 w-full text-center text-sm text-white bg-orange-600 py-1 rounded-md hover:bg-orange-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
