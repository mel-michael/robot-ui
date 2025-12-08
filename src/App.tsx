import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import { Play, Pause, Move, RotateCcw } from 'lucide-react';

import { robotIcon, POLYGON, POLYGON_CENTER } from './config/polygon';
import { MapBoundsHandler } from './components/MapHandler';
import { useRobotsFetch } from './hooks/useRobotsFetch';
import {
  API_BASE_URL,
  DEFAULT_ROBOT_COUNT,
  DEFAULT_MOVE_METERS,
  DEFAULT_MOVE_INTERVAL_MS,
} from './config/constant';
import type { RobotPosition } from './types/robot';

const App: React.FC = () => {
  const [robots, setRobots] = useState<RobotPosition[]>([]);
  const [meters, setMeters] = useState(DEFAULT_MOVE_METERS);
  const [autoIntervalMs, setAutoIntervalMs] = useState(DEFAULT_MOVE_INTERVAL_MS);
  const [resetCount, setResetCount] = useState(DEFAULT_ROBOT_COUNT);
  const [isAutoRunning, setIsAutoRunning] = useState(true);

  // Fetch robots on interval
  useRobotsFetch({ onUpdate: setRobots, intervalMs: autoIntervalMs });

  const handleMove = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/move`, {
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
      const res = await fetch(`${API_BASE_URL}/reset`, {
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
      const res = await fetch(`${API_BASE_URL}/start-auto`, {
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
      const res = await fetch(`${API_BASE_URL}/stop-auto`, {
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
          center={POLYGON_CENTER}
          zoom={14}
          scrollWheelZoom
        >
          <MapBoundsHandler />
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
        </MapContainer>
      </main>
    </div>
  );
};

export default App;
