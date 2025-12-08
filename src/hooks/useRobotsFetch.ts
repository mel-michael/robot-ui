import { useEffect } from 'react';
import type { RobotPosition } from '../types/robot';
import { DEFAULT_MOVE_INTERVAL_MS } from '../config/constant';
import { robotApi } from '../utils/api';

type UseRobotsFetchProps = {
  onUpdate: (robots: RobotPosition[]) => void;
  onError?: (error: string) => void;
  intervalMs: number;
};

export const useRobotsFetch = ({
  onUpdate,
  onError,
  intervalMs = DEFAULT_MOVE_INTERVAL_MS,
}: UseRobotsFetchProps) => {
  useEffect(() => {
    let isCancelled = false;

    const fetchRobots = async () => {
      const result = await robotApi.getRobots();

      if (isCancelled) return;

      if (result.success) {
        onUpdate(result.data.robots ?? []);
      } else if (onError) {
        onError(`Failed to fetch robots: ${result.error}`);
      }
    };

    fetchRobots();

    const fetchIntervalId = setInterval(fetchRobots, intervalMs);
    return () => {
      isCancelled = true;
      clearInterval(fetchIntervalId);
    };
  }, [onUpdate, onError, intervalMs]);
};
