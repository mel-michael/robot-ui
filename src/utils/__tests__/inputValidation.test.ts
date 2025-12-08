import { describe, it, expect } from 'vitest';
import { validateAllInputs } from '../inputValidation';

describe('validateAllInputs', () => {
  describe('when all inputs are valid', () => {
    it('returns validated values without robot count', () => {
      const result = validateAllInputs(
        { meters: 5, intervalMs: 1000, robotCount: 20 },
        false
      );

      expect(result).toEqual({
        validated: {
          meters: 5,
          intervalMs: 1000,
          count: undefined,
        },
      });
    });

    it('returns validated values with robot count', () => {
      const result = validateAllInputs(
        { meters: 5, intervalMs: 1000, robotCount: 20 },
        true
      );

      expect(result).toEqual({
        validated: {
          meters: 5,
          intervalMs: 1000,
          count: 20,
        },
      });
    });
  });

  describe('when meters is invalid', () => {
    it('returns error when meters is below minimum', () => {
      const result = validateAllInputs(
        { meters: 0.05, intervalMs: 1000, robotCount: 20 },
        false
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.field).toBe('meters');
        expect(result.error.message).toContain('at least 0.1');
        expect(result.error.correctedValue).toBe(0.1);
      }
    });

    it('returns error when meters is above maximum', () => {
      const result = validateAllInputs(
        { meters: 2000, intervalMs: 1000, robotCount: 20 },
        false
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.field).toBe('meters');
        expect(result.error.message).toContain('at most 1000');
        expect(result.error.correctedValue).toBe(1000);
      }
    });
  });

  describe('when interval is invalid', () => {
    it('returns error when interval is below minimum', () => {
      const result = validateAllInputs(
        { meters: 5, intervalMs: 50, robotCount: 20 },
        false
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.field).toBe('intervalMs');
        expect(result.error.message).toContain('at least 100');
        expect(result.error.correctedValue).toBe(100);
      }
    });
  });

  describe('when robot count is invalid', () => {
    it('returns error when count is below minimum (when validated)', () => {
      const result = validateAllInputs(
        { meters: 5, intervalMs: 1000, robotCount: 0 },
        true
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.field).toBe('robotCount');
        expect(result.error.message).toContain('at least 1');
        expect(result.error.correctedValue).toBe(1);
      }
    });

    it('does not validate count when includeRobotCount is false', () => {
      const result = validateAllInputs(
        { meters: 5, intervalMs: 1000, robotCount: 0 },
        false
      );

      expect(result).toEqual({
        validated: {
          meters: 5,
          intervalMs: 1000,
          count: undefined,
        },
      });
    });
  });

  describe('when multiple inputs are invalid', () => {
    it('returns the first validation error (meters checked first)', () => {
      const result = validateAllInputs(
        { meters: 0, intervalMs: 0, robotCount: 0 },
        true
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.field).toBe('meters');
      }
    });
  });
});

