// app/(users)/users/forgotPassword/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Supabase will not reveal if email exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/users/reset-password`,
      });

      if (error) throw error;

      toast.success(
        "If your email is registered, you’ll receive a password reset email."
      );
      setEmail("");
    } catch (err: any) {
      toast.error("Failed to send reset email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card-bg)] p-6 rounded-xl shadow-md w-80 flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold text-white text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-[var(--card-hover)] text-white border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] text-white p-3 rounded font-semibold hover:opacity-90 transition"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>

        <a
          href="/users/login"
          className="underline hover:text-white transition"
        >
          Login
        </a>
      </form>
    </div>
  );
}
