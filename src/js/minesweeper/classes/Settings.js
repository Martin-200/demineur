export class Settings {
    constructor() {
        this._gridSize = {
            x: null,
            y: null,
        };
        this._gameDifficulty = null;
        this._safeMode = false;
    }

    // Getters

    get gridSize() {
        return this._gridSize;
    }
    get gameDifficulty() {
        return this._gameDifficulty;
    }
    get safeMode() {
        return this._safeMode;
    }

    // Setters

    set gridSize(gridSize) {
        const updatedGridSize = {
            x: gridSize.x < 4 || gridSize.x > 50 ? 10 : gridSize.x,
            y: gridSize.y < 4 || gridSize.y > 50 ? 10 : gridSize.y
        };
        this._gridSize = updatedGridSize;
    }
    set gameDifficulty(gameDifficulty) {
        this._gameDifficulty = gameDifficulty;
        if (![`easy`, `normal`, `hard`, `hardcore`].includes(this._gameDifficulty)){
            this._gameDifficulty = `normal`;
        }
    }
    set safeMode(safeMode) {
        this._safeMode = safeMode ? true : false;
    }
}