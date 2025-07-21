import { useState, useEffect } from 'react';
import { usePrayerTimesStore } from '../store/prayerTimes';

export function useNextPrayer() {
  const { prayerTimes } = usePrayerTimesStore();
  const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);

  useEffect(() => {
    if (!prayerTimes?.times) {
      setNextPrayerName(null);
      return;
    }

    const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    const findNextPrayer = () => {
      const now = new Date();
      
      const prayerDateObjects = prayerOrder.map(name => {
        const time = prayerTimes.times[name];
        if (!time) return null;
        const [hour, minute] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return { name, date };
      }).filter((p): p is { name: string; date: Date } => p !== null);
        
      let nextPrayer = prayerDateObjects.find(p => p.date > now);
      
      if (!nextPrayer) { // After Isha, next prayer is Fajr tomorrow
        const fajrTime = prayerTimes.times["Fajr"];
        if (fajrTime) {
          const [hour, minute] = fajrTime.split(':').map(Number);
          const tomorrowFajr = new Date();
          tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
          tomorrowFajr.setHours(hour, minute, 0, 0);
          nextPrayer = { name: "Fajr", date: tomorrowFajr };
        }
      }

      if (nextPrayer) {
        setNextPrayerName(nextPrayer.name);
      }
    };

    findNextPrayer();
    const interval = setInterval(findNextPrayer, 60000); 

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return nextPrayerName;
} 