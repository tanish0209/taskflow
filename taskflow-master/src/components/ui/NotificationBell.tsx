"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import {
  AtSign,
  Bell,
  BellDot,
  BellRing,
  Check,
  CircleAlert,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: "reminder" | "mention" | "status_update";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await axios.get(
          `/api/notification/user/${session.user.id}`
        );
        const data: Notification[] = res.data.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket: Socket = getSocket();

    const onConnect = () => {
      socket.emit("register-user", session.user.id);
    };

    const handleNotificationCreated = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationUpdated = (notification: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? notification : n))
      );

      if (notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    const handleNotificationDeleted = ({ id }: { id: string }) => {
      setNotifications((prev) => {
        const deleted = prev.find((n) => n.id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    socket.on("connect", onConnect);
    socket.on("notification-created", handleNotificationCreated);
    socket.on("notification-updated", handleNotificationUpdated);
    socket.on("notification-deleted", handleNotificationDeleted);
    socket.on("notifications-all-read", handleAllRead);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("notification-created", handleNotificationCreated);
      socket.off("notification-updated", handleNotificationUpdated);
      socket.off("notification-deleted", handleNotificationDeleted);
      socket.off("notifications-all-read", handleAllRead);
    };
  }, [session]);

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notification/${notificationId}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notification/${notificationId}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `/api/notification/user/${session?.user?.id}/mark-all-read`
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "mention":
        return <AtSign className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "reminder":
        return <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "status_update":
        return <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <BellDot className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          <div
            className="
              absolute right-0 mt-8 sm:mt-6
              w-[90vw] sm:w-80 md:w-96
              bg-white rounded-lg shadow-lg border border-gray-200 
              z-50 max-h-[30vh] sm:max-h-[500px]
              overflow-hidden flex flex-col
            "
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                      !notification.isRead ? "bg-orange-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Delete"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
