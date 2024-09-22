import {
  channelsForUniverse,
  ChannelUniverse,
  GeneratedProfile,
  Patch,
} from "./profile";

const _ = require("logger");

const channels = {
  PAN: 0,
  TILT: 1,
  PT_SPEED: 2,
  SPECIAL: 3,
  COLOR: 4,
  EFFECT_SPEED: 5,
  STATIC_GOBO: 6,
  ROTO_GOBO: 7,
  ROTO_GOBO_INDEX: 8,
  PRISM: 9,
  PRISM_INDEX: 10,
  FROST: 11,
  ZOOM: 12,
  FOCUS: 13,
  SHUTTER: 14,
  DIMMER: 15,
};

const colors = {
  OPEN: 0,
  DEEP_RED: 9,
  DEEP_BLUE: 18,
  YELLOW: 27,
  GREEN: 37,
  MAGENTA: 46,
  AZURE: 55,
  RED: 64,
  DARK_GREEN: 73,
  AMBER: 82,
  BLUE: 91,
  ORANGE: 101,
  CTO: 110,
  UV: 119,
};

export default function (
  prefix: string,
  addresses: Patch,
  effects: Record<string, number>,
) {
  prefix = prefix || "robe";

  _.trace(`initialised pointe with prefix "${prefix}"`, addresses);

  function colorToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    color: string,
  ) {
    const key = color.toUpperCase();
    if (key in colors) {
      universe.assignMany(addresses, {
        COLOR: colors[key as keyof typeof colors] * 0.392222222,
      });
    }
  }

  function effectsToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    effect: string,
  ) {
    if (effect === "strobe") {
      universe.assignMany(addresses, { SHUTTER: (210 / 255) * 100 });
    }
  }

  function intensityToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    intensity: string,
  ) {
    if (intensity === "strobe") {
      universe.assignMany(addresses, { SHUTTER: (210 / 255) * 100 });
      return;
    }
    try {
      const number = parseInt(intensity, 10);
      if (!isNaN(number)) {
        universe.assignMany(addresses, { DIMMER: number });
      }
    } catch (e) {}
  }

  function positionToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    position: string,
  ) {
    if (position === "move") {
      universe.assignMany(addresses, {
        PAN: effects.sin,
        TILT: 100 - effects.sin,
      });
    }
  }

  function commandToDMX(
    universe: number,
    command: string,
  ): Record<number, number> {
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

    return universeData.toData();
  }

  const colorCommands = Object.entries(colors).map(
    ([name, _]) => `${prefix}.colour.${name.toLowerCase()}`,
  );

  return {
    processor: commandToDMX,
    commands: [
      `${prefix}.position.move`,
      ...colorCommands,
      `${prefix}.effect.strobe`,
      `${prefix}.effect.clear`,
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
    ],
  } satisfies GeneratedProfile;
}
