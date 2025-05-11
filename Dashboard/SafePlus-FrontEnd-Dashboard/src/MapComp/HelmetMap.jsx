import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import Recenter from "./Recenter";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl:      icon,
  shadowUrl:    shadow,
});

const defaultLocation = [6.9271, 79.8612];

export default function HelmetMap({ location }) {
  const loc = Array.isArray(location) && location.length === 2
    ? location
    : defaultLocation;

  return (
    <MapContainer center={loc} zoom={50} style={{ height: '400px', width: '100%' }} scrollWheelZoom={true}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}  // the highest zoom the server actually has
        maxZoom={20}        // how far Leaflet will let you zoom in (tiles get upscaled)
      />
      <Recenter location={loc} />
      <Marker position={loc}>
        <Popup>Helmet Location</Popup>
      </Marker>
    </MapContainer>
  );
}
