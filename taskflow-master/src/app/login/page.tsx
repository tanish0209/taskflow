"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      const session = await getSession();
      if (session?.user) {
        const role = session.user.role;
        const id = session.user.id;
        router.push(`/dashboard/${role}/${id}`);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-10 md:p-12 shadow-xl rounded-2xl w-full max-w-md sm:max-w-lg border-2 border-orange-400"
      >
        {/* Title Section */}
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-center text-orange-600">
          Welcome Back!
        </h1>
        <h2 className="text-lg sm:text-2xl font-semibold mb-6 text-center text-gray-700">
          Please try logging in
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 mb-4 text-center text-sm sm:text-base">
            {error}
          </p>
        )}

        {/* Inputs */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />

        {/* Buttons */}
        <div className="w-full flex flex-col items-center space-y-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-full w-full bg-linear-to-r from-orange-500 to-orange-700 text-white font-semibold text-sm sm:text-base hover:from-orange-600 hover:to-orange-800 shadow-md transition duration-300"
          >
            Login
          </button>

          <Link
            href="/"
            className="px-6 py-3 text-center rounded-full w-full text-gray-700 border border-gray-300 font-medium text-sm sm:text-base hover:bg-gray-100 transition duration-300"
          >
            Go Back
          </Link>
        </div>
      </form>
    </div>
  );
}
