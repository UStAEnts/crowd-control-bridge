/*
  Lighting module - controls lighting via ArtNet, by fetching commands from the server
*/

import config from "./config";
import * as _ from "logger";
import axios from "axios";
import animatedEffects from "./animators";
import fixtures from "./fixtures";
import { Processor } from "./fixture-profiles/profile";
import { Animator } from "./animators/animator";
import { pureEntries } from "./util";

/**
 * Set the minimum log level to BASE (the lowest level) so we see everything.
 */
_.setMinimumLevel(_.LogLevel.BASE);

/**
 * The set of acceptable commands from the server
 */
let COMMANDS: (string | RegExp)[] = [];
/**
 * The enabled merge controllers for different fixtures, each function should take a command and return an object of
 * DMX data
 * @type {Function[]}
 */
const mergers: Processor[] = [];

/**
 * An object containing the output of currently running animations. The result of each animator is determined by itself
 * so only use effects you know the result of
 */
const effects: Record<string, number> = {};

/**
 * Loads all the fixture profiles and binds them to the addresses specified in the addresses object
 */
async function loadFixtures() {
  for (const [group, fixture] of Object.entries(fixtures)) {
    _.trace(`registering ${fixture.name} with addresses ${fixture.patch}`);

    const { processor, commands } = fixture.profile(
      group,
      fixture.patch,
      effects,
    );
    mergers.push(processor);
    COMMANDS.push(...commands);

    _.trace("Adding commands: ", commands);
  }

  _.trace("all profiles loaded, final commands:", COMMANDS);
}

/**
 * Starts executing all animators. Animators are stati
 * Finds all animator files and requires them pushing their executors and creating the initial values in the effects
 * object. Animator functions will be called every 10ms.
 */
async function enableAnimators() {
  let animationTime = 0;
  let animators: Animator[] = [];

  const animationHandler = () => {
    if (++animationTime > 255) animationTime = 0;

    animators.forEach((f) => (effects[f.identifier] = f(animationTime)));
  };
  setInterval(animationHandler, 10);

  animatedEffects.forEach((v) => {
    animators.push(v);
    effects[v.identifier] = v.initial ?? 0;
  });
}

/**
 * Fetches commands from the server and processes them.
 */
async function fetchCommands() {
  axios
    .get(`${config.crowdcontrolServer}/getLightRequests.php`)
    .then((response) => {
      response.data.forEach((command: string) => {
        handleCommand(command);
      });
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });
}

let activeCommands: string[] = [];

/**
 * Handles an incoming message from server. It will check the command against the list of possible
 * acceptable commands (without a '-' symbol if present). It will remove the command if it is prefixed with '-' and if
 * not it will replace all conflicting commands (with the same two part prefix) to prevent overlapping instructions. If
 * it is not found or accepted it will reject it.
 */
function handleCommand(command: string) {
  const test = command.startsWith("-") ? command.substring(1) : command;
  const matched = COMMANDS.map((e) =>
    typeof e === "string"
      ? e.toLowerCase() === test.toLowerCase()
      : e.test(test),
  ).reduce((old, now) => old || now);

  if (!matched) {
    _.warn(
      `message "${command}" rejected because it is not contained within the valid commands`,
    );
    return;
  }

  if (command.startsWith("-")) {
    const toRemove = command.substring(1);
    activeCommands = activeCommands.filter((e) => e !== toRemove);

    _.debug(`removed command ${toRemove}`);

    return;
  }

  // Find all conflicting commands
  const [key, action] = command.split(".");
  const conflictKey = `${key}.${action}`;
  // const conflictKey = command.substr(0, command.lastIndexOf('.') + 1);
  const resultant = ([] as string[]).concat(
    // All active commands that conflict
    activeCommands.filter((e) => !e.startsWith(conflictKey)),
    // Plus the new command
    [command],
  );

  _.info(
    `Command: ${command} has caused a change of ${resultant.length - activeCommands.length} instructions`,
  );

  activeCommands = resultant;
  console.trace(activeCommands);
}

const lastOutgoingData: Record<number, number[]> = {};

/**
 * Sends artnet data based on the activeCommands
 */
function sendArtnetUpdate() {
  // TODO: determine what universes to send to based on config from somewhere
  for (let universe = 0; universe < 50; universe++) {
    const commands = activeCommands
      .map((command) => mergers.map((merger) => merger(universe, command)))
      .flat()
      .reduce((prev, cur) => Object.assign(prev, cur), {});
    if (Object.keys(commands).length === 0) {
      continue;
    }

    // array of each channel value in universe
    var dmx = lastOutgoingData[universe] ?? Array(512).fill(0);

    pureEntries(commands).forEach(([k, _]) => {
      dmx[k] = commands[k];
    });

    artnet.set(universe, 1, dmx);

    lastOutgoingData[universe] = dmx;
  }
}

var options = {
  iface: config.lightingInterface,
};
const artnet = require("artnet")(options);

module.exports = async () => {
  console.log("Lighting module initialized");

  await loadFixtures().then(enableAnimators).catch(console.error);

  console.log("Begin fetching commands");
  setInterval(fetchCommands, 100);

  console.log("Begin outputting artnet");
  setInterval(sendArtnetUpdate, 1);
};
