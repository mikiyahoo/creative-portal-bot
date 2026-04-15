"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAppStore } from "@/lib/store";

export default function EmployerDashboard() {
  const router = useRouter();
  const { tg } = useTelegram();
  const { role } = useAppStore();

  useEffect(() => {
    if (role !== "employer") {
      router.push("/");
      return;
    }

    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/");
      });
    }
  }, [tg, router, role]);

  return (
    <div className="min-h-screen bg-tg-bg p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-tg-text mb-6">Employer Dashboard</h1>

        <button
          onClick={() => {
            if (tg?.HapticFeedback) {
              tg.HapticFeedback.impactOccurred("medium");
            }
            router.push("/post-job");
          }}
          className="w-full p-6 bg-tg-button rounded-xl flex items-center gap-4 text-tg-button-text"
        >
          <div className="p-3 bg-white/20 rounded-lg">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold">Post a New Job</h2>
            <p className="text-sm opacity-80">Create a new job listing</p>
          </div>
        </button>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-tg-text mb-4">Your Active Jobs</h2>
          <div className="bg-tg-secondary rounded-xl p-8 text-center">
            <Briefcase className="w-12 h-12 text-tg-hint mx-auto mb-3" />
            <p className="text-tg-hint">No active jobs yet</p>
            <p className="text-tg-hint text-sm">Post your first job to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}