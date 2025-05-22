import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function Recenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (
      Array.isArray(location) &&
      location.length === 2 &&
      !isNaN(location[0]) &&
      !isNaN(location[1])
    ) {
      map.setView(location);
    }
  }, [location, map]);
  return null;
}
