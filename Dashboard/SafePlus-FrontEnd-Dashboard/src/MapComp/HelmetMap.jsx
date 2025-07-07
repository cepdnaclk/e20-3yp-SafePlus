import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RecenterMap from "./RecenterMap";
import { useHighlight } from "../context/HighlightContext";  // import context hook

export default function HelmetMap({ helmetLocations, zoom }) {
  const { highlightedId } = useHighlight();

  const positions = Object.values(helmetLocations).filter(
    (loc) => Array.isArray(loc) && loc.length === 2
  );
  const defaultCenter = positions.length ? positions[0] : [6.9271, 79.8612];

  console.log("Helmet Locations Received by Map:", helmetLocations);

  const helmetIcon = new L.Icon({
    iconUrl: "/icons/helmet-icon.png",
    iconSize: [30, 30],
  });

  const highlightedIcon = new L.Icon({
    iconUrl: "/icons/helmet-icon-highlight.png",
    iconSize: [40, 40],
  });

  const markers = Object.entries(helmetLocations)
    .filter(([_, loc]) => Array.isArray(loc) && loc.length === 2)
    .map(([id, loc]) => (
      <Marker
        key={id}
        position={loc}
        icon={id === highlightedId ? highlightedIcon : helmetIcon}
      > 
        <Popup>
          Helmet ID: <strong>{id}</strong>
          <br />
          Location: {loc[0].toFixed(4)}, {loc[1].toFixed(4)}
        </Popup>
      </Marker>
    ));

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <RecenterMap
        positions={positions}
        targetPosition={highlightedId ? helmetLocations[highlightedId] : null}
      />


      {markers}
    </MapContainer>
  );
}
