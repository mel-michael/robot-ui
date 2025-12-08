import { describe, it, expect } from 'vitest';
import { clamp, isValidNumber, validateInRange } from '../validation';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('clamps to min when below minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(0.05, 0.1, 10)).toBe(0.1);
  });

  it('clamps to max when above maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(1001, 0, 1000)).toBe(1000);
  });

  it('handles negative ranges', () => {
    expect(clamp(-15, -10, -5)).toBe(-10);
    expect(clamp(-3, -10, -5)).toBe(-5);
  });

  it('handles decimal values', () => {
    expect(clamp(5.5, 0, 10)).toBe(5.5);
    expect(clamp(0.05, 0.1, 1.0)).toBe(0.1);
  });
});

describe('isValidNumber', () => {
  it('returns true for valid numbers', () => {
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(42)).toBe(true);
    expect(isValidNumber(-42)).toBe(true);
    expect(isValidNumber(3.14)).toBe(true);
    expect(isValidNumber(1e10)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Number('abc'))).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(-Infinity)).toBe(false);
    expect(isValidNumber(1 / 0)).toBe(false);
  });
});

describe('validateInRange', () => {
  it('returns valid for values within range', () => {
    const result = validateInRange(5, 0, 10, 'Test');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(5);
    expect(result.error).toBeUndefined();
  });

  it('returns invalid for values below minimum', () => {
    const result = validateInRange(-5, 0, 10, 'Test');
    expect(result.isValid).toBe(false);
    expect(result.value).toBe(0);
    expect(result.error).toContain('at least 0');
  });

  it('returns invalid for values above maximum', () => {
    const result = validateInRange(15, 0, 10, 'Test');
    expect(result.isValid).toBe(false);
    expect(result.value).toBe(10);
    expect(result.error).toContain('at most 10');
  });

  it('handles NaN', () => {
    const result = validateInRange(NaN, 0, 10, 'Test');
    expect(result.isValid).toBe(false);
    expect(result.value).toBe(0);
    expect(result.error).toContain('valid number');
  });

  it('handles Infinity', () => {
    const result = validateInRange(Infinity, 0, 10, 'Test');
    expect(result.isValid).toBe(false);
    expect(result.value).toBe(0);
    expect(result.error).toContain('valid number');
  });

  it('includes field name in error message', () => {
    const result = validateInRange(-5, 0, 10, 'Move meters');
    expect(result.error).toContain('Move meters');
  });

  it('handles boundary values correctly', () => {
    const minResult = validateInRange(0, 0, 10, 'Test');
    expect(minResult.isValid).toBe(true);

    const maxResult = validateInRange(10, 0, 10, 'Test');
    expect(maxResult.isValid).toBe(true);
  });

  it('handles decimal ranges', () => {
    const result = validateInRange(0.5, 0.1, 1.0, 'Test');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(0.5);
  });
});
