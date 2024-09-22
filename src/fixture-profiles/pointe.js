const _ = require('logger');

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
}

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
}

// 3.53 = 9 * x

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || 'robe';

    _.debug(`loading with prefix ${prefix} and addresses: `, addresses);
    console.debug(addresses);
    /**
     * @param universe {number}
     * @param color {string}
     */
    function colorToDMX(universe, color) {
        const result = {};

        if (colors.hasOwnProperty(color.toUpperCase())) {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.COLOR] = colors[color.toUpperCase()] * 0.392222222;
            }
        }

        return result;
    }

    function effectsToDMX(universe, effect) {
        const result = {};

        if (effect === 'strobe') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.SHUTTER] = (210 / 255) * 100;
            }
        }
        return result;
    }

    function intensityToDMX(universe, intensity) {
        const result = {};

        if (intensity === 'strobe') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.SHUTTER] = (210 / 255) * 100;
            }
            return result;
        }
        try {
            const number = parseInt(intensity, 10);
            if (!isNaN(number)) {
                for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                    result[address + channels.DIMMER] = number;
                }
            }
        } catch (e) {
        }

        return result;
    }

    function positionToDMX(universe, position) {
        const result = {};

        if (position === 'move') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN] = effects.sin;
                result[address + channels.TILT] = 100 - effects.sin;
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
        if (parts[0] !== prefix) return {};

        if (parts[1] === 'colour') return colorToDMX(universe, parts[2]);
        if (parts[1] === 'position') return positionToDMX(universe, parts[2]);
        if (parts[1] === 'intensity') return intensityToDMX(universe, parts[2]);
        if (parts[1] === 'effect') return effectsToDMX(universe, parts[2]);

        return {};
    }

    return {
        convert: commandToDMX,
        commands: [
            `${prefix}.position.move`,
            ...Object.entries(colors).map(([name]) => `${prefix}.colour.${name.toLowerCase()}`),
            `${prefix}.effect.strobe`,
            `${prefix}.effect.clear`,
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
        ],
    }
}