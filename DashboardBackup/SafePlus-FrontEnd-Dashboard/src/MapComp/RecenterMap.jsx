import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function RecenterMap({ targetPosition, positions }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (
      Array.isArray(targetPosition) &&
      targetPosition.length === 2 &&
      typeof targetPosition[0] === "number" &&
      typeof targetPosition[1] === "number"
    ) {
      map.setView(targetPosition, map.getZoom(), { animate: true });
    } else if (
      Array.isArray(positions) &&
      positions.length > 0 &&
      positions.every(
        (pos) =>
          Array.isArray(pos) &&
          pos.length === 2 &&
          typeof pos[0] === "number" &&
          typeof pos[1] === "number"
      )
    ) {
      if (positions.length === 1) {
        map.setView(positions[0], map.getZoom(), { animate: true });
      } else {
        map.fitBounds(positions, { padding: [50, 50] });
      }
    }
  }, [targetPosition, positions, map]);

  return null;
}
