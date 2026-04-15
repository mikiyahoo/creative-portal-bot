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
        <Loader2 className="w-10 h-10 text-brand-yellow animate-spin mb-4" />
        <p className="text-text-primary font-medium">
          {authenticating ? "Authenticating with Telegram..." : "Loading..."}
        </p>
        {authenticating && (
          <p className="text-text-muted text-sm mt-2 flex items-center gap-2">
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
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-surface rounded-3xl mb-5 border border-white/5">
            <Palette className="w-12 h-12 text-brand-yellow" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary uppercase tracking-wide mb-2">
            Creative Portal
          </h1>
          <p className="text-text-muted">
            {user ? `Welcome back, ${user.first_name}!` : "Your creative journey starts here"}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="w-full p-6 bg-surface rounded-3xl border border-white/5 flex items-center gap-4 transition-all active:scale-[0.98] hover:bg-surface-light"
          >
            <div className="p-4 bg-brand-yellow rounded-2xl">
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
            className="w-full p-6 bg-surface rounded-3xl border border-white/5 flex items-center gap-4 transition-all active:scale-[0.98] hover:bg-surface-light"
          >
            <div className="p-4 bg-brand-yellow rounded-2xl">
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