import { expect, test, describe } from "vitest";
import {
  channelsForUniverse,
  ChannelUniverse,
  Universe,
} from "../../src/fixture-profiles/profile";

describe("Universe", () => {
  test("universe generates valid dmx mappings with simple assignment", () => {
    const universe = new Universe();
    universe.assign8Bit(0, 0, 1);
    universe.assign8Bit(0, 1, 2);
    universe.assign8Bit(0, 2, 3);
    universe.assign8Bit(10, 0, 4);
    universe.assign8Bit(10, 1, 5);
    universe.assign8Bit(10, 2, 6);
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(6);
    expect(data[0]).toBe(1);
    expect(data[1]).toBe(2);
    expect(data[2]).toBe(3);
    expect(data[10]).toBe(4);
    expect(data[11]).toBe(5);
    expect(data[12]).toBe(6);
  });

  test("universe generates valid dmx mappings with assign many", () => {
    const universe = new Universe();
    universe.assignMany([0, 10], {
      0: 1,
      1: 2,
      2: 3,
    });
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(6);
    expect(data[0]).toBe(1);
    expect(data[1]).toBe(2);
    expect(data[2]).toBe(3);
    expect(data[10]).toBe(1);
    expect(data[11]).toBe(2);
    expect(data[12]).toBe(3);
  });

  test("universe does not set addresses outside of range", () => {
    const universe = new Universe();
    universe.assign8Bit(0, 0, 1);
    universe.assign8Bit(0, -10, 2);
    universe.assign8Bit(513, 0, 3);
    universe.assign8Bit(100, 490, 4);
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(1);
    expect(data[0]).toBe(1);
  });

  test("universe does nto set values outside of range", () => {
    const universe = new Universe();
    universe.assign8Bit(0, 0, 1);
    universe.assign8Bit(0, 1, 1000);
    universe.assign8Bit(0, 2, -10);
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(1);
    expect(data[0]).toBe(1);
  });
});

describe("ChannelUniverse", () => {
  const testChannels = {
    A: 0,
    B: 1,
  } as const;

  test("it correctly assigns from channels", () => {
    const universe = new ChannelUniverse(testChannels, 0);
    universe.assignChannel(0, "A", 1);
    universe.assignChannel(0, "B", 2);
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(2);
    expect(data[0]).toBe(1);
    expect(data[1]).toBe(2);
  });

  test("it ignores invalid channels", () => {
    const universe = new ChannelUniverse(testChannels, 0);
    universe.assignChannel(0, "A", 1);
    // Intentionally breaking the type safety here to check behaviour for unsanitized inputs
    universe.assignChannel(0, "C" as any, 2);
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(1);
    expect(data[0]).toBe(1);
  });

  test("it correctly assigns many channels", () => {
    const universe = new ChannelUniverse(testChannels, 0);
    universe.assignMany([0], {
      A: 1,
      B: 2,
    });
    const data = universe.toData();

    expect(Object.keys(data).length).toBe(2);
    expect(data[0]).toBe(1);
    expect(data[1]).toBe(2);
  });

  test("it correctly proxies universe index", () => {
    expect(new ChannelUniverse(testChannels, 122).index).toBe(122);
  });
});

test("it gets channels for universe", () => {
  const patch = {
    0: [1, 2, 3],
    1: [4, 5],
  };

  expect(channelsForUniverse(patch, 0)).toStrictEqual([1, 2, 3]);
  expect(channelsForUniverse(patch, 1)).toStrictEqual([4, 5]);
  expect(channelsForUniverse(patch, 2)).toStrictEqual([]);
});
