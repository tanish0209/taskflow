"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function UserProfilePage() {
  const { data: session } = useSession();
  const id = session?.user.id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`);
        setUser(res.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading user profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-gray-500 text-lg">User not found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-2xl p-6 sm:p-8 border border-gray-200">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 border-b pb-3">
          User Profile
        </h1>

        {/* Profile Info */}
        <div className="space-y-6 sm:space-y-8 text-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-bold text-lg sm:text-2xl">Name:</p>
            <p className="text-gray-600 text-lg sm:text-2xl wrap-break-word">
              {user.name}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-bold text-base sm:text-xl">Email:</p>
            <p className="text-gray-600 text-base sm:text-xl wrap-break-word">
              {user.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-bold text-base sm:text-xl">Role in Company:</p>
            <p className="text-gray-600 text-base sm:text-xl capitalize">
              {user.role || "Not specified"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-bold text-base sm:text-xl">Registered On:</p>
            <p className="text-gray-600 text-base sm:text-xl">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Avatar section for small screens */}
        <div className="mt-10 flex justify-center sm:hidden">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-3xl">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
