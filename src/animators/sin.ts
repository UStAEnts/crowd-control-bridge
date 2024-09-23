import { animator } from "./animator";

// Combined graph
// https://www.desmos.com/calculator/njygpnzkhs

/**
 * Simple sin function in the range 0-100 for input range 0-255
 * Graph: https://www.desmos.com/calculator/oqvpsmzos1
 */
export const sin = animator(
  "sin",
  (t) => (100 / 2) * Math.sin(0.02463994238 * t) + 100 / 2,
);

/**
 * Inverse of {@link sin} in the range 0-100 for input range 0-255
 * Graph: https://www.desmos.com/calculator/s0tlhl8l6u
 */
export const inverseSin = animator(
  "isin",
  (t) => (100 / 2) * Math.sin(0.02463994238 * (t + 127)) + 100 / 2,
);
