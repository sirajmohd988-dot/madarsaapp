import LocationBar from "./components/LocationBar/LocationBar";
import NamazCard from "./components/NamazCard/NamazCard";
import "./App.css";
import maktabImg from "./assets/Maktab@2x.png";
import DuaImg from "./assets/Dua@3x.png";
import More from "./assets/More.png";
import {
  CloudMoon,
  Sun,
  CloudSun,
  SunHorizon,
  MoonStars,
  HouseSimple,
  BookOpen,
} from "phosphor-react";
import useGeolocation from "./hooks/useGeolocation";
import { useNextPrayer } from "./hooks/useNextPrayer";
import { usePrayerTimesStore } from "./store/prayerTimes";
import { formatTo12Hour } from "./utils/format";

const prayerIcons = [
  <CloudMoon size={24} className="text-white" />,
  <Sun size={24} className="text-white" />,
  <CloudSun size={24} className="text-white" />,
  <SunHorizon size={24} className="text-white" />,
  <MoonStars size={24} className="text-white" />,
];

function App() {
  const { city, country, latitude, longitude, loading, error } =
    useGeolocation();
  const nextPrayerName = useNextPrayer();
  const { prayerTimes } = usePrayerTimesStore();

  const prayers = [
    {
      name: "Fajr",
      color: "from-[#D6BDFF] to-[#3F7CE6]",
      // color: "from-[#811DEC] to-[#381079]",
      icon: <CloudMoon size={24} className="text-white" />,
      time: prayerTimes?.times?.Fajr
        ? formatTo12Hour(prayerTimes.times.Fajr)
        : "",
      active: nextPrayerName === "Fajr",
    },
    {
      name: "Dhuhr",
      // color: "from-[#D6BDFF] to-[#3F7CE6]",
      color: "from-[#FFE392] to-[#E77715]",
      icon: <Sun size={24} className="text-white" />,
      time: prayerTimes?.times?.Dhuhr
        ? formatTo12Hour(prayerTimes.times.Dhuhr)
        : "",
      active: nextPrayerName === "Dhuhr",
    },
    {
      name: "Asr",
      color: "from-[#C9F3B3] to-[#006C5E]",
      // color: "from-[#FFE392] to-[#E77715]",
      icon: <CloudSun size={24} className="text-white" />,
      time: prayerTimes?.times?.Asr
        ? formatTo12Hour(prayerTimes.times.Asr)
        : "",
      active: nextPrayerName === "Asr",
    },
    {
      name: "Maghrib",
      color: "from-[#FF88A8] to-[#FF9452]",
      // color: "from-[#C9F3B3] to-[#006C5E]",
      icon: <SunHorizon size={24} className="text-white" />,
      time: prayerTimes?.times?.Maghrib
        ? formatTo12Hour(prayerTimes.times.Maghrib)
        : "",
      active: nextPrayerName === "Maghrib",
    },
    {
      name: "Isha",
      // color: "from-[#FF88A8] to-[#FF9452]",
      color: "from-[#811DEC] to-[#381079]",
      icon: <MoonStars size={24} className="text-white" />,
      time: prayerTimes?.times?.Isha
        ? formatTo12Hour(prayerTimes.times.Isha)
        : "",
      active: nextPrayerName === "Isha",
    },
  ];

  const nextPrayerData = prayers.find((p) => p.name === nextPrayerName);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 m-5 border-green-500">
        <LocationBar
          city={loading ? "Locating..." : error ? "Unknown" : city}
          country={loading ? "" : error ? error : country}
        />
      </div>
      <div className="p-6 m_b">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {nextPrayerData ? (
            <NamazCard
              key={nextPrayerData.name}
              {...nextPrayerData}
              prayerIcons={prayerIcons}
              latitude={latitude}
              longitude={longitude}
            />
          ) : (
            <NamazCard
              key="loading-card"
              name="Prayer"
              color="from-gray-500 to-gray-700"
              icon={<CloudMoon size={24} className="text-white" />}
              time=""
              active={false}
              prayerIcons={prayerIcons}
              latitude={latitude}
              longitude={longitude}
            />
          )}
        </div>
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white md:hidden"
        style={{ boxShadow: "0px -5px 20px 0px #00000008" }}
      >
        <nav className="flex justify-around items-center h-16">
          <div className="flex flex-col items-center text-xs text-purple-700">
            <HouseSimple className="w-[22px] h-[22px] mb-1" />
            Home
          </div>
          <div className="flex flex-col items-center text-xs text-gray-400">
            <BookOpen className="w-[22px] h-[22px] mb-1" />
            Quran
          </div>
          <img src={More} alt="More" className="w-10 h-10 mb-1" />
          <div className="flex flex-col items-center text-xs text-gray-400">
            <img
              src={maktabImg}
              alt="Maktab"
              className="w-[22px] h-[22px] mb-1"
            />
            Maktab
          </div>
          <div className="flex flex-col items-center text-xs text-gray-400">
            <img src={DuaImg} alt="Dua" className="w-[22px] h-[22px] mb-1" />
            Dua
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
