"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Palette, Briefcase, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const router = useRouter();
  const { tg, user, isReady } = useTelegram();
  const { role, setRole } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && role) {
      if (role === "seeker") {
        router.replace("/jobs");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isReady, role, router]);

  const handleRoleSelect = useCallback((selectedRole: "seeker" | "employer") => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }
    setRole(selectedRole);
    
    if (selectedRole === "seeker") {
      router.push("/profile");
    } else {
      router.push("/dashboard");
    }
  }, [tg, setRole, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tg-bg">
        <Loader2 className="w-8 h-8 text-tg-button animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-tg-text text-center mb-2">
          Creative Portal
        </h1>
        <p className="text-tg-hint text-center mb-8">
          {user ? `Welcome, ${user.first_name}!` : "Welcome to the creative hub"}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="w-full p-6 bg-tg-secondary rounded-xl flex items-center gap-4 transition-transform active:scale-[0.98]"
          >
            <div className="p-4 bg-tg-button rounded-lg">
              <Palette className="w-8 h-8 text-tg-button-text" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-tg-text">I am a Creative</h2>
              <p className="text-tg-hint text-sm">
                Browse jobs & build your portfolio
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            className="w-full p-6 bg-tg-secondary rounded-xl flex items-center gap-4 transition-transform active:scale-[0.98]"
          >
            <div className="p-4 bg-tg-button rounded-lg">
              <Briefcase className="w-8 h-8 text-tg-button-text" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-tg-text">I am an Employer</h2>
              <p className="text-tg-hint text-sm">
                Post jobs & find talent
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}