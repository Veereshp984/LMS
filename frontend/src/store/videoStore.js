import { create } from "zustand";

const useVideoStore = create((set) => ({
  currentVideoId: null,
  subjectId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  nextVideoId: null,
  prevVideoId: null,
  setVideoContext: (payload) => set({ ...payload }),
  setPlayback: (payload) => set((state) => ({ ...state, ...payload })),
}));

export default useVideoStore;
