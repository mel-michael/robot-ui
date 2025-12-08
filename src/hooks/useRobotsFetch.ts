import { useEffect } from 'react';
import type { RobotPosition } from '../types/robot';
import { DEFAULT_MOVE_INTERVAL_MS } from '../config/constant';
import { robotApi } from '../utils/api';

type UseRobotsFetchProps = {
  onUpdate: (robots: RobotPosition[]) => void;
  onError?: (error: string) => void;
  intervalMs: number;
  enabled?: boolean;
};

export const useRobotsFetch = ({
  onUpdate,
  onError,
  intervalMs = DEFAULT_MOVE_INTERVAL_MS,
  enabled = true,
}: UseRobotsFetchProps) => {
  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;
    let abortController: AbortController | null = null;

    const fetchRobots = async () => {
      if (abortController) {
        abortController.abort();
      }

      abortController = new AbortController();
      const result = await robotApi.getRobots(abortController.signal);

      if (isCancelled) return;

      if (result.success) {
        onUpdate(result.data.robots ?? []);
      } else if (onError && result.error !== 'Request cancelled') {
        onError(`Failed to fetch robots: ${result.error}`);
      }
    };

    fetchRobots();

    const fetchIntervalId = setInterval(fetchRobots, intervalMs);
    return () => {
      isCancelled = true;
      clearInterval(fetchIntervalId);
      if (abortController) {
        abortController.abort();
      }
    };
  }, [onUpdate, onError, intervalMs, enabled]);
};
