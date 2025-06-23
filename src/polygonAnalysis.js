// PolygonAnalysis.js
import L from "leaflet";
import "leaflet-geometryutil";

export function calculateAreaAndPower(polygon) {
  if (!polygon || polygon.length < 3) return { area: 0, power: 0 };

  const area = L.GeometryUtil.geodesicArea(
    polygon.map(([lat, lng]) => L.latLng(lat, lng))
  );
  const estimatedPower = (area * 0.18) / 1000;

  return {
    area,
    power: estimatedPower
  };
}

export function calculateAnnualEnergy(power) {
  const averageSunHours = 950; // kWh/kWp/Jahr in Deutschland
  return power * averageSunHours;
}

export function getAnnualStats(power) {
  const monthlyDistribution = [
    4, 6, 10, 12, 13, 14, 13, 12, 8, 4, 2, 2 // insgesamt 100%
  ];
  const annualEnergy = calculateAnnualEnergy(power);
  return monthlyDistribution.map((percent) => (annualEnergy * percent) / 100);
}

export function analyzePolygon(polygon) {
  if (!polygon || polygon.length < 3) return {
    area: 0,
    power: 0,
    annual: 0,
    monthlyStats: Array(12).fill(0)
  };

  const { area, power } = calculateAreaAndPower(polygon);
  const annual = calculateAnnualEnergy(power);
  const monthlyStats = getAnnualStats(power);

  return {
    area,
    power,
    annual,
    monthlyStats
  };
}
