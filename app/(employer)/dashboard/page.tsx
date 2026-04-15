"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAppStore } from "@/lib/store";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  status: "active" | "draft" | "expired";
  applicants: number;
  discipline?: string;
  jobType?: string;
  isPinned?: boolean;
}

type TabType = "active" | "drafts" | "expired";

export default function EmployerDashboard() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const { role } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchJobs();
  }, [tg, router, role]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?employerId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "active") return job.status === "active";
    if (activeTab === "drafts") return job.status === "draft";
    if (activeTab === "expired") return job.status === "expired";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-500/20 text-green-500",
      draft: "bg-yellow-500/20 text-yellow-500",
      expired: "bg-red-500/20 text-red-500",
    };
    const labels = {
      active: "Active",
      draft: "Draft",
      expired: "Expired",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "active", label: "Active", icon: <CheckCircle className="w-4 h-4" /> },
    { key: "drafts", label: "Drafts", icon: <Clock className="w-4 h-4" /> },
    { key: "expired", label: "Expired", icon: <XCircle className="w-4 h-4" /> },
  ];

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
          className="w-full p-5 bg-gradient-to-r from-tg-button to-tg-button/80 rounded-xl flex items-center gap-4 text-tg-button-text shadow-lg"
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
          <div className="flex gap-2 mb-4 bg-tg-secondary/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tg?.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred("light");
                  }
                  setActiveTab(tab.key);
                }}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-tg-button text-tg-button-text"
                    : "text-tg-text"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-tg-secondary/50 animate-pulse rounded-xl p-4 h-24" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-tg-secondary/30 backdrop-blur-md rounded-xl p-8 text-center border border-white/10">
              <Briefcase className="w-12 h-12 text-tg-hint mx-auto mb-3" />
              <p className="text-tg-text font-medium">
                {activeTab === "active" && "No active jobs"}
                {activeTab === "drafts" && "No draft jobs"}
                {activeTab === "expired" && "No expired jobs"}
              </p>
              {activeTab === "active" && (
                <p className="text-tg-hint text-sm mt-2">
                  Post your first job to find talent
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    if (tg?.HapticFeedback) {
                      tg.HapticFeedback.impactOccurred("light");
                    }
                    router.push(`/dashboard/${job.id}/applicants`);
                  }}
                  className="w-full text-left bg-tg-secondary/50 backdrop-blur-md rounded-xl p-4 border border-white/10 transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-tg-text">{job.title}</h3>
                    {job.isPinned && (
                      <span className="text-xs bg-tg-button/20 text-tg-button px-2 py-0.5 rounded">
                        Pinned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-tg-hint mb-3">
                    <span>{job.budget}</span>
                    <span>{job.discipline || "General"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(job.status)}
                    <div className="flex items-center gap-1 text-tg-hint text-sm">
                      <Users className="w-4 h-4" />
                      <span>{job.applicants} Applicants</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}