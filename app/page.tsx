"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck } from "lucide-react";
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
        <div className="w-14 h-14 rounded-full bg-brand-yellow/10 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-brand-yellow animate-spin" />
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
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <div className="w-48 h-16 rounded-2xl bg-obsidian border border-white/10 flex items-center justify-center overflow-hidden mb-6">
            <Image
              src="/images/creative-portal-logo-white.png"
              alt="Creative Portal"
              width={180}
              height={48}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-light text-text-primary">
              Welcome!
            </h1>
            <p className="text-3xl font-extrabold text-brand-yellow mt-1">
              {user?.first_name || "Creative"}
            </p>
            <p className="text-text-muted text-sm mt-1">
              Your creative journey starts here
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 justify-center">
          <button
            onClick={() => handleRoleSelect("seeker")}
            className="group relative overflow-hidden bg-obsidian rounded-2xl border border-white/10 p-5 transition-all hover:border-brand-yellow/50 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow flex items-center justify-center shadow-lg shadow-brand-yellow/30">
                <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold text-text-primary">Creative</h2>
                <p className="text-text-muted text-xs">
                  Build portfolio & find jobs
                </p>
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-brand-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            className="group relative overflow-hidden bg-obsidian rounded-2xl border border-white/10 p-5 transition-all hover:border-brand-yellow/50 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow flex items-center justify-center shadow-lg shadow-brand-yellow/30">
                <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold text-text-primary">Employer</h2>
                <p className="text-text-muted text-xs">
                  Post jobs & discover talent
                </p>
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-brand-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-text-muted text-[10px]">
            Creative Portal © 2026
          </p>
        </div>
      </div>
    </div>
  );
}