const _ = require('logger');

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
}

// 3.53 = 9 * x

module.exports = function (prefix, addresses, effects) {
    prefix = prefix || '150s';

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
        } else if (effect === 'move') {
            for (const address of addresses.hasOwnProperty(universe) ? addresses[universe] : []) {
                result[address + channels.PAN - 1] = effects.sin;
                result[address + channels.TILT - 1] = 100 - effects.sin;
            }
        } else if (effect === 'clear') {
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
                    result[address + channels.SHUTTER - 1] = 32;
                    result[address + channels.COLOR_CTRL - 1] = 45;
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
            `${prefix}.position.home`,
            `${prefix}.effect.strobe`,
            `${prefix}.effect.clear`,
            `${prefix}.effect.move`,
            new RegExp(`${prefix}\\.intensity\\.[0-9]+`),
            new RegExp(`${prefix}\\.colour\\.[0-9]+\\.[0-9]+\\.[0-9]+(\\.[0-9]+)?`),
        ],
    }
}