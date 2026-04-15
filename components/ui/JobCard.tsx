"use client";

import { Building2, DollarSign, Clock, ArrowRight } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
}

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const { tg } = useTelegram();

  const handleApply = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    
    tg?.showConfirm(
      `Apply for "${job.title}"?`,
      (confirmed) => {
        if (confirmed) {
          tg?.HapticFeedback?.notificationOccurred("success");
          onApply(job.id);
        }
      }
    );
  };

  return (
    <div className="bg-tg-secondary/50 backdrop-blur-md rounded-xl p-4 border border-white/10 transition-transform active:scale-[0.98]">
      <h3 className="font-semibold text-tg-text text-lg mb-2">{job.title}</h3>
      
      <div className="flex items-center gap-2 text-tg-hint mb-3">
        <Building2 className="w-4 h-4" />
        <span className="text-sm">{job.employerName}</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1 text-tg-button">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">{job.budget}</span>
        </div>
        <div className="flex items-center gap-1 text-tg-hint">
          <Clock className="w-4 h-4" />
          <span>Due: {job.deadline}</span>
        </div>
      </div>
      
      <p className="text-tg-hint text-sm line-clamp-2 mb-4">{job.description}</p>
      
      <button
        onClick={handleApply}
        className="w-full py-2 bg-tg-button text-tg-button-text rounded-lg font-medium flex items-center justify-center gap-2"
      >
        Apply Now
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}