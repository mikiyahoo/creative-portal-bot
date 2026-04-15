"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Palette, Mail, Link as LinkIcon } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  portfolioLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SKILLS = [
  "Graphic Design",
  "UI/UX Design",
  "Illustration",
  "Motion Graphics",
  "Video Editing",
  "Photography",
  "3D Modeling",
  "Web Development",
];

export default function ProfilePage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.first_name || "",
      bio: "",
      skills: [],
      portfolioLink: "",
    },
  });

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }
  }, [tg, router]);

  const toggleSkill = (skill: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!tg) return;
    
    tg.HapticFeedback.impactOccurred("medium");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          skills: selectedSkills,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg.HapticFeedback.notificationOccurred("success");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred("light");
      }
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    if (step === 3 && tg) {
      tg.MainButton.setText("Save Profile");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    } else if (tg) {
      tg.MainButton.hide();
    }
  }, [step, tg, handleSubmit]);

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
          <h1 className="text-xl font-bold text-tg-text">Create Profile</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-tg-button" : "bg-tg-secondary"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tg-text mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
                  <input
                    {...register("fullName")}
                    className="w-full pl-10 p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
                    placeholder="Your name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-tg-text mb-2">
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  className="w-full p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button h-32"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 bg-tg-button text-tg-button-text rounded-lg font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tg-text mb-4">
                Select Your Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? "bg-tg-button text-tg-button-text"
                        : "bg-tg-secondary text-tg-text"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length === 0 && (
                <p className="text-red-500 text-sm">Select at least one skill</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 bg-tg-secondary text-tg-text rounded-lg font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={selectedSkills.length === 0}
                  className="flex-1 py-3 bg-tg-button text-tg-button-text rounded-lg font-medium disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tg-text mb-2">
                  Portfolio Link (optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
                  <input
                    {...register("portfolioLink")}
                    className="w-full pl-10 p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                {errors.portfolioLink && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.portfolioLink.message}
                  </p>
                )}
              </div>

              <div className="bg-tg-secondary rounded-lg p-4">
                <h3 className="font-medium text-tg-text mb-2">Profile Preview</h3>
                <p className="text-tg-text">{user?.first_name}</p>
                <p className="text-tg-hint text-sm mt-1">
                  {selectedSkills.join(", ")}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 bg-tg-secondary text-tg-text rounded-lg font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          )}

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