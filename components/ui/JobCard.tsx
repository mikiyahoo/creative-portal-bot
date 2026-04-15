"use client";

import { useRouter } from "next/navigation";
import { Building2, MapPin, Briefcase, BarChart, DollarSign, Clock } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

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
  featured?: boolean;
}

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const router = useRouter();
  const { tg } = useTelegram();

  const handleViewDetails = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    router.push(`/apply/${job.id}`);
  };

  const handleApply = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    
    tg?.showConfirm(
      `Apply for "${job.title}"?`,
      (confirmed) => {
        if (confirmed) {
          tg?.HapticFeedback?.notificationOccurred("success");
          onApply?.(job.id);
        }
      }
    );
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const formatJobType = (type?: string) => {
    if (type === "remote") return "Remote";
    if (type === "hybrid") return "Hybrid";
    if (type === "onsite") return "On-site";
    return "Full-time";
  };

  const formatDiscipline = (disc?: string) => {
    const map: Record<string, string> = {
      "ui-ux": "UI/UX Design",
      "branding": "Branding",
      "illustration": "Illustration",
      "motion": "Motion Graphics",
      "3d": "3D Modeling",
      "video": "Video Production",
      "web": "Web Development",
      "photography": "Photography",
    };
    return map[disc || ""] || disc || "General";
  };

  const isFeatured = job.isPinned || job.featured;

  return (
    <div className={`
      relative bg-obsidian rounded-3xl p-6 
      border border-white/10 
      shadow-[inset_0_1px_1px_rgba(255,184,0,0.05)]
      hover:border-brand-yellow/30 hover:shadow-[0_0_20px_rgba(255,184,0,0.15)]
      transition-all duration-300
      ${isFeatured ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brand-yellow before:rounded-l-3xl' : ''}
    `}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-extrabold text-text-primary text-lg uppercase tracking-wide leading-tight">
          {job.title}
        </h3>
        {isFeatured && (
          <span className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow text-xs font-bold rounded-full border border-brand-yellow/20">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-text-muted text-sm mb-4">
        <Building2 className="w-4 h-4 text-brand-yellow" />
        <span className="font-medium text-text-secondary">{job.employerName}</span>
        <span className="text-text-muted">•</span>
        <span className="text-text-muted">{getTimeAgo(job.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-xs font-bold rounded-full border border-brand-yellow/20">
          {formatDiscipline(job.discipline)}
        </span>
        {job.jobType && (
          <span className="px-3 py-1 bg-white/5 text-text-muted text-xs font-medium rounded-full">
            {formatJobType(job.jobType)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-4">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-full bg-brand-yellow/10">
            <DollarSign className="w-3.5 h-3.5 text-brand-yellow" />
          </div>
          <span className="font-bold text-brand-yellow">{job.budget}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-full bg-brand-yellow/10">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
            </div>
            <span>{job.location}</span>
          </div>
        )}
        {job.experience && (
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-full bg-brand-yellow/10">
              <BarChart className="w-3.5 h-3.5 text-brand-yellow" />
            </div>
            <span>{job.experience}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-full bg-brand-yellow/10">
            <Briefcase className="w-3.5 h-3.5 text-brand-yellow" />
          </div>
          <span>{formatJobType(job.jobType)}</span>
        </div>
      </div>

      <p className="text-text-muted text-sm line-clamp-2 mb-5">{job.description}</p>

      <div className="flex gap-3">
        <button
          onClick={handleViewDetails}
          className="flex-1 py-3 border-2 border-brand-yellow/50 text-brand-yellow rounded-2xl font-extrabold text-sm hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all"
        >
          View Details
        </button>
        {onApply && (
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-brand-yellow text-black rounded-2xl font-extrabold text-sm hover:bg-brand-yellow/90 active:scale-95 transition-all"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}