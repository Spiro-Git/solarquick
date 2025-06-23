import { MapContainer, TileLayer, Marker, Popup, useMap, FeatureGroup, Polygon } from "react-leaflet";
import { useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-geometryutil";
import { analyzePolygon } from "./PolygonAnalysis";
import ProviderSuggestions from "./components/ProviderSuggestions";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);


const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

function ChangeMapView({ coords }) {
  const map = useMap();
  if (coords) {
    map.setView(coords, 20);
  }
  return null;
}

export default function MapComponent() {
  const [address, setAddress] = useState("");
  const [markerPos, setMarkerPos] = useState(null);
  const polygonRef = useRef(null);
  const [polygonArea, setPolygonArea] = useState(0);
  const [estimatedPower, setEstimatedPower] = useState(0);
  const [annualYield, setAnnualYield] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]);
  
  const chartData = {
  labels: Array.from({ length: 12 }, (_, i) => `Monat ${i + 1}`),
  datasets: [
    {
      label: "Monatlicher Ertrag (kWh)",
      data: monthlyStats,
      backgroundColor: "#3b82f6",
      borderRadius: 5,
    },
  ],
};

  
  const [autoPolygon, setAutoPolygon] = useState(null);

  const handleSearch = async () => {
    if (!address) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, boundingbox } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setMarkerPos([latNum, lonNum]);

        const [south, north, west, east] = boundingbox.map(parseFloat);
        const polygon = [
          [north, west],
          [north, east],
          [south, east],
          [south, west]
        ];
        setAutoPolygon(polygon);

        const result = analyzePolygon(polygon);
        setPolygonArea(result.area);
        setEstimatedPower(result.power);
        setAnnualYield(result.annual);
        setMonthlyStats(result.monthlyStats);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const polygon = layer.getLatLngs()[0].map(({ lat, lng }) => [lat, lng]);
      const result = analyzePolygon(polygon);
      setPolygonArea(result.area);
      setEstimatedPower(result.power);
      setAnnualYield(result.annual);
      setMonthlyStats(result.monthlyStats);
    }
  };
  
  const handleSendRequest = () => {
  alert("✅ Anfrage wurde erfolgreich an alle Anbieter gesendet!");
};

  return (
    <div>
      <h1>SolarQuick – Solarpaket finden</h1>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Adresse eingeben"
      />
      <button onClick={handleSearch}>Analysieren</button>

      <MapContainer center={[51.3, 7.1]} zoom={13} style={{ height: "80vh", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerPos && (
          <>
            <Marker position={markerPos} icon={markerIcon}>
              <Popup>Zieladresse</Popup>
            </Marker>
            <ChangeMapView coords={markerPos} />
          </>
        )}
        <FeatureGroup ref={polygonRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              polygon: true,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
          />
        </FeatureGroup>
        {autoPolygon && (
          <Polygon positions={autoPolygon} pathOptions={{ color: "green" }}>
            <Popup>
              <div>
                Fläche: {polygonArea.toFixed(2)} m²<br />
                PV-Leistung: {estimatedPower.toFixed(2)} kWp<br />
                Jahresertrag: {annualYield.toFixed(0)} kWh
              </div>
            </Popup>
          </Polygon>
        )}
      </MapContainer>

      {polygonArea > 0 && (
        <div>
          <p>Berechnete Fläche: {polygonArea.toFixed(2)} m²</p>
          <p>Geschätzte PV-Leistung: {estimatedPower.toFixed(2)} kWp</p>
          <p>Jahresertrag: {annualYield.toFixed(0)} kWh</p>
          <h4>Monatliche Erträge:</h4>
          <ul>
            {monthlyStats.map((val, idx) => (
              <li key={idx}>Monat {idx + 1}: {val.toFixed(0)} kWh</li>
            ))}
			<h4>Monatliche Erträge (Diagramm):</h4>
<div style={{ maxWidth: "600px", marginBottom: "2rem" }}>
  <Bar data={chartData} />
</div>

          </ul>
		  <ProviderSuggestions estimatedPower={estimatedPower} />
<p>DEBUG: estimatedPower = {estimatedPower}</p>
{estimatedPower > 0 && <ProviderSuggestions estimatedPower={estimatedPower} />}
<button onClick={handleSendRequest} style={{ marginTop: "1rem", padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
  Jetzt Anfrage an alle Anbieter senden
</button>

        </div>
      )}


    </div>
  );
}
