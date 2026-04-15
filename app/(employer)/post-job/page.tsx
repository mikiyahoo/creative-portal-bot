"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Send, Sparkles, Globe, Home, Building2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  discipline: z.string().min(1, "Select a discipline"),
  budget: z.string().min(1, "Budget is required"),
  jobType: z.enum(["remote", "hybrid", "onsite"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  deadline: z.string().min(1, "Deadline is required"),
}).refine((data) => {
  const deadline = new Date(data.deadline);
  return deadline > new Date();
}, {
  message: "Deadline must be in the future",
  path: ["deadline"],
});

type JobFormData = z.infer<typeof jobSchema>;

const DISCIPLINES = [
  { id: "ui-ux", label: "UI/UX Design" },
  { id: "branding", label: "Branding & Identity" },
  { id: "illustration", label: "Illustration" },
  { id: "motion", label: "Motion Graphics" },
  { id: "3d", label: "3D Modeling" },
  { id: "video", label: "Video Production" },
  { id: "web", label: "Web Development" },
  { id: "photography", label: "Photography" },
];

export default function PostJobPage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [broadcastToChannel, setBroadcastToChannel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      discipline: "",
      budget: "",
      jobType: "remote",
      description: "",
      deadline: "",
    },
  });

  const watchedData = watch();

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }
  }, [tg, router]);

  const onSubmit = async (data: JobFormData) => {
    if (!tg) return;
    
    tg.HapticFeedback.impactOccurred("medium");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          employerTelegramId: user?.id,
          isPinned,
          broadcastToChannel,
        }),
      });

      if (response.ok) {
        tg.HapticFeedback.notificationOccurred("success");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!tg) return;

    if (!isPreview) {
      tg.MainButton.setText("Preview");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        tg.HapticFeedback?.impactOccurred("light");
        setIsPreview(true);
      });
    } else {
      tg.MainButton.setText("Post Job");
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    }

    return () => {
      tg.MainButton.hide();
    };
  }, [isPreview, tg, handleSubmit]);

  if (isPreview) {
    const jobTypeLabels = {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "On-site",
    };

    return (
      <div className="min-h-screen bg-light-bg p-4 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                tg?.HapticFeedback?.impactOccurred("light");
                setIsPreview(false);
              }}
              className="p-2 hover:bg-light-border rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-light-text-primary" />
            </button>
            <h1 className="text-xl font-bold text-light-text-primary">Preview</h1>
            <div className="w-9" />
          </div>

          <div className="bg-light-surface rounded-2xl p-6 border border-light-border">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-light-text-primary">
                {watchedData.title}
              </h2>
              {isPinned && (
                <span className="bg-brand-yellow/20 text-brand-yellow text-xs px-2 py-1 rounded-full">
                  Pinned
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-light-text-muted mb-4">
              <span className="px-3 py-1 bg-brand-yellow/10 rounded-full text-brand-yellow">
                {DISCIPLINES.find(d => d.id === watchedData.discipline)?.label || watchedData.discipline}
              </span>
              <span className="flex items-center gap-1">
                {watchedData.jobType === "remote" && <Globe className="w-4 h-4" />}
                {watchedData.jobType === "hybrid" && <Home className="w-4 h-4" />}
                {watchedData.jobType === "onsite" && <Building2 className="w-4 h-4" />}
                {jobTypeLabels[watchedData.jobType as keyof typeof jobTypeLabels]}
              </span>
            </div>

            <p className="text-brand-yellow font-bold text-lg mb-4">
              {watchedData.budget}
            </p>
            
            <p className="text-light-text-secondary whitespace-pre-wrap mb-4">{watchedData.description}</p>
            
            <div className="pt-4 border-t border-light-border flex justify-between text-sm">
              <span className="text-light-text-muted">Deadline: {watchedData.deadline}</span>
              {broadcastToChannel && (
                <span className="text-brand-yellow">Posted to Channel</span>
              )}
            </div>
          </div>

          <p className="text-light-text-muted text-sm text-center mt-4">
            This is how your job post will appear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-light-border rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-light-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-light-text-primary">Post a Job</h1>
        </div>

        <form className="space-y-5">
          <div className="bg-light-surface rounded-2xl p-5 border border-light-border space-y-4">
            <h2 className="font-bold text-light-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-yellow" />
              Job Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Job Title
              </label>
              <input
                {...register("title")}
                className="w-full p-3 bg-light-bg border border-light-border rounded-xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                placeholder="e.g., Senior UI Designer"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Creative Discipline
              </label>
              <select
                {...register("discipline")}
                className="w-full p-3 bg-light-bg border border-light-border rounded-xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="">Select a discipline</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
              {errors.discipline && (
                <p className="text-red-500 text-sm mt-1">{errors.discipline.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Budget Range (ETB)
              </label>
              <input
                {...register("budget")}
                className="w-full p-3 bg-light-bg border border-light-border rounded-xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                placeholder="e.g., $500 - $1,000"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Job Type
              </label>
              <div className="flex gap-2">
                {(["remote", "hybrid", "onsite"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("jobType", type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      watchedData.jobType === type
                        ? "bg-brand-yellow text-black"
                        : "bg-light-bg border border-light-border text-light-text-primary"
                    }`}
                  >
                    {type === "remote" && <Globe className="w-4 h-4 inline mr-1" />}
                    {type === "hybrid" && <Home className="w-4 h-4 inline mr-1" />}
                    {type === "onsite" && <Building2 className="w-4 h-4 inline mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-5 border border-light-border space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full p-3 bg-light-bg border border-light-border rounded-xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow h-40 resize-none"
                placeholder="Describe the role, requirements, and what makes this opportunity exciting..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary mb-2">
                Deadline
              </label>
              <input
                {...register("deadline")}
                type="date"
                className="w-full p-3 bg-light-bg border border-light-border rounded-xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              {errors.deadline && (
                <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-5 border border-light-border space-y-4">
            <h2 className="font-bold text-light-text-primary">Premium Features</h2>
            
            <label className="flex items-center justify-between p-3 bg-light-bg rounded-xl cursor-pointer">
              <div>
                <span className="text-light-text-primary font-medium">Pin to Top</span>
                <p className="text-light-text-muted text-xs">Keep your job at the top of the feed</p>
              </div>
              <div
                onClick={() => {
                  tg?.HapticFeedback?.impactOccurred("light");
                  setIsPinned(!isPinned);
                }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isPinned ? "bg-brand-yellow" : "bg-light-border"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPinned ? "translate-x-6" : "translate-x-0.5"
                } mt-0.5`} />
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-light-bg rounded-xl cursor-pointer">
              <div>
                <span className="text-light-text-primary font-medium">Broadcast to Channel</span>
                <p className="text-light-text-muted text-xs">Share to @CreativePortalJobs</p>
              </div>
              <div
                onClick={() => {
                  tg?.HapticFeedback?.impactOccurred("light");
                  setBroadcastToChannel(!broadcastToChannel);
                }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  broadcastToChannel ? "bg-brand-yellow" : "bg-light-border"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  broadcastToChannel ? "translate-x-6" : "translate-x-0.5"
                } mt-0.5`} />
              </div>
            </label>
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-light-surface p-6 rounded-2xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow"></div>
                <span className="text-light-text-primary">Posting job...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}