import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const helmetIcon = new L.Icon({
  iconUrl: "/helmet-icon.png", // Update path as needed
  iconSize: [30, 30],
});

export default function HelmetMap({ helmetLocations, zoom }) {
  const defaultCenter = [6.9271, 79.8612];

  const markers = Object.entries(helmetLocations).map(([id, loc]) => (
    <Marker key={id} position={loc} icon={helmetIcon}>
      <Popup>
        Helmet ID: <strong>{id}</strong>
        <br />
        Location: {loc[0].toFixed(4)}, {loc[1].toFixed(4)}
      </Popup>
    </Marker>
  ));

  return (
    <MapContainer center={defaultCenter} zoom={zoom} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers}
    </MapContainer>
  );
}
