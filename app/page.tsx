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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-16 h-16 rounded-full bg-brand-yellow/10 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-brand-yellow animate-spin" />
        </div>
        <p className="text-text-primary font-bold text-lg">
          {authenticating ? "Authenticating with Telegram..." : "Loading..."}
        </p>
        {authenticating && (
          <p className="text-text-muted text-sm mt-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            Secure connection established
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12 pt-6">
          <div className="inline-flex p-6 bg-obsidian rounded-3xl mb-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,184,0,0.05)]">
            <Palette className="w-14 h-14 text-brand-yellow" />
          </div>
          <h1 className="text-4xl font-extrabold text-text-primary uppercase tracking-widest mb-3">
            Creative Portal
          </h1>
          <p className="text-text-muted text-lg">
            {user ? `Welcome back, ${user.first_name}!` : "Your creative journey starts here"}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="w-full p-6 bg-obsidian rounded-3xl border border-white/10 flex items-center gap-5 transition-all active:scale-[0.98] hover:border-brand-yellow/30 hover:shadow-[0_0_20px_rgba(255,184,0,0.1)]"
          >
            <div className="p-4 bg-brand-yellow rounded-2xl shadow-[0_0_15px_rgba(255,184,0,0.3)]">
              <Palette className="w-8 h-8 text-black" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-text-primary">I am a Creative</h2>
              <p className="text-text-muted text-sm">
                Build your portfolio & find jobs
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            className="w-full p-6 bg-obsidian rounded-3xl border border-white/10 flex items-center gap-5 transition-all active:scale-[0.98] hover:border-brand-yellow/30 hover:shadow-[0_0_20px_rgba(255,184,0,0.1)]"
          >
            <div className="p-4 bg-brand-yellow rounded-2xl shadow-[0_0_15px_rgba(255,184,0,0.3)]">
              <Briefcase className="w-8 h-8 text-black" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-text-primary">I am an Employer</h2>
              <p className="text-text-muted text-sm">
                Post jobs & discover talent
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}