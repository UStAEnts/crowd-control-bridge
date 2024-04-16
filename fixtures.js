// Provide information about all fixtures
var fixtures = {
    "150s": {
        name: "StAge beams",
        profile: "150.js",
        maxIntensity: 255,
        colour: {
            deepRed: ["Deep Red", "219.4.4", "db0404"],
            red: ["Red", "255.0.0", "ff0000"],
            amber: ["Amber", "252.206.2", "fcce02"],
            orange: ["Orange", "252.130.0", "fc8200"],
            yellow: ["Yellow", "252.252.0", "fcfc00"],
            lime: ["Lime", "54.252.5", "36FC05"],
            darkGreen: ["Green", "25.170.30", "19aa1e"],
            cyan: ["Cyan", "15.236.252", "0FECFC"],
            azure: ["Azure", "94.161.255", "5ea1ff"],
            blue: ["Blue", "2.31.252", "021ffc"],
            deepBlue: ["Deep Blue", "12.23.175", "0c17af"],
            magenta: ["Magenta", "252.2.244", "fc02f4"],
            purple: ["Purple", "98.2.252", "6202fc"],
            uv: ["Violet", "67.26.145", "431a91"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
            move: ["Move", "move"]
        },
        active: {
            intensity: 25,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            26: [1, 23, 45, 67, 89, 111, 133, 155],
            24: [282, 162, 140, 184, 206, 260],
            25: [190, 168, 146, 124, 80, 102]
        }
    },
    
    "spikies": {
        name: "Pole beams",
        profile: "spikie.js",
        maxIntensity: 50,
        colour: {
            deepRed: ["Deep Red", "219.4.4", "db0404"],
            red: ["Red", "255.0.0", "ff0000"],
            amber: ["Amber", "252.206.2", "fcce02"],
            orange: ["Orange", "252.130.0", "fc8200"],
            yellow: ["Yellow", "252.252.0", "fcfc00"],
            lime: ["Lime", "54.252.5", "36FC05"],
            darkGreen: ["Green", "25.170.30", "19aa1e"],
            cyan: ["Cyan", "15.236.252", "0FECFC"],
            azure: ["Azure", "94.161.255", "5ea1ff"],
            blue: ["Blue", "2.31.252", "021ffc"],
            deepBlue: ["Deep Blue", "12.23.175", "0c17af"],
            magenta: ["Magenta", "252.2.244", "fc02f4"],
            purple: ["Purple", "98.2.252", "6202fc"],
            uv: ["Violet", "67.26.145", "431a91"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
            move: ["Move", "move"]
        },
        active: {
            intensity: 10,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            16: [1, 28, 433, 82, 109, 136, 163, 190, 217, 244, 271, 298, 325, 352, 379, 406]
        }
    },

    "r1s-club": {
        name: "Club beams",
        profile: "r1.js",
        maxIntensity: 100,
        colour: {
            red: ["Red", "red", "ff0000"],
            cto3200: ["Light Orange", "cto3200", "ffcc5e"],
            orange: ["Orange", "orange", "fc8200"],
            yellow: ["Yellow", "yellow", "fcfc00"],
            green: ["Green", "green", "19aa1e"],
            blue: ["Blue", "blue", "021ffc"],
            magenta: ["Magenta", "magenta", "fc02f4"],
            purple: ["Purple", "purple", "6202fc"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
            move: ["Moving", "move"],
        },
        active: {
            intensity: 10,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            14: [49, 68, 87, 106, 125, 144, 163, 182]
        }
    },

    "tube-lines": {
        name: "Columns",
        profile: "titantube.js",
        maxIntensity: 75,
        colour: {
            deepRed: ["Deep Red", "219.4.4", "db0404"],
            red: ["Red", "255.0.0", "ff0000"],
            amber: ["Amber", "252.206.2", "fcce02"],
            orange: ["Orange", "252.130.0", "fc8200"],
            yellow: ["Yellow", "252.252.0", "fcfc00"],
            lime: ["Lime", "54.252.5", "36FC05"],
            darkGreen: ["Green", "25.170.30", "19aa1e"],
            cyan: ["Cyan", "15.236.252", "0FECFC"],
            azure: ["Azure", "94.161.255", "5ea1ff"],
            blue: ["Blue", "2.31.252", "021ffc"],
            deepBlue: ["Deep Blue", "12.23.175", "0c17af"],
            magenta: ["Magenta", "252.2.244", "fc02f4"],
            purple: ["Purple", "98.2.252", "6202fc"],
            uv: ["Violet", "67.26.145", "431a91"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
        },
        active: {
            intensity: 5,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            3: [1, 33, 65, 97, 129, 161, 193, 225, 257, 289, 321, 353]
        }
    },

    "tube-triangle": {
        name: "Triangle",
        profile: "titantube.js",
        maxIntensity: 75,
        colour: {
            deepRed: ["Deep Red", "219.4.4", "db0404"],
            red: ["Red", "255.0.0", "ff0000"],
            amber: ["Amber", "252.206.2", "fcce02"],
            orange: ["Orange", "252.130.0", "fc8200"],
            yellow: ["Yellow", "252.252.0", "fcfc00"],
            lime: ["Lime", "54.252.5", "36FC05"],
            darkGreen: ["Green", "25.170.30", "19aa1e"],
            cyan: ["Cyan", "15.236.252", "0FECFC"],
            azure: ["Azure", "94.161.255", "5ea1ff"],
            blue: ["Blue", "2.31.252", "021ffc"],
            deepBlue: ["Deep Blue", "12.23.175", "0c17af"],
            magenta: ["Magenta", "252.2.244", "fc02f4"],
            purple: ["Purple", "98.2.252", "6202fc"],
            uv: ["Violet", "67.26.145", "431a91"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
        },
        active: {
            intensity: 5,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            3: [385, 417, 449]
        }
    },
    
    "stage-bars": {
        name: "House wash",
        profile: "beambar.js",
        maxIntensity: 100,
        colour: {
            deepRed: ["Deep Red", "219.4.4.0", "db0404"],
            red: ["Red", "255.0.0.0", "ff0000"],
            amber: ["Amber", "252.206.2.0", "fcce02"],
            orange: ["Orange", "252.130.0.0", "fc8200"],
            yellow: ["Yellow", "252.252.0.0", "fcfc00"],
            lime: ["Lime", "54.252.5.0", "36FC05"],
            darkGreen: ["Green", "25.170.30.0", "19aa1e"],
            cyan: ["Cyan", "15.236.252.0", "0FECFC"],
            azure: ["Azure", "94.161.255.0", "5ea1ff"],
            blue: ["Blue", "2.31.252.0", "021ffc"],
            deepBlue: ["Deep Blue", "12.23.175.0", "0c17af"],
            magenta: ["Magenta", "252.2.244.0", "fc02f4"],
            purple: ["Purple", "98.2.252.0", "6202fc"],
            uv: ["Violet", "67.26.145.0", "431a91"]
        },
        position: {
            home: ["Home", "home"]
        },
        effect: {
            none: ["None", "clear"],
        },
        active: {
            intensity: 10,
            colour: "blue",
            position: "home",
            effect: "clear"
        },
        patch: {
            20: [80],
            21: [20, 80],
            22: [36, 96],
            23: [36],
            24: [20, 80],
            25: [20]
        }
    }
};

module.exports = fixtures;