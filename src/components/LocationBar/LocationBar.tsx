import React from "react";
import mainLogo from "../../assets/main-logo.png";
import { MapPin } from "phosphor-react";

interface LocationBarProps {
  city: string;
  country: string;
}

const LocationBar: React.FC<LocationBarProps> = React.memo(({ city, country }) => (
  <div
    className="flex items-center justify-between h-14 border-b border-gray-100 bg-gradient-to-t from-[#FFFFFF] to-[#F0EAFB]"
    style={{ padding: "12px 16px" }} // py-3 ≈ 12px
  >
    <img src={mainLogo} alt="Main Logo" className="text-purple-700 h-9 w-21" />
    <div className="flex flex-col items-end ml-auto">
      <span className="text-xs text-purple-700 font-medium cursor-pointer">
        {city}{country ? `, ${country}` : ""}
      </span>
      <span className="flex items-center text-[10px] text-purple-500">
        <MapPin className="w-[14px] h-[14px]" />
        Get accurate namaz time
      </span>
    </div>
  </div>
));

export default LocationBar;
