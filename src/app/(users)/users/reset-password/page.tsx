// app/(users)/users/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase will parse the hash fragment automatically
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          toast.success("Enter your new password below.");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // update password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success("Password updated! Please log in.");
      router.push("/users/login");
    } catch (err: any) {
      toast.error("Failed to reset password: " + err.message);
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
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="p-3 rounded bg-[var(--card-hover)] text-white border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="p-3 rounded bg-[var(--card-hover)] text-white border"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] text-white p-3 rounded font-semibold hover:opacity-90 transition"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
