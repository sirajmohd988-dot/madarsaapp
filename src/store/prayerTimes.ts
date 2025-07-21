import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoredPrayerTimes {
  date: string;
  times: Record<string, string>;
}

export interface PrayerTimesState {
  prayerTimes: StoredPrayerTimes | null;
  setPrayerTimes: (date: string, times: Record<string, string>) => void;
}

export const usePrayerTimesStore = create<PrayerTimesState>()(
  persist(
    (set) => ({
      prayerTimes: null,
      setPrayerTimes: (date, times) => set({ prayerTimes: { date, times } }),
    }),
    {
      name: 'prayer-times-storage', // key in localStorage
    }
  )
);
