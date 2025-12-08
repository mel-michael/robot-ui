import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import { Play, Pause, Move, RotateCcw } from 'lucide-react';

import { robotIcon, POLYGON, POLYGON_CENTER } from './config/polygon';
import { MapBoundsHandler } from './components/MapHandler';
import { ErrorBanner } from './components/ErrorBanner';
import { useRobotsFetch } from './hooks/useRobotsFetch';
import { robotApi } from './utils/api';
import { validateInRange } from './utils/validation';
import {
  DEFAULT_ROBOT_COUNT,
  DEFAULT_MOVE_METERS,
  DEFAULT_MOVE_INTERVAL_MS,
  MIN_MOVE_METERS,
  MAX_MOVE_METERS,
  MIN_ROBOT_COUNT,
  MAX_ROBOT_COUNT,
  MIN_INTERVAL_MS,
  MAX_INTERVAL_MS,
} from './config/constant';
import type { RobotPosition } from './types/robot';
import './App.css';

const App: React.FC = () => {
  const [robots, setRobots] = useState<RobotPosition[]>([]);
  const [meters, setMeters] = useState(DEFAULT_MOVE_METERS);
  const [autoIntervalMs, setAutoIntervalMs] = useState(DEFAULT_MOVE_INTERVAL_MS);
  const [robotCount, setRobotCount] = useState(DEFAULT_ROBOT_COUNT);
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
    const validation = validateInRange(meters, MIN_MOVE_METERS, MAX_MOVE_METERS, 'Move meters');
    if (!validation.isValid) {
      setError(validation.error ?? null);
      setMeters(validation.value);
      return;
    }

    setError(null);

    const result = await robotApi.move({ meters: validation.value });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Move failed: ${result.error}`);
    }
  }, [meters]);

  const handleApplyChanges = useCallback(async () => {
    // Validate all inputs
    const metersValidation = validateInRange(
      meters,
      MIN_MOVE_METERS,
      MAX_MOVE_METERS,
      'Move meters'
    );
    const intervalValidation = validateInRange(
      autoIntervalMs,
      MIN_INTERVAL_MS,
      MAX_INTERVAL_MS,
      'Auto interval'
    );
    const countValidation = validateInRange(
      robotCount,
      MIN_ROBOT_COUNT,
      MAX_ROBOT_COUNT,
      'Robot count'
    );

    if (!metersValidation.isValid) {
      setError(metersValidation.error ?? null);
      setMeters(metersValidation.value);
      return;
    }

    if (!intervalValidation.isValid) {
      setError(intervalValidation.error ?? null);
      setAutoIntervalMs(intervalValidation.value);
      return;
    }

    if (!countValidation.isValid) {
      setError(countValidation.error ?? null);
      setRobotCount(countValidation.value);
      return;
    }

    setLoadingAction('apply-changes');
    setError(null);

    const wasRunning = isAutoRunning;

    // Stop auto if running
    if (wasRunning) {
      const stopResult = await robotApi.stopAuto();
      if (!stopResult.success) {
        setError(`Failed to stop auto: ${stopResult.error}`);
        setLoadingAction(null);
        return;
      }
      setIsAutoRunning(false);
    }

    // Update robot count
    const resetResult = await robotApi.reset({ count: countValidation.value });
    if (!resetResult.success) {
      setError(`Failed to update robot count: ${resetResult.error}`);
      setLoadingAction(null);
      return;
    }
    setRobots(resetResult.data.robots ?? []);

    // Restart auto with new params if it was running
    if (wasRunning) {
      const startResult = await robotApi.startAuto({
        meters: metersValidation.value,
        intervalMs: intervalValidation.value,
      });

      if (startResult.success) {
        setIsAutoRunning(true);
      } else {
        setError(`Failed to restart auto: ${startResult.error}`);
      }
    }

    setLoadingAction(null);
  }, [meters, autoIntervalMs, robotCount, isAutoRunning]);

  const handleStartAuto = useCallback(async () => {
    const metersValidation = validateInRange(
      meters,
      MIN_MOVE_METERS,
      MAX_MOVE_METERS,
      'Move meters'
    );
    const intervalValidation = validateInRange(
      autoIntervalMs,
      MIN_INTERVAL_MS,
      MAX_INTERVAL_MS,
      'Auto interval'
    );

    if (!metersValidation.isValid) {
      setError(metersValidation.error ?? null);
      setMeters(metersValidation.value);
      return;
    }

    if (!intervalValidation.isValid) {
      setError(intervalValidation.error ?? null);
      setAutoIntervalMs(intervalValidation.value);
      return;
    }

    setError(null);

    const result = await robotApi.startAuto({
      meters: metersValidation.value,
      intervalMs: intervalValidation.value,
    });

    if (result.success) {
      setIsAutoRunning(true);
    } else {
      setError(`Start auto failed: ${result.error}`);
    }
  }, [meters, autoIntervalMs]);

  const handleStopAuto = useCallback(async () => {
    setError(null);

    const result = await robotApi.stopAuto();

    if (result.success) {
      setIsAutoRunning(false);
    } else {
      setError(`Stop auto failed: ${result.error}`);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setError(null);

    // Stop auto if running
    if (isAutoRunning) {
      const stopResult = await robotApi.stopAuto();
      if (!stopResult.success) {
        setError(`Failed to stop auto: ${stopResult.error}`);
        return;
      }
      setIsAutoRunning(false);
    }

    // Reset to defaults
    setMeters(DEFAULT_MOVE_METERS);
    setAutoIntervalMs(DEFAULT_MOVE_INTERVAL_MS);
    setRobotCount(DEFAULT_ROBOT_COUNT);

    // Re-initialize with default count
    const result = await robotApi.reset({ count: DEFAULT_ROBOT_COUNT });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Reset failed: ${result.error}`);
    }
  }, [isAutoRunning]);

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
              <span className="pl-2">Reset All</span>
            </button>
          </div>

          <div className="secondary-controls">
            <label>
              Move meters:
              <input
                type="number"
                value={meters}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMeters(val);
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < MIN_MOVE_METERS) setMeters(MIN_MOVE_METERS);
                  else if (val > MAX_MOVE_METERS) setMeters(MAX_MOVE_METERS);
                }}
                min={MIN_MOVE_METERS}
                max={MAX_MOVE_METERS}
                step={0.1}
                disabled={loadingAction !== null}
              />
            </label>

            <label>
              Auto interval (ms):
              <input
                type="number"
                value={autoIntervalMs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAutoIntervalMs(val);
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < MIN_INTERVAL_MS) setAutoIntervalMs(MIN_INTERVAL_MS);
                  else if (val > MAX_INTERVAL_MS) setAutoIntervalMs(MAX_INTERVAL_MS);
                }}
                min={MIN_INTERVAL_MS}
                max={MAX_INTERVAL_MS}
                step={100}
                disabled={loadingAction !== null}
              />
            </label>

            <label>
              Robot count:
              <input
                type="number"
                value={robotCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRobotCount(val);
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < MIN_ROBOT_COUNT) setRobotCount(MIN_ROBOT_COUNT);
                  else if (val > MAX_ROBOT_COUNT) setRobotCount(MAX_ROBOT_COUNT);
                }}
                min={MIN_ROBOT_COUNT}
                max={MAX_ROBOT_COUNT}
                step={1}
                disabled={loadingAction !== null}
              />
            </label>

            <button
              className={`btn btn-secondary ${loadingAction === 'apply-changes' ? 'btn-loading' : ''}`}
              onClick={handleApplyChanges}
              disabled={loadingAction !== null}
              title="Apply all changes and update robot count"
            >
              Apply Changes
            </button>
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
