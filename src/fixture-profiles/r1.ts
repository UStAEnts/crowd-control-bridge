import {
  channelsForUniverse,
  ChannelUniverse,
  GeneratedProfile,
  Profile,
} from "./profile";

const _ = require("logger");

const home = {
  PAN: 128,
  TILT: 128,
};

const channels = {
  PAN: 0,
  PAN_FINE: 1,
  TILT: 2,
  TILT_FINE: 3,
  PT_SPEED: 4,
  DIMMER: 5,
  DIMMER_FINE: 6,
  SHUTTER: 7,
  COLOR: 8,
  GOBO: 9,
  GOBO_ROT: 10,
  GOBO_2: 11,
  FOCUS: 12,
  PRISM: 13,
  PRISM_ROT: 14,
  IRIS: 15,
  PT_MACRO: 16,
  SPEED: 17,
  CTRL: 18,
};

const colors = {
  OPEN: 0,
  RED: 7,
  ORANGE: 14,
  GREEN: 21,
  YELLOW: 28,
  BLUE: 35,
  CTO3200K: 42,
  MAGENTA: 49,
  PURPLE: 56,
  SCROLL: 128,
};

const gobo1 = {
  OPEN: 0,
  G1: 8,
  G2: 16,
  G3: 24,
  G4: 32,
  G5: 40,
  G6: 48,
  G7: 56,
};

// 3.53 = 9 * x

export default function (prefix, addresses, effects) {
  prefix = prefix || "r1";

  _.trace(`initialised r1s with prefix "${prefix}"`, addresses);

  function colorToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    color: string,
  ) {
    if (colors.hasOwnProperty(color.toUpperCase())) {
      universe.assignMany(addresses, { COLOR: colors[color.toUpperCase()] });
    }
  }

  function effectsToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    effect,
  ) {
    if (effect === "strobe") {
      universe.assignMany(addresses, { SHUTTER: (210 / 255) * 100 });
    }

    if (effect === "move") {
      universe.assignMany(addresses, {
        PAN: effects.sin,
        TILT: 100 - effects.sin,
      });
    }

    if (effect === "clear") {
      universe.assignMany(addresses, { PAN: home.PAN, TILT: home.TILT });
    }
  }

  function intensityToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    intensity,
  ) {
    if (intensity === "strobe") {
      universe.assignMany(addresses, { SHUTTER: (210 / 255) * 100 });
      return;
    }

    try {
      const number = parseInt(intensity, 10);
      if (!isNaN(number)) {
        universe.assignMany(addresses, {
          DIMMER: number,
          SHUTTER: 4,
        });
      }
    } catch (e) {}
  }

  function goboToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    gobo,
  ) {
    if (gobo1.hasOwnProperty(gobo.toUpperCase())) {
      universe.assignMany(addresses, { GOBO: gobo1[gobo.toUpperCase()] });
    }
  }

  function positionToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    position,
  ) {
    if (position === "still") {
      universe.assignMany(addresses, {
        PAN: 0,
        TILT: 0,
      });
    }

    if (position === "home") {
      universe.assignMany(addresses, {
        PAN: 128,
        TILT: 128,
      });
    }
  }

  function commandToDMX(universe, command): Record<number, number> {
    const parts = command.toLowerCase().split(".");
    if (parts[0] !== prefix) return {};

    const universeData = new ChannelUniverse(channels, universe);
    const universeAddresses = channelsForUniverse(addresses, universe);

    if (parts[1] === "colour")
      colorToDMX(universeAddresses, universeData, parts[2]);
    if (parts[1] === "position")
      positionToDMX(universeAddresses, universeData, parts[2]);
    if (parts[1] === "intensity")
      intensityToDMX(universeAddresses, universeData, parts[2]);
    if (parts[1] === "effect")
      effectsToDMX(universeAddresses, universeData, parts[2]);
    if (parts[1] === "gobo")
      goboToDMX(universeAddresses, universeData, parts[2]);

    return universeData.toData();
  }

  return {
    processor: commandToDMX,
    commands: [
      `${prefix}.effect.move`,
      `${prefix}.position.still`,
      `${prefix}.position.home`,
      ...Object.entries(colors).map(
        ([name, _]) => `${prefix}.colour.${name.toLowerCase()}`,
      ),
      `${prefix}.effect.strobe`,
      `${prefix}.effect.clear`,
      ...Object.entries(gobo1).map(
        ([name, _]) => `${prefix}.gobo.${name.toLowerCase()}`,
      ),
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
    ],
  } satisfies GeneratedProfile;
}
