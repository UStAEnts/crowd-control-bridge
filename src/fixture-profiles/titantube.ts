import {
  channelsForUniverse,
  GeneratedProfile,
  Profile,
  Universe,
} from "./profile";

const _ = require("logger");

const channels = {
  0: {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    SHUTTER: 24,
  },
  1: {
    RED: 3,
    GREEN: 4,
    BLUE: 5,
    SHUTTER: 25,
  },
  2: {
    RED: 6,
    GREEN: 7,
    BLUE: 8,
    SHUTTER: 26,
  },
  3: {
    RED: 9,
    GREEN: 10,
    BLUE: 11,
    SHUTTER: 27,
  },
  4: {
    RED: 12,
    GREEN: 13,
    BLUE: 14,
    SHUTTER: 28,
  },
  5: {
    RED: 15,
    GREEN: 16,
    BLUE: 17,
    SHUTTER: 29,
  },
  6: {
    RED: 18,
    GREEN: 19,
    BLUE: 20,
    SHUTTER: 30,
  },
  7: {
    RED: 21,
    GREEN: 22,
    BLUE: 23,
    SHUTTER: 31,
  },
};

export default function (prefix, addresses) {
  prefix = prefix || "tubes";

  _.trace(`initialised titan tube with prefix "${prefix}"`, addresses);

  const intensityByUniverse = {};
  let lastSentColours = {};

  function colorToDMX(
    addresses: number[],
    universeIndex: number,
    universe: Universe,
    color,
  ) {
    if (color === undefined) {
      color = lastSentColours[universeIndex] || [0, 0, 0];
    }

    if (color.length === 3) {
      const intensityMultiplier = intensityByUniverse[universeIndex] || 0;

      const red = parseInt(color[0], 10);
      const green = parseInt(color[1], 10);
      const blue = parseInt(color[2], 10);

      for (let cell in Object.keys(channels)) {
        universe.assignMany(addresses, {
          [channels[cell].RED]: red * intensityMultiplier,
          [channels[cell].GREEN]: green * intensityMultiplier,
          [channels[cell].BLUE]: blue * intensityMultiplier,
        });
      }

      lastSentColours[universeIndex] = [red, green, blue];
    }
  }

  function intensityToDMX(
    addresses: number[],
    universeIndex: number,
    universe: Universe,
    intensity,
  ) {
    intensityByUniverse[universeIndex] = parseInt(intensity, 10) / 255;
  }

  /**
   * @param universe {number}
   * @param command {string}
   */
  function commandToDMX(universe, command): Record<number, number> {
    const parts = command.toLowerCase().split(".");
    const [key, action, ...remainder] = parts;

    if (key !== prefix) return {};

    const universeData = new Universe();
    const universeAddresses = channelsForUniverse(addresses, universe);

    if (action === "intensity") {
      intensityToDMX(universeAddresses, universe, universeData, parts[2]);
    }
    colorToDMX(
      universeAddresses,
      universe,
      universeData,
      action === "color" ? remainder : undefined,
    );

    return universeData.toData();
  }

  return {
    processor: commandToDMX,
    commands: [
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
      new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+`),
    ],
  } satisfies GeneratedProfile;
}
