import { sin, inverseSin } from "../../src/animators/sin";
import { expect, test } from "vitest";

test("sin animates between 0 and 100 only for 0-255", () => {
  for (let i = 0; i < 255; i++) {
    const result = sin(i);
    console.log(`${i} = ${result}`);
    expect(result).toBeLessThanOrEqual(255);
    expect(result).toBeGreaterThanOrEqual(0);
  }
});

test("isin animates between 0 and 100 only for 0-255", () => {
  for (let i = 0; i < 255; i++) {
    const result = inverseSin(i);
    console.log(`${i} = ${result}`);
    expect(result).toBeLessThanOrEqual(255);
    expect(result).toBeGreaterThanOrEqual(0);
  }
});
