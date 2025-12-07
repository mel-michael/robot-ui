import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import { Play, Pause, Move, RotateCcw } from 'lucide-react';
import L, { type LatLngExpression } from 'leaflet';
import type { RobotPosition } from './types/robot';

const API_BASE = 'http://localhost:4000';

// Robot Icon
const robotIcon = new L.DivIcon({
  html: '<div class="robot-icon">🤖</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Default Polygon - Downtown Los Angeles (DTLA) area
const POLYGON: LatLngExpression[] = [
  [34.055, -118.275],
  [34.055, -118.225],
  [34.02, -118.225],
  [34.02, -118.275],
];

const FetchRobotsOnInterval: React.FC<{ onUpdate: (robots: RobotPosition[]) => void }> = ({
  onUpdate,
}) => {
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
  const [isAutoRunning, setIsAutoRunning] = useState(true);

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
      setIsAutoRunning(true);
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
      setIsAutoRunning(false);
    } catch (e) {
      console.error('stop-auto failed', e);
    }
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="title-block">
          <h1>Robot Visualization</h1>
          <p>Downtown Los Angeles - {robots.length} robots active</p>
        </div>

        <div className="header-right">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleMove}>
              <Move size={16} />
              <span className="pl-2">Move Once</span>
            </button>
            <button
              onClick={isAutoRunning ? handleStopAuto : handleStartAuto}
              className={`btn ${isAutoRunning ? 'btn-danger' : 'btn-success'}`}
            >
              {isAutoRunning ? <Pause size={16} /> : <Play size={16} />}
              <span className="pl-2">{isAutoRunning ? 'Stop Auto' : 'Start Auto'}</span>
            </button>
            <button className="btn btn-purple" onClick={handleReset}>
              <RotateCcw size={16} />
              <span className="pl-2">Reset</span>
            </button>
          </div>

          <div className="secondary-controls">
            <label>
              Move meters:
              <input
                type="number"
                value={meters}
                onChange={(e) => setMeters(Number(e.target.value) || 0)}
                min={0}
              />
            </label>

            <label>
              Reset count:
              <input
                type="number"
                value={resetCount}
                onChange={(e) => setResetCount(Number(e.target.value) || 0)}
                min={1}
              />
            </label>

            <label>
              Auto interval (ms):
              <input
                type="number"
                value={autoIntervalMs}
                onChange={(e) => setAutoIntervalMs(Number(e.target.value) || 0)}
                min={100}
              />
            </label>
          </div>
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
              color: '#f97316',
              weight: 3,
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
