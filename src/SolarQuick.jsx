import { useState } from "react";
import DrawMap from "./components/DrawMap";

export default function SolarQuick() {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const location = data[0];
        setCoordinates({ lat: parseFloat(location.lat), lon: parseFloat(location.lon) });
        setResultVisible(true);
      } else {
        alert("Adresse nicht gefunden.");
      }
    } catch (error) {
      alert("Fehler bei der Adresseingabe.");
    }
  };

  return (
    <div>
      <h1>SolarQuick – Solarpaket finden</h1>
      <input
        type="text"
        placeholder="Adresse eingeben"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={handleSearch}>Analysieren</button>
      {resultVisible && coordinates && (
        <div style={{ height: "400px", marginTop: "1rem" }}>
          <DrawMap lat={coordinates.lat} lon={coordinates.lon} />
        </div>
      )}
    </div>
  );
}