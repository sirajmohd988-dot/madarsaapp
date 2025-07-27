import React, { useEffect, useState } from "react";
import { formatTo12Hour } from "../../utils/format";
import { usePrayerTimesStore } from "../../store/prayerTimes";
import apiClient from "../../utils/api";

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
console.log("name", name);

const NamazCard: React.FC<NamazCardProps> = React.memo(
  ({ name, color, icon, active, prayerIcons, latitude, longitude }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { prayerTimes, setPrayerTimes } = usePrayerTimesStore();
    const [countdown, setCountdown] = useState("");
    const [progress, setProgress] = useState<{ [key: string]: number }>({
      Fajr: 0,
      Dhuhr: 0,
      Asr: 0,
      Maghrib: 0,
      Isha: 0,
    });

    // Get today's date in DD-MM-YYYY
    const today = new Date();
    const dayName = today.toLocaleDateString(undefined, { weekday: "long" });
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    useEffect(() => {
      if (latitude && longitude) {
        setLoading(true);
        setError(null);
        apiClient
          .get(
            `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
          )
          .then((res) => {
            const data = res.data;
            if (data.code === 200) {
              setPrayerTimes(dateStr, data.data.timings);
            } else {
              setError("Failed to fetch prayer times");
            }
          })
          .catch(() => setError("Failed to fetch prayer times"))
          .finally(() => setLoading(false));
      }
    }, [latitude, longitude, dateStr, setPrayerTimes]);

    useEffect(() => {
      if (!prayerTimes?.times) {
        setProgress({ Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 });
        setCountdown("");
        return;
      }

      const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      const calculateProgress = () => {
        const now = new Date();
        const prayerDateObjects = prayerOrder
          .map((name) => {
            const time = prayerTimes.times[name];
            if (!time) return null;
            const [hour, minute] = time.split(":").map(Number);
            const date = new Date();
            date.setHours(hour, minute, 0, 0);
            return { name, date };
          })
          .filter((p): p is { name: string; date: Date } => p !== null);

        let nextPrayer = prayerDateObjects.find((p) => p.date > now);
        let currentPrayerIndex = -1;

        if (!nextPrayer) {
          const fajrTime = prayerTimes.times["Fajr"];
          if (fajrTime) {
            const [hour, minute] = fajrTime.split(":").map(Number);
            const tomorrowFajr = new Date();
            tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
            tomorrowFajr.setHours(hour, minute, 0, 0);
            nextPrayer = { name: "Fajr", date: tomorrowFajr };
            setProgress({ Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 });
          }
        } else {
          currentPrayerIndex =
            prayerOrder.indexOf(nextPrayer.name) - 1 >= 0
              ? prayerOrder.indexOf(nextPrayer.name) - 1
              : prayerOrder.length - 1;
        }

        if (nextPrayer) {
          const diff = nextPrayer.date.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`Next prayer in ${hours}h ${minutes}m`);

          const newProgress = { ...progress };
          prayerOrder.forEach((prayer, index) => {
            if (index < currentPrayerIndex) {
              newProgress[prayer] = 1; // Completed prayers
            } else if (
              index === currentPrayerIndex &&
              currentPrayerIndex >= 0
            ) {
              const currentPrayer = prayerDateObjects[currentPrayerIndex];
              const currentPrayerTime = currentPrayer.date.getTime();
              const nextPrayerTime = nextPrayer.date.getTime();
              const totalDuration = nextPrayerTime - currentPrayerTime;
              const elapsed = Math.max(0, now.getTime() - currentPrayerTime);
              newProgress[prayer] = Math.min(elapsed / totalDuration, 1);
            } else {
              newProgress[prayer] = 0; // Future prayers
            }
          });
          setProgress(newProgress);
        } else {
          setCountdown("");
        }
      };

      calculateProgress();
      const interval = setInterval(calculateProgress, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }, [prayerTimes]);

    const renderTime = (time: string | undefined) => {
      if (loading) return "...";
      if (!time) return "";
      return formatTo12Hour(time);
    };

   const getArcStyles = (arcPrayerName: string) => {
     const arcLength = 44.06956361285682;
     const progressValue = progress[arcPrayerName] || 0;

     if (progressValue <= 0) {
       return {
         strokeOpacity: 0, // Make invisible to hide round cap
         strokeDasharray: "0 999", // Effectively no arc
       };
     }

     const dashArray = `${arcLength * progressValue} ${
       arcLength * (1 - progressValue)
     }`;
     return {
       strokeOpacity: 1, // Fully visible
       strokeDasharray: dashArray,
     };
   };


    return (
      <div
        className={`rounded-2xl w-full sm:w-[350px] min-h-[304px] flex flex-col justify-between bg-gradient-to-t ${color} ${
          active ? "ring-4 ring-white ring-opacity-60" : ""
        } p-4 pb-0`}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-white font-bold text-lg md:text-xl">
                {name}
              </span>
            </div>
            <span className="flex justify-center items-center bg-white/30 text-white text-xs md:text-sm w-18 h-6 rs-60 rounded-full px-3 py-1">
              {dayName}
            </span>
          </div>
          <div className="text-white text-xs mb-2">
            {loading ? "Calculating..." : countdown}
          </div>
          {error && (
            <div className="text-red-300 text-xs mb-2">
              {error || "Unable to load prayer times. Please try again later."}
            </div>
          )}
        </div>
        <div className="flex gap-5 relative items-center text-white text-xs self-center flex-wrap justify-center">
          {[
            { prayerName: "Fajr", icon: prayerIcons[0] },
            { prayerName: "Dhuhr", icon: prayerIcons[1] },
            { prayerName: "Asr", icon: prayerIcons[2] },
            { prayerName: "Maghrib", icon: prayerIcons[3] },
            { prayerName: "Isha", icon: prayerIcons[4] },
          ].map(({ prayerName, icon }) => (
            <div
              key={prayerName}
              className={`flex flex-col items-center ${
                name === prayerName ? "opacity-120 font-bold" : "opacity-80 font-medium"
              }`}
            >
              <span className="h-6 w-6">{icon}</span>
              <span>{prayerName}</span>
              <span>{renderTime(prayerTimes?.times?.[prayerName])}</span>
            </div>
          ))}
        </div>
        <div className="overflow-clip -mt-4 -mb-1">
          <svg
            viewBox="0 0 300 100"
            className="bg-transparent w-full"
            style={{ width: "125%", position: "relative", right: "40px" }}
          >
            <g>
              <path
                d="M 36.71152662041874 97.17271728241259 A 125 125 0 0 1 61.920723754550636 61.30365793293491"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
              ></path>
              <path
                d="M 36.71152662041874 97.17271728241259 A 125 125 0 0 1 61.920723754550636 61.30365793293491"
                stroke="white"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getArcStyles("Fajr").strokeDasharray}
                strokeOpacity={getArcStyles("Fajr").strokeOpacity}
                style={{
                  transition:
                    "strokeDasharray 0.5s ease, strokeOpacity 0.5s ease",
                }}
              ></path>
            </g>
            <g>
              <path
                d="M 73.81830893528983 50.89727578658062 A 125 125 0 0 1 112.72400666048773 30.687384067934218"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
              ></path>
              <path
                d="M 73.81830893528983 50.89727578658062 A 125 125 0 0 1 112.72400666048773 30.687384067934218"
                stroke="white"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getArcStyles("Dhuhr").strokeDasharray}
                strokeOpacity={getArcStyles("Dhuhr").strokeOpacity}
                style={{
                  transition:
                    "strokeDasharray 0.5s ease, strokeOpacity 0.5s ease",
                }}
              ></path>
            </g>
            <g>
              <path
                d="M 128.07915923850152 26.937102503195433 A 125 125 0 0 1 171.92084076149843 26.93710250319542"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
              ></path>
              <path
                d="M 128.07915923850152 26.937102503195433 A 125 125 0 0 1 171.92084076149843 26.93710250319542"
                stroke="white"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getArcStyles("Asr").strokeDasharray}
                strokeOpacity={getArcStyles("Asr").strokeOpacity}
                style={{
                  transition:
                    "strokeDasharray 0.5s ease, strokeOpacity 0.5s ease",
                }}
              ></path>
            </g>
            <g>
              <path
                d="M 187.27599333951233 30.687384067934246 A 125 125 0 0 1 226.18169106471012 50.89727578658059"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
              ></path>
              <path
                d="M 187.27599333951233 30.687384067934246 A 125 125 0 0 1 226.18169106471012 50.89727578658059"
                stroke="white"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getArcStyles("Maghrib").strokeDasharray}
                strokeOpacity={getArcStyles("Maghrib").strokeOpacity}
                style={{
                  transition:
                    "strokeDasharray 0.5s ease, strokeOpacity 0.5s ease",
                }}
              ></path>
            </g>
            <g>
              <path
                d="M 238.07927624544934 61.30365793293488 A 125 125 0 0 1 263.28847337958126 97.1727172824126"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="11.875"
                fill="none"
                strokeLinecap="round"
              ></path>
              <path
                d="M 238.07927624544934 61.30365793293488 A 125 125 0 0 1 263.28847337958126 97.1727172824126"
                stroke="white"
                strokeWidth="11.875"
                fill="none"
                // strokeLinecap="round"
                strokeDasharray={getArcStyles("Isha").strokeDasharray}
                strokeOpacity={getArcStyles("Isha").strokeOpacity}
                style={{
                  transition:
                    "strokeDasharray 0.5s ease, strokeOpacity 0.5s ease",
                }}
              ></path>
            </g>
          </svg>
        </div>
      </div>
    );
  }
);

export default NamazCard;
