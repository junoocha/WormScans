// app/(users)/users/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      toast.success("Welcome back!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-[var(--card-bg)] rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-2 rounded bg-[var(--background)] text-white outline-none border border-gray-600"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-2 rounded bg-[var(--background)] text-white outline-none border border-gray-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-80 font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-gray-400 text-center">
        Don’t have an account?{" "}
        <a
          href="/users/signup"
          className="underline hover:text-white transition"
        >
          Sign Up
        </a>
      </p>

      <p className="mt-2 text-gray-400 text-center">
        <a
          href="/users/forgotPassword"
          className="underline hover:text-white transition"
        >
          Forgot Password?
        </a>
      </p>
    </div>
  );
}
