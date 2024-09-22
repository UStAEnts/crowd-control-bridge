import {
  channelsForUniverse,
  ChannelUniverse,
  GeneratedProfile,
  Profile,
} from "./profile";

const _ = require("logger");

const channels = {
  PAN: 0,
  PAN_FINE: 1,
  TILT: 2,
  TILT_FINE: 3,
  PT_SPEED: 4,
  PAN_SPIN: 5,
  TILT_SPIN: 6,
  CTRL: 7,
  COLOR: 8,
  RED: 9,
  RED_FINE: 10,
  GREEN: 11,
  GREEN_FINE: 12,
  BLUE: 13,
  BLUE_FINE: 14,
  WHITE: 15,
  WHITE_FINE: 16,
  CTO: 17,
  COLOR_MIX: 18,
  PRISM: 19,
  FLOWER: 20,
  EFFECT: 21,
  ZOOM: 22,
  ZOOM_FINE: 23,
  SHUTTER: 24,
  INTENSITY: 25,
  INTENSITY_FINE: 26,
};

// 3.53 = 9 * x

export default function (prefix, addresses, effects) {
  prefix = prefix || "spikies";

  _.trace(`initialised spikie with prefix "${prefix}"`, addresses);

  function colorToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    color,
  ) {
    if (color.length >= 3) {
      universe.assignMany(addresses, {
        RED: parseInt(color[0], 10),
        GREEN: parseInt(color[1], 10),
        BLUE: parseInt(color[2], 10),
        WHITE: 0,
      });
    }
  }

  function effectsToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    effect,
  ) {
    if (effect === "strobe") {
      universe.assignMany(addresses, {
        SHUTTER: (210 / 255) * 100,
      });
    }

    if (effect === "move") {
      universe.assignMany(addresses, {
        PAN: 100 - effects.sin,
        TILT: 200 - effects.sin,
      });
    }

    if (effect === "clear") {
      universe.assignMany(addresses, {
        PAN: 128,
        TILT: 128,
      });
    }
  }

  function intensityToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    intensity,
  ) {
    try {
      const number = parseInt(intensity, 10);
      if (!isNaN(number)) {
        universe.assignMany(addresses, {
          INTENSITY: number,
          COLOR_MIX: 45,
          SHUTTER: 32,
        });
      }
    } catch (e) {}
  }

  function positionToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    position,
  ) {
    if (position === "home") {
      universe.assignMany(addresses, {
        PAN: 128,
        TILT: 128,
      });
    }
  }

  function commandToDMX(universe, command): Record<number, number> {
    const parts = command.toLowerCase().split(".");
    const [key, action, ...remainder] = parts;

    if (key !== prefix) return {};

    const universeData = new ChannelUniverse(channels, universe);
    const universeAddresses = channelsForUniverse(addresses, universe);

    if (action === "colour")
      colorToDMX(universeAddresses, universeData, remainder);
    if (action === "position")
      positionToDMX(universeAddresses, universeData, parts[2]);
    if (action === "intensity")
      intensityToDMX(universeAddresses, universeData, parts[2]);
    if (action === "effect")
      effectsToDMX(universeAddresses, universeData, parts[2]);

    return universeData.toData();
  }

  return {
    processor: commandToDMX,
    commands: [
      `${prefix}.effect.move`,
      `${prefix}.position.home`,
      `${prefix}.effect.strobe`,
      `${prefix}.effect.clear`,
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
      new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+(\\.[0-9]+)?`),
    ],
  } satisfies GeneratedProfile;
}
