const _ = require('logger');

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
    }
}

const cells = 10;

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || 'tubes';

    _.debug(`loading with prefix ${prefix} and addresses: `, addresses);
    console.debug(addresses);

    const intensityByUniverse = {};
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

        if (color.length === 3) {
            const intensityMultiplier = intensityByUniverse[universe] || 0;
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                for (let cell in Object.keys(channels)) {
                    result[address + channels[cell].RED - 1] = parseInt(color[0], 10) * intensityMultiplier;
                    result[address + channels[cell].GREEN - 1] = parseInt(color[1], 10) * intensityMultiplier;
                    result[address + channels[cell].BLUE - 1] = parseInt(color[2], 10) * intensityMultiplier;
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
        intensityByUniverse[universe] = parseInt(intensity, 10) / 255;
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
            intensityToDMX(universe, parts[2]);
            return colorToDMX(universe, undefined);
        }

        if (action === 'colour') return colorToDMX(universe, remainder);
        // if (parts[1] === 'effect') return effectsToDMX(parts[2]);

        return {};
    }

    return {
        convert: commandToDMX,
        commands: [
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
            new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+`),
        ],
    }
};