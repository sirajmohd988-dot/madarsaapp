import React, {useEffect, useState} from 'react'

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
  time,
  active,
  prayerIcons,
  latitude,
  longitude,
}) => 
  
  {
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 200) {
              console.log("data namazcard", data.data.timings);
              setPrayerTimes(data.data.timings); // this is async
            } else {
              setError("Failed to fetch prayer times");
            }
          })

          .catch(() => setError("Failed to fetch prayer times"))
          .finally(() => setLoading(false));
      }
    }, [latitude, longitude, dateStr]);

    useEffect(() => {
      if (prayerTimes) {
        console.log("prayer timings", prayerTimes);
      }
    }, [prayerTimes]);

  
  
 return (
   <div
     className={`rounded-2xl shadow-md w-full max-w-[350px] min-h-[304px] flex flex-col justify-between bg-gradient-to-t ${color} ${
       active ? "ring-4 ring-white ring-opacity-60" : ""
     } p-4`}
   >
     {/* Top Row: Icon, Name, Day */}
     <div className="flex items-center justify-between mb-2">
       <div className="flex items-center gap-2">
         {icon}
         <span className="text-white font-bold text-lg md:text-xl">{name}</span>
       </div>
       <span className="flex justify-center items-center bg-white/30 text-white text-xs md:text-sm w-18 h-6 rs-60 rounded-full px-3 py-1">
         Sunday
       </span>
     </div>
     <div className="text-white text-xs mb-2">Next prayer in 1h 29m</div>
     {/* Prayer Times Row */}
     <div className="flex gap-5 relative top-10 items-center text-white text-xs opacity-80 self-center flex-wrap">
       <div className="flex flex-col items-center">
         <span>{prayerIcons[0]}</span>
         <span>Fajr</span>
         <span>{prayerTimes?.Fajr}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[1]}</span>
         <span>Dhuhr</span>
         <span>{prayerTimes?.Dhuhr}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[2]}</span>
         <span>Asr</span>
         <span>{prayerTimes?.Asr}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[3]}</span>
         <span>Maghrib</span>
         <span>{prayerTimes?.Maghrib}</span>
       </div>
       <div className="flex flex-col items-center">
         <span>{prayerIcons[4]}</span>
         <span>Isha</span>
         <span>{prayerTimes?.Isha}</span>
       </div>
     </div>
     {/* Arc placeholder */}
     <div className="flex-1 flex items-end justify-center mt-4">
       <div className="w-48 h-16 bg-white bg-opacity-10 rounded-b-full" />
     </div>
   </div>
 );
  }

export default NamazCard 