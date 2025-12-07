import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';

const API_BASE = 'http://localhost:4000';

// Simple “robot” icon
const robotIcon = new L.DivIcon({
  html: '🤖',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Polygon from backend (DTLA area)
const POLYGON: LatLngExpression[] = [
  [34.055, -118.275],
  [34.055, -118.225],
  [34.020, -118.225],
  [34.020, -118.275],
];

type RobotPosition = [number, number];

const FetchRobotsOnInterval: React.FC<{ onUpdate: (robots: RobotPosition[]) => void }> = ({ onUpdate }) => {
  useEffect(() => {
    let isCancelled = false;

    const fetchRobots = async () => {
      try {
        const res = await fetch(`${API_BASE}/robots`);
        const data = await res.json();
        if (!isCancelled) {
          onUpdate(data.robots ?? []);
        }
      } catch (e) {
        console.error('Failed to fetch robots', e);
      }
    };

    fetchRobots();
    const id = setInterval(fetchRobots, 1000); // poll every 1s
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [onUpdate]);

  return null;
};

const FitPolygonOnMount: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(POLYGON as LatLngExpression[]);
    map.fitBounds(bounds.pad(0.2)); // small padding around polygon
  }, [map]);
  return null;
};


const App: React.FC = () => {
  const [robots, setRobots] = useState<RobotPosition[]>([]);
  const [meters, setMeters] = useState(1);
  const [autoIntervalMs, setAutoIntervalMs] = useState(1000);
  const [resetCount, setResetCount] = useState(20);
  const [isAuto, setIsAuto] = useState(true); // server auto starts by default

  const handleMove = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meters }),
      });
      const data = await res.json();
      setRobots(data.robots ?? []);
    } catch (e) {
      console.error('move failed', e);
    }
  }, [meters]);

  const handleReset = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: resetCount }),
      });
      const data = await res.json();
      setRobots(data.robots ?? []);
    } catch (e) {
      console.error('reset failed', e);
    }
  }, [resetCount]);

  const handleStartAuto = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/start-auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meters, intervalMs: autoIntervalMs }),
      });
      await res.json();
      setIsAuto(true);
    } catch (e) {
      console.error('start-auto failed', e);
    }
  }, [meters, autoIntervalMs]);

  const handleStopAuto = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stop-auto`, {
        method: 'POST',
      });
      await res.json();
      setIsAuto(false);
    } catch (e) {
      console.error('stop-auto failed', e);
    }
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Robot Visualization</h1>
        <div className="controls">
          <label>
            Move meters:
            <input
              type="number"
              value={meters}
              onChange={e => setMeters(Number(e.target.value) || 0)}
              min={0}
            />
          </label>
          <button onClick={handleMove}>Step Once</button>

          <label>
            Reset count:
            <input
              type="number"
              value={resetCount}
              onChange={e => setResetCount(Number(e.target.value) || 0)}
              min={0}
            />
          </label>
          <button onClick={handleReset}>Reset Robots</button>

          <label>
            Auto interval (ms):
            <input
              type="number"
              value={autoIntervalMs}
              onChange={e => setAutoIntervalMs(Number(e.target.value) || 0)}
              min={100}
            />
          </label>
          <button onClick={handleStartAuto}>Start Auto</button>
          <button onClick={handleStopAuto} disabled={!isAuto}>
            Stop Auto
          </button>

          <span>{robots.length} robots</span>
        </div>
      </header>

      <main className="map-container">
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={[34.04, -118.25]}
          zoom={14}
          scrollWheelZoom
        >
          <FitPolygonOnMount />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polygon
  positions={POLYGON}
  pathOptions={{
    color: '#f97316',       // bright orange outline
    weight: 3,              // thicker border
    fillColor: '#f97316',
    fillOpacity: 0.15,
  }}
/>

          {robots.map(([lat, lng], idx) => (
            <Marker key={idx} position={[lat, lng]} icon={robotIcon} />
          ))}
          <FetchRobotsOnInterval onUpdate={setRobots} />
        </MapContainer>
      </main>
    </div>
  );
};

export default App;
