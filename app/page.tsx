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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!isReady || !user) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/check?telegramId=${user.id}`);
        const data = await res.json();
        
        if (data.role) {
          setRole(data.role);
          if (data.role === "seeker") {
            router.replace("/jobs");
          } else {
            router.replace("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setChecking(false);
      }
    };

    checkUser();
  }, [isReady, user, router, setRole]);

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

  if (!isReady || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tg-bg">
        <Loader2 className="w-8 h-8 text-tg-button animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-tg-button/10 backdrop-blur-md rounded-2xl mb-4">
            <Palette className="w-10 h-10 text-tg-button" />
          </div>
          <h1 className="text-3xl font-bold text-tg-text mb-2">
            Creative Portal
          </h1>
          <p className="text-tg-hint">
            {user ? `Welcome back, ${user.first_name}!` : "Your creative journey starts here"}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="w-full p-6 bg-tg-secondary/50 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4 transition-all active:scale-[0.98] hover:bg-tg-secondary/70"
          >
            <div className="p-4 bg-gradient-to-br from-tg-button to-tg-button/80 rounded-xl shadow-lg">
              <Palette className="w-8 h-8 text-tg-button-text" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-tg-text">I am a Creative</h2>
              <p className="text-tg-hint text-sm">
                Build your portfolio & find jobs
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            className="w-full p-6 bg-tg-secondary/50 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4 transition-all active:scale-[0.98] hover:bg-tg-secondary/70"
          >
            <div className="p-4 bg-gradient-to-br from-tg-button to-tg-button/80 rounded-xl shadow-lg">
              <Briefcase className="w-8 h-8 text-tg-button-text" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-tg-text">I am an Employer</h2>
              <p className="text-tg-hint text-sm">
                Post jobs & discover talent
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}