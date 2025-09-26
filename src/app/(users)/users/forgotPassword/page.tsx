// app/(users)/users/forgotPassword/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  // loading states for emails and the loading status
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // prevent page refresh on form submissions
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // do not reveal if email exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/users/reset-password`, // redirect
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-[var(--card-bg)] rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white ">Forgot Password</h2>

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
          className="underline text-gray-400 hover:text-white text-center transition"
        >
          Back to Login
        </a>
      </form>
    </div>
  );
}
