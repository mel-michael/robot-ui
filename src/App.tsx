import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import { Play, Pause, Move, RotateCcw } from 'lucide-react';

import { robotIcon, POLYGON, POLYGON_CENTER } from './config/polygon';
import { MapBoundsHandler } from './components/MapHandler';
import { ErrorBanner } from './components/ErrorBanner';
import { useRobotsFetch } from './hooks/useRobotsFetch';
import { robotApi } from './utils/api';
import {
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
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Fetch robots on interval (only when auto-running)
  useRobotsFetch({
    onUpdate: setRobots,
    onError: setError,
    intervalMs: autoIntervalMs,
    enabled: isAutoRunning,
  });

  const handleMove = useCallback(async () => {
    setLoadingAction('move');
    setError(null);

    const result = await robotApi.move({ meters });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Move failed: ${result.error}`);
    }

    setLoadingAction(null);
  }, [meters]);

  const handleReset = useCallback(async () => {
    setLoadingAction('reset');
    setError(null);

    const result = await robotApi.reset({ count: resetCount });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Reset failed: ${result.error}`);
    }

    setLoadingAction(null);
  }, [resetCount]);

  const handleStartAuto = useCallback(async () => {
    setLoadingAction('start-auto');
    setError(null);

    const result = await robotApi.startAuto({ meters, intervalMs: autoIntervalMs });

    if (result.success) {
      setIsAutoRunning(true);
    } else {
      setError(`Start auto failed: ${result.error}`);
    }

    setLoadingAction(null);
  }, [meters, autoIntervalMs]);

  const handleStopAuto = useCallback(async () => {
    setLoadingAction('stop-auto');
    setError(null);

    const result = await robotApi.stopAuto();

    if (result.success) {
      setIsAutoRunning(false);
    } else {
      setError(`Stop auto failed: ${result.error}`);
    }

    setLoadingAction(null);
  }, []);

  return (
    <div className="app-root">
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

      <header className="app-header">
        <div className="title-block">
          <h1>Robot Visualization</h1>
          <p>Downtown Los Angeles - {robots.length} robots active</p>
        </div>

        <div className="header-right">
          <div className="primary-actions">
            <button
              className={`btn btn-primary ${loadingAction === 'move' ? 'btn-loading' : ''}`}
              onClick={handleMove}
              disabled={loadingAction !== null}
            >
              <Move size={16} />
              <span className="pl-2">Move Once</span>
            </button>
            <button
              onClick={isAutoRunning ? handleStopAuto : handleStartAuto}
              className={`btn ${isAutoRunning ? 'btn-danger' : 'btn-success'} ${loadingAction === 'start-auto' || loadingAction === 'stop-auto' ? 'btn-loading' : ''}`}
              disabled={loadingAction !== null}
            >
              {isAutoRunning ? <Pause size={16} /> : <Play size={16} />}
              <span className="pl-2">{isAutoRunning ? 'Stop Auto' : 'Start Auto'}</span>
            </button>
            <button
              className={`btn btn-purple ${loadingAction === 'reset' ? 'btn-loading' : ''}`}
              onClick={handleReset}
              disabled={loadingAction !== null}
            >
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
