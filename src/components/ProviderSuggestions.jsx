import React from "react";

const ProviderSuggestions = ({ estimatedPower, onSendRequest }) => {
  if (!estimatedPower || estimatedPower < 0.005) return null;

  const costPerkWp = 1200;
  const estimatedCost = estimatedPower * costPerkWp;

  const handleSend = () => {
    if (onSendRequest) {
      onSendRequest();
    } else {
      alert("✅ Anfrage wurde erfolgreich an alle Anbieter gesendet!");
    }
  };

  return (
    <div style={{
      marginTop: "40px",
      background: "#f9f9f9",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.06)"
    }}>
      <h3 style={{ marginBottom: "15px" }}>🔌 Anbieter-Vorschläge</h3>

      <p><strong>Geschätzte Kosten:</strong> <span style={{ color: "green" }}>{estimatedCost.toFixed(0)} €</span></p>

      <ul style={{ lineHeight: "1.6" }}>
        <li><strong>🔆 SunPower</strong> – Premium-Module mit hoher Effizienz</li>
        <li><strong>🔧 Enpal</strong> – Komplettservice mit Mietoption</li>
        <li><strong>📱 1Komma5°</strong> – Inklusive Speicher & Monitoring-App</li>
      </ul>

      <button
        onClick={handleSend}
        style={{
          marginTop: "20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "12px 20px",
          fontSize: "14px",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      >
        Jetzt Anfrage senden & Angebote erhalten
      </button>
    </div>
  );
};

export default ProviderSuggestions;
