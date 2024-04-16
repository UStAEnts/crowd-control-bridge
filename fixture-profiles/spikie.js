const _ = require('logger');

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
}

// 3.53 = 9 * x

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || 'spikies';

    console.trace(addresses);

    /**
     * @param universe {number}
     * @param color {string[]}
     */
    function colorToDMX(universe, color) {
        const result = {};

        if (color.length >= 3){
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.RED - 1] = parseInt(color[0], 10);
                result[address + channels.GREEN - 1] = parseInt(color[1], 10);
                result[address + channels.BLUE - 1] = parseInt(color[2], 10);
                result[address + channels.WHITE - 1] = 0;
            }
        }

        return result;
    }

    function effectsToDMX(universe, effect) {
        const result = {};

        if (effect === 'strobe') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.SHUTTER - 1] = (210 / 255) * 100;
            }
        }

        if (effect === 'move') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = 100 - effects.sin;
                result[address + channels.TILT - 1] = 200 - effects.sin;
            }
        } 

        if (effect === 'clear') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = 128;
                result[address + channels.TILT - 1] = 128;
            }
        }
        return result;
    }

    function intensityToDMX(universe, intensity) {
        const result = {};

        try {
            const number = parseInt(intensity, 10);
            if (!isNaN(number)) {
                for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                    result[address + channels.INTENSITY - 1] = number;
                    result[address + channels.COLOR_MIX - 1] = 45;
                    result[address + channels.SHUTTER - 1] = 32;
                }
            }
        } catch (e) {
        }

        return result;
    }

    function positionToDMX(universe, position) {
        const result = {};

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
        const [key, action, ...remainder] = parts;

        if (key !== prefix) return {};

        if (action === 'colour') return colorToDMX(universe, remainder);
        if (action === 'position') return positionToDMX(universe, parts[2]);
        if (action === 'intensity') return intensityToDMX(universe, parts[2]);
        if (action === 'effect') return effectsToDMX(universe, parts[2]);

        return {};
    }

    return {
        convert: commandToDMX,
        commands: [
            `${prefix}.effect.move`,
            `${prefix}.position.home`,
            `${prefix}.effect.strobe`,
            `${prefix}.effect.clear`,
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
            new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+(\\.[0-9]+)?`),
        ],
    }
}