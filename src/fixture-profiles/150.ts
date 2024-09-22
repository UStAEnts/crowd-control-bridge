import {
  channelsForUniverse,
  ChannelUniverse,
  GeneratedProfile,
  Patch,
} from "./profile";

import * as _ from "logger";

const channels = {
  PAN: 0,
  PAN_FINE: 1,
  TILT: 2,
  TILT_FINE: 3,
  PT_SPEED: 4,
  CTRL: 5,
  COLOR: 6,
  RED: 7,
  RED_FINE: 8,
  GREEN: 9,
  GREEN_FINE: 10,
  BLUE: 11,
  BLUE_FINE: 12,
  WHITE: 13,
  WHITE_FINE: 14,
  CTC: 15,
  COLOR_CTRL: 16,
  ZOOM: 17,
  ZOOM_FINE: 18,
  SHUTTER: 19,
  INTENSITY: 20,
  INTENSITY_FINE: 21,
} as const;

export default function (
  prefix: string,
  addresses: Patch,
  effects: Record<string, number>,
) {
  prefix = prefix || "150s";

  _.trace(`initialised 150s with prefix "${prefix}"`, addresses);

  function colorToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    color: string[],
  ) {
    if (color.length === 3 || color.length === 4) {
      const red = parseInt(color[0], 10);
      const green = parseInt(color[1], 10);
      const blue = parseInt(color[2], 10);
      const white = color.length === 4 ? parseInt(color[3], 10) : undefined;

      if (
        red < 0 ||
        red > 255 ||
        green < 0 ||
        green > 255 ||
        blue < 0 ||
        blue > 255 ||
        (white !== undefined && (white < 0 || white > 255))
      ) {
        return;
      }

      // If white is specified, we generate {WHITE: value} and spread that below, if its not we spread an empty object
      // which does nothing
      const whiteExpand = white === undefined ? {} : { WHITE: white };

      universe.assignMany(addresses, {
        RED: parseInt(color[0], 10),
        GREEN: parseInt(color[1], 10),
        BLUE: parseInt(color[2], 10),
        ...whiteExpand,
      });
    }
  }

  function effectsToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    effect: string,
  ) {
    switch (effect) {
      case "strobe":
        universe.assignMany(addresses, { SHUTTER: (210 / 255) * 100 });
        break;
      case "move":
        universe.assignMany(addresses, {
          PAN: effects.sin,
          TILT: 100 - effects.SIN,
        });
        break;
      case "clear":
        universe.assignMany(addresses, { PAN: 128, TILT: 128 });
        break;
    }
  }

  function intensityToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    intensity: string,
  ) {
    try {
      const number = parseInt(intensity, 10);

      if (number < 0 || number > 255) {
        return;
      }

      console.log(number);

      if (!isNaN(number)) {
        universe.assignMany(addresses, {
          INTENSITY: number,
          SHUTTER: 32,
          COLOR_CTRL: 45,
        });
      }
    } catch (e) {}
  }

  function positionToDMX(
    addresses: number[],
    universe: ChannelUniverse<typeof channels>,
    position: string,
  ) {
    if (position === "home") {
      universe.assignMany(addresses, { PAN: 128, TILT: 128 });
    }
  }

  function commandToDMX(
    universe: number,
    command: string,
  ): Record<number, number> {
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
      `${prefix}.position.home`,
      `${prefix}.effect.strobe`,
      `${prefix}.effect.clear`,
      `${prefix}.effect.move`,
      new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
      new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+(\\.[0-9]+)?`),
    ],
  } satisfies GeneratedProfile;
}
