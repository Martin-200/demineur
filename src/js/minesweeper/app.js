import { Minesweeper } from './classes/Minesweeper.js';
import { View } from './classes/View.js';
import { Canvas } from './classes/Canvas.js';
import { Grid } from './classes/Grid.js';
import { Settings } from './classes/Settings.js';

const app = new Minesweeper(
    new View(),
    new Canvas(),
    new Grid(),
    new Settings(),
);

document.addEventListener('DOMContentLoaded', () => {
    app.init({
        containerId: 'root',
        gridSize: {
            x: 15,
            y: 15,
        },
        gameDifficulty: 'normal',
        safeMode: false,
        themeColors: `classic`,
        fontFamily: `Open Sans`,
    });
});