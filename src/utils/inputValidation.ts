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

export interface ValidatedInputsWithoutCount {
  meters: number;
  intervalMs: number;
}

export interface ValidatedInputsWithCount {
  meters: number;
  intervalMs: number;
  count: number;
}

export interface ValidationError {
  field: 'meters' | 'intervalMs' | 'robotCount';
  message: string;
  correctedValue: number;
}

type ValidationSuccess<T extends boolean> = {
  validated: T extends true ? ValidatedInputsWithCount : ValidatedInputsWithoutCount;
};

type ValidationResult<T extends boolean> = ValidationSuccess<T> | { error: ValidationError };

export function validateAllInputs<T extends boolean>(
  values: InputValues,
  includeRobotCount: T
): ValidationResult<T> {
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

    return {
      validated: {
        meters: metersValidation.value,
        intervalMs: intervalValidation.value,
        count: countValidation.value,
      },
    } as ValidationResult<T>;
  }

  return {
    validated: {
      meters: metersValidation.value,
      intervalMs: intervalValidation.value,
    },
  } as ValidationResult<T>;
}
