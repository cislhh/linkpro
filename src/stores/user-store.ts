import { create } from "zustand";
import type { Project } from "@/types";

interface UserProfile {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  contact: string | null;
}

interface UserState {
  profile: UserProfile;
  projects: Project[];
  lastFetchTime: number;
  setUserProfile: (profile: UserProfile) => void;
  setProjects: (projects: Project[]) => void;
  setUser: (data: { profile: UserProfile; projects: Project[] }) => void;
  setLastFetchTime: (time: number) => void;
  shouldFetch: (refreshInterval: number) => boolean;
  clear: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    name: null,
    bio: null,
    avatarUrl: null,
    phone: null,
    contact: null,
  },
  projects: [],
  lastFetchTime: 0,

  setUserProfile: (profile) => set({ profile }),
  setProjects: (projects) => set({ projects }),
  setUser: (data) => set(data),

  setLastFetchTime: (time) => set({ lastFetchTime: time }),

  shouldFetch: (refreshInterval) => {
    const { lastFetchTime } = get();
    return Date.now() - lastFetchTime > refreshInterval;
  },

  clear: () => set({
    profile: {
      name: null,
      bio: null,
      avatarUrl: null,
      phone: null,
      contact: null,
    },
    projects: [],
    lastFetchTime: 0,
  }),
}));
