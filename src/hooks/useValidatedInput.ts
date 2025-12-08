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
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export const useValidatedInput = ({
  initialValue,
  min,
  max,
}: UseValidatedInputOptions): UseValidatedInputReturn => {
  const [value, setValue] = useState(() => clamp(initialValue, min, max));

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (e.target.value === '' || !Number.isFinite(newValue)) {
      return;
    }
    setValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
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
