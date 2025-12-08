import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import { Play, Pause, Move, RotateCcw } from 'lucide-react';

import { robotIcon, POLYGON, POLYGON_CENTER } from './config/polygon';
import { MapBoundsHandler } from './components/MapHandler';
import { ErrorBanner } from './components/ErrorBanner';
import { useRobotsFetch } from './hooks/useRobotsFetch';
import { useValidatedInput } from './hooks/useValidatedInput';
import { robotApi } from './utils/api';
import { validateInRange } from './utils/validation';
import { validateAllInputs } from './utils/inputValidation';
import {
  MIN_MOVE_METERS,
  MAX_MOVE_METERS,
  MIN_ROBOT_COUNT,
  MAX_ROBOT_COUNT,
  MIN_INTERVAL_MS,
  MAX_INTERVAL_MS,
  DEFAULT_ROBOT_COUNT,
  DEFAULT_MOVE_METERS,
  DEFAULT_MOVE_INTERVAL_MS,
} from './config/constant';
import type { RobotPosition } from './types/robot';
import './App.css';

const App: React.FC = () => {
  const [isAutoRunning, setIsAutoRunning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [robots, setRobots] = useState<RobotPosition[]>([]);

  const meters = useValidatedInput({
    initialValue: DEFAULT_MOVE_METERS,
    min: MIN_MOVE_METERS,
    max: MAX_MOVE_METERS,
  });

  const autoIntervalMs = useValidatedInput({
    initialValue: DEFAULT_MOVE_INTERVAL_MS,
    min: MIN_INTERVAL_MS,
    max: MAX_INTERVAL_MS,
  });

  const robotCount = useValidatedInput({
    initialValue: DEFAULT_ROBOT_COUNT,
    min: MIN_ROBOT_COUNT,
    max: MAX_ROBOT_COUNT,
  });

  // Fetch robots on interval (only when auto-running)
  useRobotsFetch({
    onUpdate: setRobots,
    onError: setError,
    intervalMs: autoIntervalMs.value,
    enabled: isAutoRunning,
  });

  const handleMove = useCallback(async () => {
    const validation = validateInRange(
      meters.value,
      MIN_MOVE_METERS,
      MAX_MOVE_METERS,
      'Move meters'
    );

    if (!validation.isValid) {
      setError(validation.error ?? null);
      meters.setValue(validation.value);
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await robotApi.move({ meters: validation.value });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Move failed: ${result.error}`);
    }
    setIsLoading(false);
  }, [meters]);

  const handleApplyChanges = useCallback(async () => {
    const result = validateAllInputs(
      {
        meters: meters.value,
        intervalMs: autoIntervalMs.value,
        robotCount: robotCount.value,
      },
      true
    );

    if ('error' in result) {
      setError(result.error.message);
      if (result.error.field === 'meters') {
        meters.setValue(result.error.correctedValue);
      }
      if (result.error.field === 'intervalMs') {
        autoIntervalMs.setValue(result.error.correctedValue);
      }
      if (result.error.field === 'robotCount') {
        robotCount.setValue(result.error.correctedValue);
      }
      return;
    }

    const { validated } = result;
    setIsLoading(true);
    setError(null);

    const wasRunning = isAutoRunning;

    if (wasRunning) {
      const stopResult = await robotApi.stopAuto();
      if (!stopResult.success) {
        setError(`Failed to stop auto: ${stopResult.error}`);
        setIsLoading(false);
        return;
      }
      setIsAutoRunning(false);
    }

    const resetResult = await robotApi.reset({ count: validated.count! });
    if (!resetResult.success) {
      setError(`Failed to update robot count: ${resetResult.error}`);
      setIsLoading(false);
      return;
    }
    setRobots(resetResult.data.robots ?? []);
    robotCount.setValue(validated.count!);

    if (wasRunning) {
      const startResult = await robotApi.startAuto({
        meters: validated.meters,
        intervalMs: validated.intervalMs,
      });

      if (startResult.success) {
        setIsAutoRunning(true);
      } else {
        setError(`Failed to restart auto: ${startResult.error}`);
      }
    }

    setIsLoading(false);
  }, [meters, autoIntervalMs, robotCount, isAutoRunning]);

  const handleStartAuto = useCallback(async () => {
    const result = validateAllInputs(
      {
        meters: meters.value,
        intervalMs: autoIntervalMs.value,
        robotCount: robotCount.value,
      },
      false
    );

    if ('error' in result) {
      setError(result.error.message);
      if (result.error.field === 'meters') {
        meters.setValue(result.error.correctedValue);
      }
      if (result.error.field === 'intervalMs') {
        autoIntervalMs.setValue(result.error.correctedValue);
      }
      return;
    }

    const { validated } = result;
    setIsLoading(true);
    setError(null);

    const apiResult = await robotApi.startAuto({
      meters: validated.meters,
      intervalMs: validated.intervalMs,
    });

    if (apiResult.success) {
      setIsAutoRunning(true);
    } else {
      setError(`Start auto failed: ${apiResult.error}`);
    }
    setIsLoading(false);
  }, [meters, autoIntervalMs, robotCount]);

  const handleStopAuto = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await robotApi.stopAuto();

    if (result.success) {
      setIsAutoRunning(false);
    } else {
      setError(`Stop auto failed: ${result.error}`);
    }
    setIsLoading(false);
  }, []);

  const handleReset = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isAutoRunning) {
      const stopResult = await robotApi.stopAuto();
      if (!stopResult.success) {
        setError(`Failed to stop auto: ${stopResult.error}`);
        setIsLoading(false);
        return;
      }
      setIsAutoRunning(false);
    }

    meters.setValue(DEFAULT_MOVE_METERS);
    autoIntervalMs.setValue(DEFAULT_MOVE_INTERVAL_MS);
    robotCount.setValue(DEFAULT_ROBOT_COUNT);

    const result = await robotApi.reset({ count: DEFAULT_ROBOT_COUNT });

    if (result.success) {
      setRobots(result.data.robots ?? []);
    } else {
      setError(`Reset failed: ${result.error}`);
    }
    setIsLoading(false);
  }, [isAutoRunning, meters, autoIntervalMs, robotCount]);

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
            <button className="btn btn-primary" onClick={handleMove} disabled={isLoading}>
              <Move size={16} />
              <span className="pl-2">Move Once</span>
            </button>
            <button
              onClick={isAutoRunning ? handleStopAuto : handleStartAuto}
              className={`btn ${isAutoRunning ? 'btn-danger' : 'btn-success'}`}
              disabled={isLoading}
            >
              {isAutoRunning ? <Pause size={16} /> : <Play size={16} />}
              <span className="pl-2">{isAutoRunning ? 'Stop Auto' : 'Start Auto'}</span>
            </button>
            <button className="btn btn-purple" onClick={handleReset} disabled={isLoading}>
              <RotateCcw size={16} />
              <span className="pl-2">Reset All</span>
            </button>
          </div>

          <div className="secondary-controls">
            <label>
              Move meters:
              <input
                type="number"
                value={meters.value}
                onChange={meters.handleChange}
                onBlur={meters.handleBlur}
                min={MIN_MOVE_METERS}
                max={MAX_MOVE_METERS}
                step={0.1}
                disabled={isLoading}
              />
            </label>

            <label>
              Auto interval (ms):
              <input
                type="number"
                value={autoIntervalMs.value}
                onChange={autoIntervalMs.handleChange}
                onBlur={autoIntervalMs.handleBlur}
                min={MIN_INTERVAL_MS}
                max={MAX_INTERVAL_MS}
                step={100}
                disabled={isLoading}
              />
            </label>

            <label>
              Robot count:
              <input
                type="number"
                value={robotCount.value}
                onChange={robotCount.handleChange}
                onBlur={robotCount.handleBlur}
                min={MIN_ROBOT_COUNT}
                max={MAX_ROBOT_COUNT}
                step={1}
                disabled={isLoading}
              />
            </label>

            <button
              className="btn btn-secondary"
              onClick={handleApplyChanges}
              disabled={isLoading}
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

          {robots.map(([lat, lng], index) => {
            const robotId = `${lat}-${lng}-${index}`;
            return <Marker key={robotId} position={[lat, lng]} icon={robotIcon} />;
          })}
        </MapContainer>
      </main>
    </div>
  );
};

export default App;
