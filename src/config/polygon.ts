import L, { type LatLngExpression } from 'leaflet';

export const robotIcon = new L.DivIcon({
  html: '<div class="robot-icon">🤖</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Default Polygon - Downtown Los Angeles (DTLA) area
export const POLYGON: LatLngExpression[] = [
  [34.055, -118.275],
  [34.055, -118.225],
  [34.02, -118.225],
  [34.02, -118.275],
];

// Calculate the center of the polygon
const latitudes = POLYGON.map((point) => (point as number[])[0]);
const longitudes = POLYGON.map((point) => (point as number[])[1]);
const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;

export const POLYGON_CENTER: LatLngExpression = [centerLat, centerLng];
