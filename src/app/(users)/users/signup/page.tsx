// app/(users)/users/signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

export default function AdminSignup() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      toast.error("Invalid admin key.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile row
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          is_admin: true, // Only admins can sign up here
        });

        if (profileError) throw profileError;

        toast.success("Admin account created! You can now log in.");
        router.push("/users/login");
      }
    } catch (err: any) {
      toast.error("Failed to create user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-[var(--card-bg)] rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Signup</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <input
          type="text"
          placeholder="Admin Key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          required
          className="px-4 py-2 rounded bg-[var(--background)] text-white outline-none border border-gray-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-80 font-semibold transition"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>

      <p>Already have an account?</p>
      <a href="/users/login" className="underline hover:text-white transition">
        Log in
      </a>
    </div>
  );
}
