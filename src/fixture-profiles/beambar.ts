import {
  channelsForUniverse,
  ChannelUniverse,
  GeneratedProfile,
  Patch,
} from "./profile";

const _ = require("logger");

const channels = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  WHITE: 3,
  DIMMER: 4,
  SHUTTER: 5,
};

const cells = 10;

export default function (prefix: string, addresses: Patch) {
  prefix = prefix || "bars";

  _.trace(`initialised beambar with prefix "${prefix}"`, addresses);

  let lastSentColours: Record<number, [string, string, string, string]> = {};

  function colorToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    color: string[] | undefined,
  ) {
    const colors = color ??
      lastSentColours[universe.index] ?? ["0", "0", "0", "0"];

    if (colors.length === 4) {
      const red = parseInt(colors[0], 10);
      const green = parseInt(colors[1], 10);
      const blue = parseInt(colors[2], 10);
      const white = parseInt(colors[3], 10);

      runForCellAddresses(addresses, (cellAddresses) =>
        universe.assignMany(cellAddresses, {
          RED: red,
          GREEN: green,
          BLUE: blue,
          WHITE: white,
        }),
      );

      lastSentColours[universe.index] = [
        colors[0],
        colors[1],
        colors[2],
        colors[3],
      ];
    }
  }

  function intensityToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    intensity: string,
  ) {
    runForCellAddresses(addresses, (cellAddresses) =>
      universe.assignMany(cellAddresses, { DIMMER: parseInt(intensity, 10) }),
    );
  }

  function runForCellAddresses(
    addresses: number[],
    handler: (addresses: number[]) => void,
  ) {
    for (let cell = 0; cell < cells; cell++) {
      let cellAddresses = addresses.map(
        (e) => e + Object.keys(channels).length * cell,
      );

      handler(cellAddresses);
    }
  }

  /**
   * @param universe {number}
   * @param command {string}
   */
  function commandToDMX(
    universe: number,
    command: string,
  ): Record<number, number> {
    const parts = command.toLowerCase().split(".");
    const [key, action, ...remainder] = parts;

    if (key !== prefix) return {};

    const universeData = new ChannelUniverse(channels, universe);
    const universeAddresses = channelsForUniverse(addresses, universe);

    if (action === "intensity")
      intensityToDMX(universeAddresses, universeData, parts[2]);
    if (action === "colour")
      colorToDMX(universeAddresses, universeData, remainder);

    return universeData.toData();
  }

  return {
    processor: commandToDMX,
    commands: [
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
      new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+`),
    ],
  } satisfies GeneratedProfile;
}
