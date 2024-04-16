const _ = require('logger');

const home = {
    PAN: 128,
    TILT: 128
}

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
}

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
}

const gobo1 = {
    OPEN: 0,
    G1: 8,
    G2: 16,
    G3: 24,
    G4: 32,
    G5: 40,
    G6: 48,
    G7: 56,
}

// 3.53 = 9 * x

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || 'r1';

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
                result[address + channels.COLOR - 1] = colors[color.toUpperCase()];
            }
        } else {
            _.debug("colour not available");
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

        if (effect === 'move') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = effects.sin;
                result[address + channels.TILT - 1] = 100 - effects.sin;
            }
        }

        if (effect === 'clear') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = home.PAN;
                result[address + channels.TILT - 1] = home.TILT;
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
                    result[address + channels.DIMMER - 1] = number;
                    result[address + channels.SHUTTER - 1] = 4;
                }
            }
        } catch (e) {
        }

        return result;
    }

    function goboToDMX(universe, gobo){
        const result = {};

        if (gobo1.hasOwnProperty(gobo.toUpperCase())){
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.GOBO - 1] = gobo1[gobo.toUpperCase()];
            }
        }

        return result;
    }

    function positionToDMX(universe, position) {
        const result = {};
        if (position === 'still'){
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN] = 0;
                result[address + channels.TILT] = 0;
            }
        }

        if (position === 'home') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = 128;
                result[address + channels.TILT - 1] = 128;
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
        if (parts[1] === 'gobo') return goboToDMX(universe, parts[2]);

        return {};
    }

    return {
        convert: commandToDMX,
        commands: [
            `${prefix}.effect.move`,
            `${prefix}.position.still`,
            `${prefix}.position.home`,
            ...Object.entries(colors).map(([name]) => `${prefix}.colour.${name.toLowerCase()}`),
            `${prefix}.effect.strobe`,
            `${prefix}.effect.clear`,
            ...Object.entries(gobo1).map(([name]) => `${prefix}.gobo.${name.toLowerCase()}`),
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
        ],
    }
}