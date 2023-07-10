export class Minesweeper {
    constructor(view, canvas, grid, settings) {
        this._view = view;
        this._canvas = canvas;
        this._grid = grid;
        this._settings = settings;
        this._isGameInitialized = false;
        this._isGameRunning = false,
        this._gameFrame = null;
        this._currentGridSize = {
            x: null,
            y: null,
        };
        this._currentGameDifficulty = null;
        this._currentGameResult = null;
    }

    // Getters

    get view() {
        return this._view;
    }
    get canvas() {
        return this._canvas;
    }
    get grid() {
        return this._grid;
    }
    get settings() {
        return this._settings;
    }
    get isGameInitialized() {
        return this._isGameInitialized;
    }
    get isGameRunning() {
        return this._isGameRunning;
    }
    get gameFrame() {
        return this._gameFrame;
    }
    get currentGridSize() {
        return this._currentGridSize;
    }
    get currentGameDifficulty() {
        return this._currentGameDifficulty;
    }
    get currentGameResult() {
        return this._currentGameResult;
    }

    // Setters

    set view(view) {
        this._view = view;
    }
    set canvas(canvas) {
        this._canvas = canvas;
    }
    set grid(grid) {
        this._grid = grid;
    }
    set settings(settings) {
        this._settings = settings;
    }
    set isGameInitialized(isGameInitialized) {
        this._isGameInitialized = isGameInitialized;
    }
    set isGameRunning(isGameRunning) {
        this._isGameRunning = isGameRunning;
    }
    set gameFrame(gameFrame) {
        this._gameFrame = gameFrame;
    }
    set currentGridSize(currentGridSize) {
        this._currentGridSize = currentGridSize;
    }
    set currentGameDifficulty(currentGameDifficulty) {
        this._currentGameDifficulty = currentGameDifficulty;
    }
    set currentGameResult(currentGameResult) {
        this._currentGameResult = currentGameResult;
    }

    // Methods

    #selectGameContainer(containerId) {
        if (document.getElementById(containerId) === null) {
            let container = document.createElement(`div`);
            container.id = containerId;
            document.body.appendChild(container);
        }
    
        this.gameFrame = document.getElementById(containerId);
    }

    #isKeyPressed(event, key, keyname = 'useless') {
        return (event.which == key || event.keyCode == key) ? true : false
    }

    #useSafeMode() {
        this.settings.safeMode = !this.settings.safeMode;
        this.view.checkSafeMode(this.settings.safeMode);
    }

    #useFullScreen() {
        this.view.useFullScreen()
        this.canvas.updateSize()
            .then((resolve) => {
                this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, false, this.settings.safeMode);
                if (!this.isGameRunning && !this.grid.firstClick) {
                    this.canvas.drawFinalScreen(this.currentGameResult)
                }
            })
    }
    
    #setupEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.#isKeyPressed(event, 83, `S`)) {
                this.#useSafeMode()
                return;
            }
            
            if (this.#isKeyPressed(event, 70, `F`)) {
                this.#useFullScreen()
                return;
            }
            
            if (this.#isKeyPressed(event, 82, `R`)) {
                this.startGame();
                return;
            }
        });

        document.addEventListener(`click`, (event) => {
            if (event.target.closest(`[data-msw-safemode]`)) {
                this.#useSafeMode()
                return;
            }

            if (event.target.closest(`[data-msw-fullscreen]`)) {
                this.#useFullScreen()
                return;
            }

            if (event.target.closest(`[data-msw-restart]`)) {
                this.startGame();
                return;
            }

            if (event.target.closest(`[data-msw-setting-difficulty]`)) {
                const gameDifficulty = event.target.dataset.mswSettingDifficulty;
                this.settings.gameDifficulty = gameDifficulty;
                this.view.checkDifficulty(gameDifficulty);

                if (!this.grid.firstClick && !this.isGameRunning) {        
                    this.grid.firstClick = true;
                }
                this.updateGameSettings()
                return;
            }
        });
        
        document.addEventListener(`mousedown`, (event) => {
            if (event.target.matches(`[data-msw-canvas]`)) {
                this.#handleClick(event);
                return;
            }
        })

        document.addEventListener(`change`, (event) => {
            if (event.target.matches(`[data-msw-setting-gridsize]`)) {
                const gridSizeInput = event.target;
                const gridSizeValue = parseInt(gridSizeInput.value, 10);
                const gridSizeType = gridSizeInput.dataset.mswSettingGridsize;
                this.settings.gridSize = {
                    ...this.settings.gridSize,
                    [gridSizeType]: gridSizeValue
                };

                if (!this.grid.firstClick && !this.isGameRunning) {        
                    this.grid.firstClick = true;
                }
                this.updateGameSettings()
                return;
            }
        });

        window.addEventListener(`resize`, (event) => {
            this.canvas.updateSize()
                .then((resolve) => {
                    this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, false, this.settings.safeMode);
                    if (!this.isGameRunning && !this.grid.firstClick) {
                        this.canvas.drawFinalScreen(this.currentGameResult)
                    }
                })
        });

        this.canvas.canvas.addEventListener(`contextmenu`, (event) => {
            event.preventDefault();
        });     
    }

    #handleClick(event) {
        event.preventDefault();

        if (this.isGameRunning || this.grid.firstClick) {
            const clickedTileCoordinates = this.grid.getTileCoordinates(
                event.offsetX,
                event.offsetY,
                this.canvas.canvas.width,
                this.canvas.canvas.height,
                this.currentGridSize
            );

            if (clickedTileCoordinates) {
                let gameAction = ``
                switch (event.button) {
                    case 0: // Clic gauche
                        gameAction = `flipTile`
                        break;
        
                    case 1: // Clic central
                        gameAction = `flipTilesAround`
                        break;
        
                    case 2: // Clic droit
                        gameAction = `changeTileFlag`
                        break;
        
                    default:
                        gameAction = `flipTile`
                        break;
                }
        
                switch (gameAction) {
                    case `flipTile`:
                        this.isGameRunning = true;
                        this.grid.flipTile(this.currentGridSize, this.currentGameDifficulty, clickedTileCoordinates, this.settings.safeMode)
                            .then((isDefeat) => {
                                this.view.displayMinesIndicator(this.grid.minesIndicator);
                                this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, false, this.settings.safeMode);
                                this.#checkGameResult(isDefeat)
                            })
                        break;
                    
                    case `changeTileFlag`:
                        this.grid.changeTileFlag(clickedTileCoordinates);
                        this.view.displayMinesIndicator(this.grid.minesIndicator);
                        this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, false, this.settings.safeMode);
                        break;

                    case `flipTilesAround`:
                        this.grid.flipTilesAround(this.currentGridSize, clickedTileCoordinates, this.settings.safeMode)
                            .then((isDefeat) => {
                                this.view.displayMinesIndicator(this.grid.minesIndicator);
                                this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, false, this.settings.safeMode);
                                this.#checkGameResult(isDefeat)
                            })
                        break;
                }
            }
        } else { // Si l'écran final est affiché
            this.startGame();
        }
    }

    #checkGameResult(isDefeat) {
        if (isDefeat) {
            this.stopGame()
            this.currentGameResult = `defeat`
            this.canvas.drawDefeatScreen()
        } else {
            this.grid.checkVictory(this.currentGridSize)
                .then((isVictory) => {
                    if (isVictory) {
                        this.stopGame()
                        this.currentGameResult = `victory`
                        this.canvas.drawVictoryScreen()
                        
                    }
                })
        }
    }

    updateGameSettings() {
        if (!this.isGameRunning) {
            this.currentGridSize = JSON.parse(JSON.stringify(this.settings.gridSize));
            this.currentGameDifficulty = this.settings.gameDifficulty;
            this.currentGameResult = null;

            this.grid.createEmptyGrid(this.currentGridSize);
            this.grid.minesIndicator = Math.floor((this.grid.getPercentageOfMines(this.currentGameDifficulty) / 100) * this.currentGridSize.x * this.currentGridSize.y)
            this.view.displayMinesIndicator(this.grid.minesIndicator);
            this.canvas.updateSize()
                .then((resolve) => {
                    this.canvas.draw(this.currentGridSize, this.grid.gameGrid, this.grid.tileTypes, true, this.settings.safeMode);
                })
        }
    }

    startGame() {
        this.isGameRunning = false;
        this.grid.firstClick = true;
        this.updateGameSettings();
    }

    stopGame() {
        this.isGameRunning = false;
        this.grid.firstClick = false;
    }

    init(settings) {
        let errorMessage = `[Démineur] L'initialisation a échoué : `;
        if (!this.isGameInitialized) {
            this.isGameInitialized = true;
            this.isGameRunning = false;

            this.settings.gridSize = settings.gridSize;
            this.settings.gameDifficulty = settings.gameDifficulty;
            this.settings.safeMode = settings.safeMode;

            this.#selectGameContainer(settings.containerId || `root`);
            if (this.view.buildGame(this.gameFrame, this.settings.gridSize)) {
                this.view.checkDifficulty(this.settings.gameDifficulty);
                this.view.checkSafeMode(this.settings.safeMode);

                this.canvas.canvas = document.getElementById(`msw-canvas`);
                this.canvas.themeColors = this.canvas.selectTheme(settings.themeColors);
                this.canvas.fontFamily = settings.fontFamily;
                this.grid.createEmptyGrid(this.settings.gridSize);
                this.#setupEvents();

                this.startGame();

                return this.isGameInitialized;
            } else {
                errorMessage += `une erreur est survenue lors du build`;
            }
        } else {
            errorMessage += `elle a déjà été effectuée`;
        }

        console.error(errorMessage);
        return false;
    }
}