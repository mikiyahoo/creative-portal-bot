"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Palette, Briefcase, Loader2, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const router = useRouter();
  const { tg, user, initData, isReady } = useTelegram();
  const { role, setRole } = useAppStore();
  const [checking, setChecking] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
      if (!isReady || !user) {
        setChecking(false);
        return;
      }

      setAuthenticating(true);

      try {
        if (initData) {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });

          if (res.ok) {
            const data = await res.json();
            
            if (data.role) {
              setRole(data.role);
              if (data.role === "seeker") {
                router.replace("/jobs");
                return;
              } else {
                router.replace("/dashboard");
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setAuthenticating(false);
        setChecking(false);
      }
    };

    authenticateUser();
  }, [isReady, user, initData, router, setRole]);

  const handleRoleSelect = useCallback(async (selectedRole: "seeker" | "employer") => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }

    try {
      await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          telegramId: user?.id, 
          role: selectedRole 
        }),
      });
    } catch (error) {
      console.error("Error saving role:", error);
    }

    setRole(selectedRole);
    
    if (selectedRole === "seeker") {
      router.push("/profile");
    } else {
      router.push("/dashboard");
    }
  }, [tg, user, setRole, router]);

  if (!isReady || checking || authenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-tg-bg p-6">
        <Loader2 className="w-10 h-10 text-tg-button animate-spin mb-4" />
        <p className="text-tg-text font-medium">
          {authenticating ? "Authenticating with Telegram..." : "Loading..."}
        </p>
        {authenticating && (
          <p className="text-tg-hint text-sm mt-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Secure connection established
          </p>
        )}
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