/**
 * A profile is a generator function which takes a prefix (the name of the group to
 * use in commands), the patch map, and the current state of all stateless effects
 */
export type Profile = (
  prefix: string,
  addresses: Record<number, number[]>,
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
    if (address >= 256)
      throw new Error(
        "invalid address, combining patch " +
          patch +
          " with offset " +
          offset +
          " was out of bounds (>= 256)",
      );

    this._data[patch + offset] = value & 0xff;
  }

  toData(): Record<number, number> {
    return this._data;
  }
}

export class ChannelUniverse<T extends Record<string, number>> {
  private readonly _channels: T;
  private _universe: Universe;

  constructor(channels: T) {
    this._channels = channels;
  }

  assignMany(patches: number[], channels: Partial<Record<keyof T, number>>) {
    patches.forEach((a) =>
      Object.entries(channels).forEach((entry) =>
        this.assignChannel(a, entry[0], entry[1]),
      ),
    );
  }

  assignChannel(patch: number, channel: keyof T, value: number) {
    this._universe.assign8Bit(patch, this._channels[channel], value);
  }

  toData() {
    return this._universe.toData();
  }
}
