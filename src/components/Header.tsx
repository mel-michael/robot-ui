type HeaderProps = {
  robots: unknown[];
  handleMove: () => void;
  handleStartAuto: () => void;
  handleReset: () => void;
  handleStopAuto: () => void;
  isAutoRunning: boolean;
  meters: number;
  resetCount: number;
  autoIntervalMs: number;
  setMeters: (value: number) => void;
  setResetCount: (value: number) => void;
  setAutoIntervalMs: (value: number) => void;
};

export const Header = ({
  robots,
  handleMove,
  handleStartAuto,
  handleReset,
  meters,
  resetCount,
  autoIntervalMs,
  setMeters,
  setResetCount,
  setAutoIntervalMs,
  handleStopAuto,
  isAutoRunning,
}: HeaderProps) => {
  return (
    <header className="app-header">
      <h1>Robot Visualization</h1>
      <div className="controls">
        <label>
          Move meters:
          <input
            type="number"
            value={meters}
            onChange={(e) => setMeters(Number(e.target.value) || 0)}
            min={0}
          />
        </label>
        <button onClick={handleMove}>Step Once</button>

        <label>
          Reset count:
          <input
            type="number"
            value={resetCount}
            onChange={(e) => setResetCount(Number(e.target.value) || 0)}
            min={0}
          />
        </label>
        <button onClick={handleReset}>Reset Robots</button>

        <label>
          Auto interval (ms):
          <input
            type="number"
            value={autoIntervalMs}
            onChange={(e) => setAutoIntervalMs(Number(e.target.value) || 0)}
            min={100}
          />
        </label>
        <button onClick={handleStartAuto}>Start Auto</button>
        <button onClick={handleStopAuto} disabled={!isAutoRunning}>
          Stop Auto
        </button>

        <span>{robots.length} robots</span>
      </div>
    </header>
  );
};
