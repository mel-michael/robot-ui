export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isValidNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value);
}

export interface ValidationResult {
  isValid: boolean;
  value: number;
  error?: string;
}

export function validateInRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (!isValidNumber(value)) {
    return {
      isValid: false,
      value: min,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (value < min) {
    return {
      isValid: false,
      value: min,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (value > max) {
    return {
      isValid: false,
      value: max,
      error: `${fieldName} must be at most ${max}`,
    };
  }

  return {
    isValid: true,
    value,
  };
}
