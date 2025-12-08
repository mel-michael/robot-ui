import { useState, useCallback, type ChangeEvent } from 'react';

interface UseValidatedInputOptions {
  initialValue: number;
  min: number;
  max: number;
}

interface UseValidatedInputReturn {
  value: number;
  setValue: (value: number) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Custom hook for managing validated numeric inputs with automatic clamping
 *
 * @param initialValue - Starting value for the input
 * @param min - Minimum allowed value (will clamp to this on blur)
 * @param max - Maximum allowed value (will clamp to this on blur)
 *
 * @example
 * const meters = useValidatedInput({
 *   initialValue: 1,
 *   min: 0.1,
 *   max: 1000
 * });
 *
 * <input value={meters.value} onChange={meters.handleChange} onBlur={meters.handleBlur} />
 */
export const useValidatedInput = ({
  initialValue,
  min,
  max,
}: UseValidatedInputOptions): UseValidatedInputReturn => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    // Clamp value to min/max range when user leaves the input
    const clamped = clamp(value, min, max);
    setValue(clamped);
  }, [value, min, max]);

  return {
    value,
    setValue,
    handleChange,
    handleBlur,
  };
};
