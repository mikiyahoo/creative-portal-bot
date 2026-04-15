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
      <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-brand-yellow animate-spin" />
        </div>
        <p className="text-text-primary font-bold text-base">
          {authenticating ? "Authenticating..." : "Loading..."}
        </p>
        {authenticating && (
          <p className="text-text-muted text-xs mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-yellow" />
            Secure connection
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="h-full flex flex-col max-w-md mx-auto px-4 py-4">
        <div className="text-center mb-4 pt-2">
          <div className="inline-flex p-4 bg-obsidian rounded-2xl mb-3 border border-white/10">
            <Palette className="w-10 h-10 text-brand-yellow" />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary">
            Creative Portal
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {user ? `Welcome, ${user.first_name}!` : "Your creative journey starts here"}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="flex-1 bg-obsidian rounded-2xl border border-white/10 flex items-center gap-4 p-4 transition-all active:scale-[0.98] hover:border-brand-yellow/30"
          >
            <div className="p-3 bg-brand-yellow rounded-xl">
              <Palette className="w-6 h-6 text-black" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-text-primary">I am a Creative</h2>
              <p className="text-text-muted text-xs">
                Build portfolio & find jobs
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            className="flex-1 bg-obsidian rounded-2xl border border-white/10 flex items-center gap-4 p-4 transition-all active:scale-[0.98] hover:border-brand-yellow/30"
          >
            <div className="p-3 bg-brand-yellow rounded-xl">
              <Briefcase className="w-6 h-6 text-black" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-text-primary">I am an Employer</h2>
              <p className="text-text-muted text-xs">
                Post jobs & discover talent
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}