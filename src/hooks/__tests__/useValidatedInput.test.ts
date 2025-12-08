import { describe, it, expect, afterEach, afterAll, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidatedInput } from '../useValidatedInput';

describe('useValidatedInput', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });
  it('initializes with provided value', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    expect(result.current.value).toBe(5);
  });

  it('updates value on change with valid number', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '7' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(7);
  });

  it('replaces NaN with min value on change', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: 'abc' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(0);
  });

  it('replaces Infinity with min value on change', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '1e999' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(0);
  });

  it('clamps value to min on blur when below minimum', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '-5' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(-5);

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.value).toBe(0);
  });

  it('clamps value to max on blur when above maximum', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '15' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(15);

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.value).toBe(10);
  });

  it('keeps value unchanged on blur when within range', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '7' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.value).toBe(7);
  });

  it('setValue updates the value directly', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      result.current.setValue(8);
    });

    expect(result.current.value).toBe(8);
  });

  it('handles decimal values correctly', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 0.5,
        min: 0.1,
        max: 1.0,
      })
    );

    act(() => {
      const event = {
        target: { value: '0.75' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(0.75);

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.value).toBe(0.75);
  });

  it('handles empty string input', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 5,
        min: 0,
        max: 10,
      })
    );

    act(() => {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe(0);
  });

  it('handles negative ranges', () => {
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: -5,
        min: -10,
        max: -1,
      })
    );

    act(() => {
      const event = {
        target: { value: '-15' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.value).toBe(-10);
  });
});
