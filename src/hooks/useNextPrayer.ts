import { useState, useEffect } from 'react';
import { usePrayerTimesStore } from '../store/prayerTimes';

export function useNextPrayer() {
  const { prayerTimes } = usePrayerTimesStore();
  const [currentPrayerName, setCurrentPrayerName] = useState<string | null>(null);

  useEffect(() => {
    if (!prayerTimes?.times) {
      setCurrentPrayerName(null);
      return;
    }

    const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    const findCurrentPrayer = () => {
      const now = new Date();
      const prayerDateObjects = prayerOrder.map(name => {
        const time = prayerTimes.times[name];
        if (!time) return null;
        const [hour, minute] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return { name, date };
      }).filter((p): p is { name: string; date: Date } => p !== null);

      // Find the current prayer: the last prayer whose time is <= now
      let currentPrayer = null;
      for (let i = prayerDateObjects.length - 1; i >= 0; i--) {
        if (now >= prayerDateObjects[i].date) {
          currentPrayer = prayerDateObjects[i];
          break;
        }
      }
      // If before Fajr, highlight Isha (last prayer of previous day)
      if (!currentPrayer && prayerDateObjects.length > 0) {
        currentPrayer = prayerDateObjects[prayerDateObjects.length - 1];
      }
      setCurrentPrayerName(currentPrayer ? currentPrayer.name : null);
    };

    findCurrentPrayer();
    const interval = setInterval(findCurrentPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return currentPrayerName;
} 