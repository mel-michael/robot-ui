import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { robotApi } from '../utils/api';
import type { RobotPosition } from '../types/robot';

vi.mock('../utils/api', () => ({
  robotApi: {
    getRobots: vi.fn(),
    move: vi.fn(),
    reset: vi.fn(),
    startAuto: vi.fn(),
    stopAuto: vi.fn(),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }: { position: RobotPosition }) => (
    <div data-testid={`marker-${position[0]}-${position[1]}`} />
  ),
  Polygon: () => <div data-testid="polygon" />,
  useMap: () => ({
    fitBounds: vi.fn(),
  }),
}));

vi.mock('../components/MapHandler', () => ({
  MapBoundsHandler: () => <div data-testid="map-bounds-handler" />,
}));

import { useRobotsFetch } from '../hooks/useRobotsFetch';

vi.mock('../hooks/useRobotsFetch', () => ({
  useRobotsFetch: vi.fn(),
}));

const mockRobots: RobotPosition[] = [
  [34.0522, -118.2437],
  [34.0533, -118.2448],
  [34.0544, -118.2459],
];

describe('<App />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(robotApi.getRobots).mockResolvedValue({
      success: true,
      data: { robots: mockRobots },
    });
    vi.mocked(useRobotsFetch).mockImplementation(() => {
      // No-op: prevents infinite loop, robots state initialized as empty
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('renders main title and robot count', () => {
    render(<App />);

    expect(screen.getByText('Robot Visualization')).toBeInTheDocument();
    expect(screen.getByText(/0 robots active/)).toBeInTheDocument();
  });

  it('renders all primary action buttons', async () => {
    render(<App />);

    expect(screen.getByText('Move Once')).toBeInTheDocument();
    expect(screen.getByText(/Stop Auto|Start Auto/)).toBeInTheDocument();
    expect(screen.getByText('Reset All')).toBeInTheDocument();
  });

  it('renders all input controls', () => {
    render(<App />);

    expect(screen.getByLabelText(/Move meters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Auto interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Robot count/i)).toBeInTheDocument();
    expect(screen.getByText('Apply Changes')).toBeInTheDocument();
  });

  it('renders map container with polygon', () => {
    render(<App />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('polygon')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });
});
