import { useEffect } from 'react';
import type { RobotPosition } from '../types/robot';
import { API_BASE_URL, DEFAULT_MOVE_INTERVAL_MS } from '../config/constant';

type UseRobotsFetchProps = {
  onUpdate: (robots: RobotPosition[]) => void;
  intervalMs: number;
};

export const useRobotsFetch = ({
  onUpdate,
  intervalMs = DEFAULT_MOVE_INTERVAL_MS,
}: UseRobotsFetchProps) => {
  useEffect(() => {
    let isCancelled = false;

    const fetchRobots = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/robots`);
        const data = await res.json();

        if (!isCancelled) {
          onUpdate(data.robots ?? []);
        }
      } catch (e) {
        console.error('Failed to fetch robots', e);
      }
    };

    fetchRobots();

    const fetchIntervalId = setInterval(fetchRobots, intervalMs); // poll every 1s
    return () => {
      isCancelled = true;
      clearInterval(fetchIntervalId);
    };
  }, [onUpdate, intervalMs]);
};
