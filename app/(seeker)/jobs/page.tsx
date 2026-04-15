"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { JobCard } from "@/components/ui/JobCard";
import { JobFeedSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterModal, Filters } from "@/components/Shared/FilterModal";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  discipline?: string;
  jobType?: string;
  location?: string;
  experience?: string;
  createdAt?: string;
  isPinned?: boolean;
}

export default function JobsPage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    jobType: [],
    jobSite: [],
    experience: [],
  });

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/");
      });

      tg.onEvent("mainButtonClicked", () => {
        tg.HapticFeedback.impactOccurred("light");
        fetchJobs(true);
      });
    }

    fetchJobs();

    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.offEvent("mainButtonClicked", fetchJobs);
      }
    };
  }, [tg, router, fetchJobs]);

  useEffect(() => {
    if (tg && !loading) {
      tg.MainButton.setText("Refresh");
      tg.MainButton.show();
    }
  }, [tg, loading]);

  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    tg?.HapticFeedback?.impactOccurred("light");
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filters.jobType.length > 0) {
      const jobTypeStr = job.jobType || "full-time";
      const matchesType = filters.jobType.some(t => 
        t.toLowerCase().includes(jobTypeStr.toLowerCase())
      );
      if (!matchesType) return false;
    }
    
    if (filters.jobSite.length > 0) {
      const jobSiteStr = job.jobType || "onsite";
      const matchesSite = filters.jobSite.some(s => 
        s.toLowerCase().includes(jobSiteStr.toLowerCase())
      );
      if (!matchesSite) return false;
    }
    
    return true;
  });

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg?.showAlert("Application submitted successfully!");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      tg?.showAlert("Failed to submit application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-text-primary mb-6">Browse Jobs</h1>
          <JobFeedSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">Browse Jobs</h1>
          {refreshing && (
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 bg-surface border border-gray-100 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search jobs..."
            />
          </div>
          <button
            onClick={() => {
              tg?.HapticFeedback?.impactOccurred("light");
              setShowFilters(true);
            }}
            className="p-3 bg-surface border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {filteredJobs.length === 0 ? (
          <EmptyState type="jobs" />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
      />
    </div>
  );
}