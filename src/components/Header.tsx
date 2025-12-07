import React from 'react';

export const Header = ({ robots, handleMove, handleStartAuto, handleReset, meters, resetCount, autoIntervalMs, setMeters, setResetCount, setAutoIntervalMs }: { robots: any, handleMove: () => void, handleStartAuto: () => void, handleReset: () => void, meters: number, resetCount: number, autoIntervalMs: number, setMeters: (value: number) => void, setResetCount: (value: number) => void, setAutoIntervalMs: (value: number) => void }) => {

  return (
<header className="app-header">
  <div className="title-block">
    <h1>Robot Visualization</h1>
    <p>Downtown Los Angeles – {robots.length} robots active</p>
  </div>

  <div className="header-right">
    <div className="primary-actions">
      <button className="btn btn-primary" onClick={handleMove}>
        Move Once
      </button>
      <button className="btn btn-success" onClick={handleStartAuto}>
        Start Auto
      </button>
      <button className="btn btn-purple" onClick={handleReset}>
        Reset
      </button>
      <button className="btn btn-icon" aria-label="Settings">
        ⚙️
      </button>
    </div>

    <div className="secondary-controls">
      <label>
        Move meters:
        <input
          type="number"
          value={meters}
          onChange={e => setMeters(Number(e.target.value) || 0)}
          min={0}
        />
      </label>

      <label>
        Reset count:
        <input
          type="number"
          value={resetCount}
          onChange={e => setResetCount(Number(e.target.value) || 0)}
          min={1}
        />
      </label>

      <label>
        Auto interval (ms):
        <input
          type="number"
          value={autoIntervalMs}
          onChange={e => setAutoIntervalMs(Number(e.target.value) || 0)}
          min={100}
        />
      </label>
    </div>
  </div>
</header>
  )
}
