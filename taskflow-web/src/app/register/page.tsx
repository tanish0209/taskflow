"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import GradientButton from "@/components/ui/GradientButton";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to register");
      }
      const session = await getSession();
      if (session?.user) {
        const role = session.user.role;
        const id = session.user.id;
        router.push(`/dashboard/${role}/${id}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-15 shadow-md rounded-lg w-full max-w-lg border-4 border-orange-400"
      >
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-600">
          Welcome to Taskflow!
        </h1>
        <h1 className="text-xl font-bold mb-6 text-center">
          Kindly Register to Start Your Journey
        </h1>

        {error && <p className="text-orange-600 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-400 rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-400 rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-400 rounded-lg"
        />
        <div className="w-full flex items-center space-x-4">
          <GradientButton className="w-1/2 text-center" variant="outline" size="md" href="/">Go Back</GradientButton>
          <GradientButton className="w-1/2 text-center" variant="filled" size="md" type="submit">Register</GradientButton>
        </div>
      </form>
    </div>
  );
}
