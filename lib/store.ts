"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "seeker" | "employer" | null;

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
    }),
    {
      name: "creative-portal-storage",
    }
  )
);