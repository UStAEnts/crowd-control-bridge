/*
  Lighting module - controls lighting via ArtNet, by fetching commands from the server
*/

const config = require('./config');
const _ = require('logger');
const fs = require('fs/promises');
const { join } = require('path');
const { handle } = require('express/lib/application');

/**
 * Set the minimum log level to BASE (the lowest level) so we see everything.
 */
_.setMinimumLevel(_.LogLevel.BASE);

/**
 * The set of acceptable commands from the server
 * @type {string|RegExp[]}
 */
let COMMANDS = [];
/**
 * The enabled merge controllers for different fixtures, each function should take a command and return an object of
 * DMX data
 * @type {Function[]}
 */
const mergers = [];

/**
 * An object containing the output of currently running animations. The result of each animator is determined by itself
 * so only use effects you know the result of
 * @type {{}}
 */
const effects = {};

/**
 * Loads all the fixture profiles and binds them to the addresses specified in the addresses object
 * @returns {Promise<void>}
 */
async function loadFixtures() {
    const fixtures = require('./fixtures');
    for (const [group, fixture] of Object.entries(fixtures)) {
        _.trace(`registering ${fixture.name} with addresses ${fixture.patch}`);

        const entries = fixture.patch;

        if (!Object.values(entries).map((e) => Array.isArray(e)).reduce((prev, cur) => prev && cur)) {
            for (const [prefix, addressConfig] of Object.entries(entries)) {
                const {convert, commands} = require(join(__dirname, 'fixture-profiles', fixture.profile))(prefix, addressConfig, effects);
                mergers.push(convert);
                COMMANDS.push(...commands);
                _.trace('Adding commands: ', commands);
            }
        } else {
            const {convert, commands} = require(join(__dirname, 'fixture-profiles', fixture.profile))(undefined, entries, effects);
            mergers.push(convert);
            COMMANDS.push(...commands);
            _.trace('Adding commands: ', commands);
        }
    }

    _.trace('all profiles loaded, final commands:');
    //console.trace(COMMANDS);
}

/**
 * Finds all animator files and requires them pushing their executors and creating the initial values in the effects
 * object. Animator functions will be called every 10ms.
 * @returns {Promise<void>}
 */
async function enableAnimators() {
    let animationTime = 0;
    let animators = [];

    const animationHandler = () => {
        if (++animationTime > 255) animationTime = 0;

        animators.forEach((f) => f(animationTime, effects));
    };
    setInterval(animationHandler, 10);

    const files = await fs.readdir(join(__dirname, 'animators'));
    files.filter((name) => name.endsWith('.js')).forEach((name) => {
        const {executor, index, initial} = require(join(__dirname, 'animators', name));

        animators.push(executor);
        effects[index] = initial;
    });
}

/**
 * Fetches commands from the server and processes them.
 * @returns {Promise<void>}
 */
async function fetchCommands() {
    await fetch(`${config.crowdcontrolServer}/getLightRequests.php`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.forEach((command) => {
                handleCommand(command);
            });
        });
}

let activeCommands = [];

/**
 * Handles an incoming message from server. It will check the command against the list of possible
 * acceptable commands (without a '-' symbol if present). It will remove the command if it is prefixed with '-' and if
 * not it will replace all conflicting commands (with the same two part prefix) to prevent overlapping instructions. If
 * it is not found or accepted it will reject it.
 * @param command 
 * @returns 
 */
function handleCommand(command) {
    const test = command.startsWith('-') ? command.substring(1) : command;
    const matched = COMMANDS
        .map((e) => typeof (e) === 'string' ? e.toLowerCase() === test.toLowerCase() : e.test(test))
        .reduce((old, now) => old || now);

    if (!matched) {
        _.warn(`message "${command}" rejected because it is not contained within the valid commands`);
        return;
    }

    if (command.startsWith('-')) {
        const toRemove = command.substring(1);
        activeCommands = activeCommands.filter((e) => e !== toRemove);

        _.debug(`removed command ${toRemove}`);

        return;
    }

    // Find all conflicting commands
    const [key, action] = command.split('.');
    const conflictKey = `${key}.${action}`;
    // const conflictKey = command.substr(0, command.lastIndexOf('.') + 1);
    const resultant = [].concat(
        // All active commands that conflict
        activeCommands.filter((e) => !e.startsWith(conflictKey)),
        // Plus the new command
        [command],
    );

    _.info(`Command: ${command} has caused a change of ${resultant.length - activeCommands.length} instructions`);

    activeCommands = resultant;
    console.trace(activeCommands);
}

const lastOutgoingData = {};

/**
 * Sends artnet data based on the activeCommands
 */
function sendArtnetUpdate() {
    console.log("update artnet");

    // TODO: determine what universes to send to based on config from somewhere
    for (let universe = 0; universe < 26; universe++) {
        const commands = activeCommands
            .map((command) => mergers.map((merger) => merger(universe, command)))
            .flat()
            .reduce(
                (prev, cur) => Object.assign(prev, cur),
                {}
            );
        if (Object.keys(commands).length === 0) {
            continue;
        }

        // array of each channel value in universe
        var dmx = lastOutgoingData[universe] ?? Array(512).fill(0);

        Object.keys(commands).forEach((k) => {
            dmx[k] = commands[k];
        });

        artnet.set(universe, 1, dmx);

        lastOutgoingData[universe] = dmx;
    }
}


var options = {
    iface: config.lightingInterface,
};
const artnet = require('artnet')(options);


module.exports = async () => {
    console.log('Lighting module initialized');

    await loadFixtures()
        .then(enableAnimators)
        .catch(console.error);

    setInterval(fetchCommands, 1000);

    setInterval(sendArtnetUpdate, 100);
    
}
