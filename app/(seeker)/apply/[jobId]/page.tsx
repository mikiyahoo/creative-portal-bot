"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Minus, Info, MessageCircle } from "lucide-react";
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
        setJob(data.jobs?.[0] || data);
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
      }
    } catch (error) {
      console.error("Error submitting application:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-text-muted">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-xl font-extrabold text-text-primary uppercase">Apply Now</h1>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-white/5 mb-6">
          <h2 className="font-extrabold text-text-primary text-lg uppercase mb-2">{job.title}</h2>
          <p className="text-text-muted text-sm mb-2">{job.employerName}</p>
          <p className="text-brand-yellow font-bold">{job.budget}</p>
        </div>

        <form className="space-y-6">
          <div className="bg-surface rounded-3xl p-6 border border-white/5">
            <label className="font-extrabold text-text-primary block mb-2 uppercase">
              Cover Letter
            </label>
            <div className="relative">
              <textarea
                {...register("coverLetter")}
                className="w-full rounded-2xl border border-white/10 p-4 h-40 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow resize-none text-text-primary bg-background placeholder:text-text-muted"
                placeholder="Tell the employer why you're the perfect fit for this role..."
              />
              <span className={`absolute bottom-3 right-4 text-xs ${charactersLeft < 100 ? "text-red-500" : "text-text-muted"}`}>
                {charactersLeft} Characters left
              </span>
            </div>
            {errors.coverLetter && (
              <p className="text-red-500 text-sm mt-1">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-yellow mt-0.5" />
              <div>
                <p className="font-bold text-brand-yellow text-sm">Privacy Tip</p>
                <p className="text-text-muted text-xs mt-1">
                  Make sure your Telegram username is set and your privacy settings allow others to see it. Go to Settings → Privacy → Telegram Username.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-white/5">
            <label className="font-extrabold text-text-primary block mb-4 uppercase">
              Your Telegram Username
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-brand-yellow" />
              <input
                {...register("telegramUsername")}
                className="w-full pl-10 p-3 rounded-2xl border border-white/10 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow text-text-primary bg-background placeholder:text-text-muted"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <label className="font-extrabold text-text-primary uppercase">
                Portfolio Links
              </label>
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    tg?.HapticFeedback?.impactOccurred("light");
                    append({ url: "" });
                  }}
                  className="flex items-center gap-1 text-brand-yellow text-sm font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Add more
                </button>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`portfolioLinks.${index}.url` as const)}
                    className="flex-1 p-3 rounded-2xl border border-white/10 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow text-text-primary bg-background placeholder:text-text-muted"
                    placeholder="https://dribbble.com/yourwork"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        tg?.HapticFeedback?.impactOccurred("light");
                        remove(index);
                      }}
                      className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.portfolioLinks && (
              <p className="text-red-500 text-sm mt-2">{errors.portfolioLinks.message || errors.portfolioLinks.root?.message}</p>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
              <div className="bg-surface p-6 rounded-3xl flex items-center gap-3 border border-white/10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow"></div>
                <span className="text-text-primary font-bold">Submitting...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}