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
  setUserProfile: (profile: UserProfile) => void;
  setProjects: (projects: Project[]) => void;
  setUser: (data: { profile: UserProfile; projects: Project[] }) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    name: null,
    bio: null,
    avatarUrl: null,
    phone: null,
    contact: null,
  },
  projects: [],

  setUserProfile: (profile) => set({ profile }),
  setProjects: (projects) => set({ projects }),
  setUser: (data) => set(data),
}));
