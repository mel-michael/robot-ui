import {
  MIN_MOVE_METERS,
  MAX_MOVE_METERS,
  MIN_INTERVAL_MS,
  MAX_INTERVAL_MS,
  MIN_ROBOT_COUNT,
  MAX_ROBOT_COUNT,
} from '../config/constant';
import { validateInRange } from './validation';

export interface InputValues {
  meters: number;
  intervalMs: number;
  robotCount: number;
}

export interface ValidatedInputs {
  meters: number;
  intervalMs: number;
  count?: number;
}

export interface ValidationError {
  field: 'meters' | 'intervalMs' | 'robotCount';
  message: string;
  correctedValue: number;
}

/**
 * Validates all input values and returns validated values or an error.
 * This is a pure function that can be easily unit tested.
 *
 * @param values - The input values to validate
 * @param includeRobotCount - Whether to validate robot count
 * @returns Object with either validated values or an error
 *
 * @example
 * const result = validateAllInputs({ meters: 5, intervalMs: 1000, robotCount: 20 }, true);
 * if (result.error) {
 *   // Handle error: result.error.message, result.error.correctedValue
 * } else {
 *   // Use validated values: result.validated.meters, etc.
 * }
 */
export function validateAllInputs(
  values: InputValues,
  includeRobotCount = false
): { validated: ValidatedInputs } | { error: ValidationError } {
  // Validate meters
  const metersValidation = validateInRange(
    values.meters,
    MIN_MOVE_METERS,
    MAX_MOVE_METERS,
    'Move meters'
  );
  if (!metersValidation.isValid) {
    return {
      error: {
        field: 'meters',
        message: metersValidation.error!,
        correctedValue: metersValidation.value,
      },
    };
  }

  // Validate interval
  const intervalValidation = validateInRange(
    values.intervalMs,
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    'Auto interval'
  );
  if (!intervalValidation.isValid) {
    return {
      error: {
        field: 'intervalMs',
        message: intervalValidation.error!,
        correctedValue: intervalValidation.value,
      },
    };
  }

  // Optionally validate robot count
  let countValue: number | undefined;
  if (includeRobotCount) {
    const countValidation = validateInRange(
      values.robotCount,
      MIN_ROBOT_COUNT,
      MAX_ROBOT_COUNT,
      'Robot count'
    );
    if (!countValidation.isValid) {
      return {
        error: {
          field: 'robotCount',
          message: countValidation.error!,
          correctedValue: countValidation.value,
        },
      };
    }
    countValue = countValidation.value;
  }

  // All validations passed
  return {
    validated: {
      meters: metersValidation.value,
      intervalMs: intervalValidation.value,
      count: countValue,
    },
  };
}
