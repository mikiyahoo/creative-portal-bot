"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Send } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  budget: z.string().min(1, "Budget is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  deadline: z.string().min(1, "Deadline is required"),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      budget: "",
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
    if (tg && !isPreview) {
      tg.MainButton.setText("Preview");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred("light");
        }
        setIsPreview(true);
      });
    } else if (tg && isPreview) {
      tg.MainButton.setText("Post Job");
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    }
  }, [isPreview, tg, handleSubmit]);

  if (isPreview) {
    return (
      <div className="min-h-screen bg-tg-bg p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (tg?.HapticFeedback) {
                  tg.HapticFeedback.impactOccurred("light");
                }
                setIsPreview(false);
              }}
              className="p-2 hover:bg-tg-secondary rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-tg-text" />
            </button>
            <h1 className="text-xl font-bold text-tg-text">Preview</h1>
            <div className="w-9" />
          </div>

          <div className="bg-tg-secondary rounded-xl p-6">
            <h2 className="text-2xl font-bold text-tg-text mb-2">
              {watchedData.title}
            </h2>
            <p className="text-tg-button font-semibold text-lg mb-4">
              {watchedData.budget}
            </p>
            <p className="text-tg-text whitespace-pre-wrap">{watchedData.description}</p>
            <div className="mt-4 pt-4 border-t border-tg-hint">
              <p className="text-tg-hint text-sm">
                Deadline: {watchedData.deadline}
              </p>
            </div>
          </div>

          <p className="text-tg-hint text-sm text-center mt-4">
            This is how your job post will appear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-tg-secondary rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-tg-text" />
          </button>
          <h1 className="text-xl font-bold text-tg-text">Post a Job</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tg-text mb-2">
              Job Title
            </label>
            <input
              {...register("title")}
              className="w-full p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
              placeholder="e.g., Logo Design for Startup"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-tg-text mb-2">
              Budget/Salary
            </label>
            <input
              {...register("budget")}
              className="w-full p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
              placeholder="e.g., $500 - $1000"
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-tg-text mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button h-40"
              placeholder="Describe the job requirements..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-tg-text mb-2">
              Deadline
            </label>
            <input
              {...register("deadline")}
              type="date"
              className="w-full p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tg-button"></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}