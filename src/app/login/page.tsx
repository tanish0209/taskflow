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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-15 shadow-md rounded-lg w-full max-w-lg border-orange-400 border-4"
      >
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-600">
          Welcome Back!
        </h1>
        <h1 className="text-2xl font-bold mb-6 text-center">
          Please Try Logging In
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

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

        <div className="w-full flex flex-col justify-center items-center space-y-4">
          <button
            type="submit"
            className="px-6 py-3 cursor-pointer rounded-full w-full bg-gradient-to-r from-orange-500 to-orange-700 text-white  hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
          >
            Login
          </button>
          <Link
            href="/"
            className=" px-6 py-3 text-center cursor-pointer rounded-full w-full  text-black border hover:bg-gray-200 duration-500"
          >
            Go Back
          </Link>
        </div>
      </form>
    </div>
  );
}
