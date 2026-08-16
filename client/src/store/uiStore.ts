import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  createPostOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setCreatePostOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  createPostOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setCreatePostOpen: (createPostOpen) => set({ createPostOpen }),
}));
