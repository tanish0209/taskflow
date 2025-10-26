"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
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
        console.log(res.data.data);
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
      <div className="flex justify-center items-center h-screen w-screen">
        <p className="text-gray-600 text-lg">Loading user profile...</p>
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
    <div className=" h-screen mx-auto mt-2 bg-white shadow-md rounded-2xl p-8 border border-gray-200">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-3">
        User Profile
      </h1>

      <div className="space-y-10 text-gray-700">
        <div className="flex gap-2">
          <p className="font-bold text-2xl">Name:</p>
          <p className="text-gray-600 text-2xl ">{user.name}</p>
        </div>

        <div className="flex gap-2">
          <p className="font-bold text-xl">Email:</p>
          <p className="text-gray-600 text-xl">{user.email}</p>
        </div>

        <div className="flex gap-2">
          <p className="font-bold text-xl">Role in Company:</p>
          <p className="text-gray-600 text-xl">
            {user.role || "Not specified"}
          </p>
        </div>

        <div className="flex gap-2">
          <p className="font-bold text-xl">Registered On:</p>
          <p className="text-gray-600 text-xl">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
