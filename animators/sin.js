module.exports = {
    executor: (t, exp) => {
        exp['sin'] = ((100/2) * Math.sin(0.02463994238 * t)) + (100 / 2);
        // exp['sin'] = ((255/2) * Math.sin(0.02463994238 * t)) + (255 / 2);
    },
    initial: 0,
    name: 'sin',
}