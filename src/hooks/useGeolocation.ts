import { useEffect, useState } from "react";

interface Location {
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export default function useGeolocation(): Location {
  const [location, setLocation] = useState<Location>({
    city: "",
    country: "",
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    console.log("useGeolocation useEffect running");
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, loading: false, error: "Geolocation not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          console.log("this is uselocation");
          console.log(data);
          const city = data.address.city || data.address.town || data.address.village || "Unknown";
          const country = data.address.country || "Unknown";
          setLocation({
            city,
            country,
            latitude,
            longitude,
            loading: false,
            error: null,
          });
        } catch (err) {
          setLocation((prev) => ({
            ...prev,
            loading: false,
            error: "Failed to fetch location info",
            latitude,
            longitude,
          }));
        }
      },
      (error) => {
        console.log("Geolocation error:", error);
        setLocation((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    );
  }, []);

  return location;
} 