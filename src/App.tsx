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


// Icons (optional array, not used directly but passed to cards if needed)
const prayerIcons = [
  <CloudMoon size={24} className="text-white" />,
  <Sun size={24} className="text-white" />,
  <CloudSun size={24} className="text-white" />,
  <SunHorizon size={24} className="text-white" />,
  <MoonStars size={24} className="text-white" />,
];

function App() {
  const { city, country, latitude, longitude, loading, error } = useGeolocation();
  const prayers = [
    {
      name: "Fajr",
      color: "from-[#D6BDFF] to-[#3F7CE6]",
      icon: <CloudMoon size={24} className="text-white" />,
      time: "5:51",
      active: false,
    },
    {
      name: "Dhuhr",
      color: "from-[#FFE392] to-[#E77715]",
      icon: <Sun size={24} className="text-white" />,
      time: "12:27",
      active: false,
    },
    {
      name: "Asr",
      color: "from-[#C9F3B3] to-[#006C5E]",
      icon: <CloudSun size={24} className="text-white" />,
      time: "3:21",
      active: false,
    },
    {
      name: "Maghrib",
      color: "from-[#FF88A8] to-[#FF9452]",
      icon: <SunHorizon size={24} className="text-white" />,
      time: "5:40",
      active: false,
    },
    {
      name: "Isha",
      color: "from-[#811DEC] to-[#381079]",
      icon: <MoonStars size={24} className="text-white" />,
      time: "7:04",
      active: false, // <-- set to false
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Top Location Bar */}
      <div className="sticky top-0 z-20  m-5 border-green-500">
        <LocationBar
          city={loading ? "Locating..." : error ? "Unknown" : city}
          country={loading ? "" : error ? error : country}
        />
      </div>

      {/* Main Cards Section */}
      <div className="p-6 m_b">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {prayers.map((p) => (
            <NamazCard
              key={p.name}
              {...p}
              prayerIcons={prayerIcons}
              latitude={latitude}
              longitude={longitude}
            />
          ))}
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
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
            <BookOpen className="w-[22px] h-[22px]  mb-1" />
            Quran
          </div>
          <img src={More} alt="Maktab" className="w-10 h-10  mb-1" />
          <div className="flex flex-col items-center text-xs text-gray-400">
            <img
              src={maktabImg}
              alt="Maktab"
              className="w-[22px] h-[22px]  mb-1"
            />
            Maktab
          </div>
          <div className="flex flex-col items-center text-xs text-gray-400">
            <img
              src={DuaImg}
              alt="Maktab"
              className="w-[22px] h-[22px]  mb-1"
            />
            Dua
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
