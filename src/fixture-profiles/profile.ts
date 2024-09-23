import { pureEntries } from "../util";
import * as _ from "logger";

export type Patch = Record<number, number[]>;

/**
 * A profile is a generator function which takes a prefix (the name of the group to
 * use in commands), the patch map, and the current state of all stateless effects
 */
export type Profile = (
  prefix: string,
  addresses: Patch,
  effects: Record<string, number>,
) => GeneratedProfile;

/**
 * Processors work one universe at a time, they should process all patched devices
 * on that universe for the given command, and then return any modified values in
 * that DMX universe
 */
export type Processor = (
  universe: number,
  command: string,
) => Record<number, number>;

/**
 * A generated profile exposes a set of commands that the profile can accept as well
 * as the processor to be called for each command that is executed and for each
 * universe
 */
export type GeneratedProfile = {
  commands: (string | RegExp)[];
  processor: Processor;
};

export function channelsForUniverse(
  patch: Record<number, number[]>,
  universe: number,
): number[] {
  return patch[universe] ?? [];
}

export class Universe {
  private _data: Record<number, number> = {};

  assign8Bit(patch: number, offset: number, value: number) {
    const address = patch + offset;

    // This is technically wrong, it should be the range 0-511 (incl), or 1-512 (incl),
    // but because we want to adapt to different formats, we kind of need to accept both.
    // TODO: should we dynamically change this valid range based on the value of mapAddress1To0
    //   ie mapAddress1To0 ? 1-512 : 0-511
    if (address < 0 || address >= 512) {
      _.warn(
        "invalid address, combining patch " +
          patch +
          " with offset " +
          offset +
          " was out of bounds (outside range 0 >= c >= 512)",
      );
      return;
    }

    if (value < 0 || value >= 256) {
      _.warn(
        "invalid address, combining patch " +
          patch +
          " with offset " +
          offset +
          " tried to write value " +
          value +
          " (outside range 0 >= c >= 255)",
      );
      return;
    }

    this._data[patch + offset] = value & 0xff;
  }

  assignMany(patches: number[], offsetValues: Record<number, number>) {
    patches.forEach((a) =>
      pureEntries(offsetValues).forEach((entry) =>
        this.assign8Bit(a, Number(entry[0]), Number(entry[1])),
      ),
    );
  }

  toData(): Record<number, number> {
    return this._data;
  }
}

export class ChannelUniverse<T extends Record<string, number>> {
  private readonly _channels: T;
  private readonly _index: number;
  private readonly _universe: Universe = new Universe();

  constructor(channels: T, index: number) {
    this._channels = channels;
    this._index = index;
  }

  assignMany(patches: number[], channels: Partial<Record<keyof T, number>>) {
    patches.forEach((a) =>
      pureEntries(channels).forEach((entry) => {
        if (entry && entry[0] !== undefined && entry[1] !== undefined) {
          this.assignChannel(a, entry[0], entry[1]);
        }
      }),
    );
  }

  assignChannel(patch: number, channel: keyof T, value: number) {
    if (Object.hasOwnProperty.call(this._channels, channel)) {
      this._universe.assign8Bit(patch, this._channels[channel], value);
    } else {
      let chAsString = "[symbol]";
      if (typeof channel === "string") chAsString = channel;

      _.warn(
        "tried to write channel " +
          chAsString +
          " but its not a valid channel " +
          Object.keys(this._channels),
      );
    }
  }

  toData() {
    return this._universe.toData();
  }

  get index() {
    return this._index;
  }
}
