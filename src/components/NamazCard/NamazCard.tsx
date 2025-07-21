import React, {useEffect, useState} from 'react'
import { formatTo12Hour } from "../../utils/format";
import { usePrayerTimesStore } from "../../store/prayerTimes";
import axios from "axios";

interface NamazCardProps {
  name: string;
  color: string;
  icon: React.ReactNode;
  time: string;
  active: boolean;
  prayerIcons: React.ReactNode[];
  latitude?: number | null;
  longitude?: number | null;
}

const NamazCard: React.FC<NamazCardProps> = ({
  name,
  color,
  icon,
  active,
  prayerIcons,
  latitude,
  longitude,
}) => 
  
  {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { prayerTimes, setPrayerTimes } = usePrayerTimesStore();
    const [countdown, setCountdown] = useState("");

    // Get today's date in DD-MM-YYYY
    const today = new Date();
    const dayName = today.toLocaleDateString(undefined, { weekday: "long" });
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    useEffect(() => {
      // Fetch only if times are not available or if the date is old
      const shouldFetch = !prayerTimes || prayerTimes.date !== dateStr;

      if (latitude && longitude && shouldFetch) {
        setLoading(true);
        setError(null);
        axios.get(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}`
        )
          .then((res) => {
            const data = res.data;
            if (data.code === 200) {
              console.log("data namazcard", data.data.timings);
              setPrayerTimes(dateStr, data.data.timings); // persist in store
            } else {
              setError("Failed to fetch prayer times");
            }
          })
          .catch(() => setError("Failed to fetch prayer times"))
          .finally(() => setLoading(false));
      }
    }, [latitude, longitude, dateStr, prayerTimes, setPrayerTimes]);

    useEffect(() => {
      if (!prayerTimes?.times) return;

      const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      const calculateCountdown = () => {
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
        
        if (!nextPrayer) {
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
          const diff = nextPrayer.date.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`Next prayer in ${hours}h ${minutes}m`);
        } else {
          setCountdown("");
        }
      };

      calculateCountdown();
      const interval = setInterval(calculateCountdown, 60000); 

      return () => clearInterval(interval);
    }, [prayerTimes]);

    useEffect(() => {
      if (prayerTimes) {
        console.log("prayer timings", prayerTimes);
      }
    }, [prayerTimes]);

  const renderTime = (time: string | undefined) => {
    if (loading) return "...";
    if (!time) return "";
    return formatTo12Hour(time);
  };
  
 return (
   <div
     className={`rounded-2xl  w-full min-h-[304px] flex flex-col justify-between bg-gradient-to-t ${color} ${
       active ? "ring-4 ring-white ring-opacity-60" : ""
     } p-4 pb-0`}
   >
     {/* Top Row: Icon, Name, Day */}
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
         {icon}
         <span className="text-white font-bold text-lg md:text-xl">{name}</span>
       </div>
       <span className="flex justify-center items-center bg-white/30 text-white text-xs md:text-sm w-18 h-6 rs-60 rounded-full px-3 py-1">
         {dayName}
       </span>
     </div>
     <div className="text-white text-xs mb-2">{loading ? "Calculating..." : countdown}</div>
     {/* Error fallback */}
     {error && (
       <div className="text-red-300 text-xs mb-2">
         {error || "Unable to load prayer times. Please try again later."}
       </div>
     )}
     {/* Prayer Times Row */}
     <div className="flex gap-5 relative top-10 items-center text-white text-xs opacity-80 self-center flex-wrap">
       <div className="flex flex-col items-center">
         <span>{prayerIcons[0]}</span>
         <span>Fajr</span>
         <span>{renderTime(prayerTimes?.times?.Fajr)}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[1]}</span>
         <span>Dhuhr</span>
         <span>{renderTime(prayerTimes?.times?.Dhuhr)}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[2]}</span>
         <span>Asr</span>
         <span>{renderTime(prayerTimes?.times?.Asr)}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[3]}</span>
         <span>Maghrib</span>
         <span>{renderTime(prayerTimes?.times?.Maghrib)}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[4]}</span>
         <span>Isha</span>
         <span>{renderTime(prayerTimes?.times?.Isha)}</span>
       </div>
     </div>
     {/* Arc placeholder */}
     <div className="flex-1  flex items-end justify-center">
       <div className="w-full flex justify-center items-end">
         <svg className="w-full h-[115px]" viewBox="0 0 200 100">
           {/* Background track */}
           <path
             d="M20,100 A80,80 0 0,1 180,100"
             fill="none"
             stroke="white"
             strokeWidth="12"
             strokeDasharray="28 20"
             strokeLinecap="round"
             opacity={0.3}
           />
           {/* Foreground progress (3 of 5 prayers) */}
           <path
             d="M20,100 A80,80 0 0,1 180,100"
             fill="none"
             stroke="white"
             strokeWidth="12"
             strokeDasharray="28 20 28 20 28 999"
             strokeLinecap="round"
             opacity={1}
           />
         </svg>
       </div>
     </div>
   </div>
 );
  }

export default NamazCard 