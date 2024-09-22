const _ = require('logger');

const channels = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    WHITE: 3,
    DIMMER: 4,
    SHUTTER: 5,
}

const cells = 10;

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || 'bars';

    _.debug(`loading with prefix ${prefix} and addresses: `, addresses);
    console.debug(addresses);

    let lastSentColours = {};

    /**
     * @param universe {number}
     * @param color {string[]|undefined}
     */
    function colorToDMX(universe, color) {
        const result = {};

        if (color === undefined) {
            color = lastSentColours[universe] || [0, 0, 0, 0];
        }

        if (color.length === 4) {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                for (let cell = 0; cell < cells; cell++) {
                    result[address + (Object.keys(channels).length * cell) + channels.RED - 1] = parseInt(color[0], 10);
                    result[address + (Object.keys(channels).length * cell) + channels.GREEN - 1] = parseInt(color[1], 10);
                    result[address + (Object.keys(channels).length * cell) + channels.BLUE - 1] = parseInt(color[2], 10);
                    result[address + (Object.keys(channels).length * cell) + channels.WHITE - 1] = parseInt(color[3], 10);
                }
            }
            lastSentColours[universe] = [
                parseInt(color[0], 10),
                parseInt(color[1], 10),
                parseInt(color[2], 10),
                parseInt(color[3], 10),
            ];
        }

        return result;
    }

    function intensityToDMX(universe, intensity) {
        const result = {};
        for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
            for (let cell = 0; cell < cells; cell++) {
                result[address + (Object.keys(channels).length * cell) + channels.DIMMER - 1] = parseInt(intensity, 10);
            }
        }
        return result;
    }

    /**
     * @param universe {number}
     * @param command {string}
     */
    function commandToDMX(universe, command) {
        const parts = command.toLowerCase().split('.');
        const [key, action, ...remainder] = parts;

        if (key !== prefix) return {};

        if (action === 'intensity') {
            return intensityToDMX(universe, parts[2]);
        }

        if (action === 'colour') return colorToDMX(universe, remainder);
        // if (parts[1] === 'effect') return effectsToDMX(parts[2]);

        return {};
    }

    return {
        convert: commandToDMX,
        commands: [
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
            new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+`),
        ],
    }
};