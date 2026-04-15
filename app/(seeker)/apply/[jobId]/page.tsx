"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Minus, Info, MessageCircle, Building2, DollarSign, Briefcase, MapPin } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const applySchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters").max(1000),
  portfolioLinks: z.array(z.object({
    url: z.string().url("Invalid URL"),
  })).max(5, "Maximum 5 links allowed"),
  telegramUsername: z.string().optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  employerName: string;
  deadline: string;
  jobType?: string;
  location?: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const { tg, user } = useTelegram();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: "",
      portfolioLinks: [{ url: "" }],
      telegramUsername: user?.username || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolioLinks",
  });

  const coverLetter = watch("coverLetter", "");
  const maxLength = 1000;
  const charactersLeft = maxLength - coverLetter.length;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }

    fetchJob();
  }, [tg, router, params.jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.jobs?.[0] || null);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    if (!tg) return;

    tg.HapticFeedback.notificationOccurred("success");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: params.jobId,
          telegramId: user?.id,
          ...data,
        }),
      });

      if (response.ok) {
        tg.showAlert("Application submitted successfully! We'll be in touch soon.");
        router.push("/jobs");
      } else {
        tg.showAlert("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      tg.showAlert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (tg) {
      tg.MainButton.setText("Submit Application");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    }

    return () => {
      tg?.MainButton.hide();
    };
  }, [tg, handleSubmit]);

  const formatJobType = (type?: string) => {
    if (type === "remote") return "Remote";
    if (type === "hybrid") return "Hybrid";
    if (type === "onsite") return "On-site";
    return "Full-time";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-light-text-muted mb-4">Job not found</p>
          <button 
            onClick={() => router.push("/jobs")}
            className="text-brand-yellow font-bold"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-light-border rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-light-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-light-text-primary">Job Details</h1>
        </div>

        <div className="px-4 pb-20">
          <div className="bg-black rounded-2xl p-5 mb-4 border border-white/10">
            <h2 className="font-bold text-white text-lg mb-2">{job.title}</h2>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Building2 className="w-4 h-4" />
              <span>{job.employerName}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <DollarSign className="w-5 h-5 text-brand-yellow mx-auto mb-1" />
                <p className="text-brand-yellow font-bold text-sm">{job.budget}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Briefcase className="w-5 h-5 text-brand-yellow mx-auto mb-1" />
                <p className="text-white text-xs">{formatJobType(job.jobType)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <MapPin className="w-5 h-5 text-brand-yellow mx-auto mb-1" />
                <p className="text-white text-xs">{job.location || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-5 border border-light-border mb-4">
            <h3 className="font-bold text-light-text-primary mb-3">Description</h3>
            <p className="text-light-text-secondary text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="bg-light-surface rounded-2xl p-5 border border-light-border">
            <label className="font-bold text-light-text-primary block mb-3">
              Cover Letter
            </label>
            <div className="relative">
              <textarea
                {...register("coverLetter")}
                className="w-full rounded-xl border border-light-border p-3 h-32 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow resize-none text-light-text-primary bg-light-bg placeholder:text-light-text-muted text-sm"
                placeholder="Tell the employer why you're the perfect fit..."
              />
              <span className={`absolute bottom-2 right-3 text-xs ${charactersLeft < 100 ? "text-red-500" : "text-light-text-muted"}`}>
                {charactersLeft} left
              </span>
            </div>
            {errors.coverLetter && (
              <p className="text-red-500 text-xs mt-1">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-yellow mt-0.5 flex-shrink-0" />
              <p className="text-light-text-muted text-xs">
                Make sure your Telegram username is set in Settings → Privacy → Telegram Username.
              </p>
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-4 border border-light-border mt-4">
            <label className="font-bold text-light-text-primary block mb-3">
              Telegram Username
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-brand-yellow" />
              <input
                {...register("telegramUsername")}
                className="w-full pl-9 p-2.5 rounded-xl border border-light-border focus:ring-2 focus:ring-brand-yellow text-light-text-primary bg-light-bg placeholder:text-light-text-muted text-sm"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-4 border border-light-border mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-light-text-primary text-sm">
                Portfolio Links
              </label>
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    tg?.HapticFeedback?.impactOccurred("light");
                    append({ url: "" });
                  }}
                  className="flex items-center gap-1 text-brand-yellow text-xs font-bold"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`portfolioLinks.${index}.url` as const)}
                    className="flex-1 p-2.5 rounded-xl border border-light-border focus:ring-2 focus:ring-brand-yellow text-light-text-primary bg-light-bg placeholder:text-light-text-muted text-sm"
                    placeholder="https://dribbble.com/yourwork"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        tg?.HapticFeedback?.impactOccurred("light");
                        remove(index);
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-light-surface p-4 rounded-2xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-yellow"></div>
                <span className="text-light-text-primary text-sm">Submitting...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}