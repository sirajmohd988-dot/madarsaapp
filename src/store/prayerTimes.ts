import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PrayerTimesState {
  prayerTimes: Record<string, string> | null;
  setPrayerTimes: (times: Record<string, string>) => void;
}

export const usePrayerTimesStore = create<PrayerTimesState>()(
  persist(
    (set) => ({
      prayerTimes: null,
      setPrayerTimes: (times) => set({ prayerTimes: times }),
    }),
    {
      name: 'prayer-times-storage', // key in localStorage
    }
  )
);
