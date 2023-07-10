export class Grid {
    constructor() {
        this._gameGrid = [];
        this._tileTypes = {
            minesNearby1: 1,
            minesNearby2: 2,
            minesNearby3: 3,
            minesNearby4: 4,
            minesNearby5: 5,
            minesNearby6: 6,
            minesNearby7: 7,
            minesNearby8: 8,
            noMineNearby: 50,
            minePlacedHere: 100,
        }
        this._firstClick = false;
        this._minesIndicator = 0;
    }

    // Getters

    get gameGrid() {
        return this._gameGrid;
    }
    get tileTypes() {
        return this._tileTypes;
    }
    get firstClick() {
        return this._firstClick;
    }
    get minesIndicator() {
        return this._minesIndicator;
    }

    // Setters

    set gameGrid(gameGrid) {
        this._gameGrid = gameGrid;
    }
    set tileTypes(tileTypes) {
        this._tileTypes = tileTypes;
    }
    set firstClick(firstClick) {
        this._firstClick = firstClick;
    }
    set minesIndicator(minesIndicator) {
        this._minesIndicator = minesIndicator;
    }

    // Methods

    #areObjectsEqual(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
      
        if (keys1.length !== keys2.length) {
            return false;
        }
        return keys1.every(key => obj1[key] === obj2[key]);
    }

    #updateMinesIndicator(currentTileFlagId, nextTileFlagId) {
        if (currentTileFlagId === 1 && nextTileFlagId !== 1) {
            this.minesIndicator++;
        }
        if (currentTileFlagId !== 1 && nextTileFlagId === 1) {
            this.minesIndicator--;
        }
    }

    #discoversAdjacentTiles(clickedTileCoordinates) {
        const offsets = [-1, 0, 1];

        for (let xOffset of offsets) {
            for (let yOffset of offsets) {
                if (xOffset === 0 && yOffset === 0) {
                    continue;
                }
            
                const neighborTileCoordinates = {
                    x: clickedTileCoordinates.x + xOffset,
                    y: clickedTileCoordinates.y + yOffset,
                }
            
                if (neighborTileCoordinates.x >= 0 &&
                    neighborTileCoordinates.x < this.gameGrid.length &&
                    neighborTileCoordinates.y >= 0 &&
                    neighborTileCoordinates.y < this.gameGrid[0].length) {

                    const neighborTile = this.gameGrid[neighborTileCoordinates.x][neighborTileCoordinates.y];
            
                    if (!neighborTile.isFlipped) {
                        neighborTile.isFlipped = true;
                        this.#updateMinesIndicator(neighborTile.flagId, 0);
                        neighborTile.flagId = 0;
                
                        if (neighborTile.tile === this.tileTypes.noMineNearby) {
                            this.#discoversAdjacentTiles(neighborTileCoordinates);
                        }
                    }
                }
            }
        }
    }

    #revealAllMines() {
        for (let gridX = 0; gridX < this.gameGrid.length; gridX++) {
            for (let gridY = 0; gridY < this.gameGrid[gridX].length; gridY++) {
                if (this.gameGrid[gridX][gridY].tile === this.tileTypes.minePlacedHere) {
                    this.gameGrid[gridX][gridY].isFlipped = true;
                }
            }
        }
    } 

    #getAdjacentTiles(clickedTileCoordinates, gridSize, returnsDiagonalTiles) {
        const adjacentTiles = [];
        const { x, y } = clickedTileCoordinates;
      
        if (y > 0) {
            const adjacentTile = { ...this.gameGrid[x][y - 1], x: x, y: y - 1 };
            adjacentTiles.push(adjacentTile);
        }
        if (y < gridSize.y - 1) {
            const adjacentTile = { ...this.gameGrid[x][y + 1], x: x, y: y + 1 };
            adjacentTiles.push(adjacentTile);
        }
        if (x > 0) {
            const adjacentTile = { ...this.gameGrid[x - 1][y], x: x - 1, y: y };
            adjacentTiles.push(adjacentTile);
        }
        if (x < gridSize.x - 1) {
            const adjacentTile = { ...this.gameGrid[x + 1][y], x: x + 1, y: y };
            adjacentTiles.push(adjacentTile);
        }
        if (returnsDiagonalTiles){
            if (y > 0 && x > 0) {
                const adjacentTile = { ...this.gameGrid[x - 1][y - 1], x: x - 1, y: y - 1 };
                adjacentTiles.push(adjacentTile);
            }
            if (y > 0 && x < gridSize.x - 1) {
                const adjacentTile = { ...this.gameGrid[x + 1][y - 1], x: x + 1, y: y - 1 };
                adjacentTiles.push(adjacentTile);
            }
            if (y < gridSize.y - 1 && x > 0) {
                const adjacentTile = { ...this.gameGrid[x - 1][y + 1], x: x - 1, y: y + 1 };
                adjacentTiles.push(adjacentTile);
            }
            if (y < gridSize.y - 1 && x < gridSize.x - 1) {
                const adjacentTile = { ...this.gameGrid[x + 1][y + 1], x: x + 1, y: y + 1 };
                adjacentTiles.push(adjacentTile);
            }
        }
        return adjacentTiles;
    }   

    getPercentageOfMines(gameDifficulty) {
        let percentageOfMines = 0;
        switch (gameDifficulty) {
            case `easy`:
                percentageOfMines = 12;
                break;

            case `normal`:
                percentageOfMines = 18;
                break;
                
            case `hard`:
                percentageOfMines = 24;
                break;
                
            case `hardcore`:
                percentageOfMines = 30;
                break;
        
            default:
                break;
        }

        return percentageOfMines;
    }

    createEmptyGrid(gridSize) {
        this.gameGrid = [];

        for (let gridX = 0; gridX < gridSize.x; gridX++) {
            this.gameGrid[gridX] = []

            for (let gridY = 0; gridY < gridSize.y; gridY++) {
                this.gameGrid[gridX][gridY] = {
                    tile: this.tileTypes.noMineNearby,
                    flagId: 0,
                    isFlipped: false,
                }
            }
        }
    }

    fillGrid(gridSize, gameDifficulty, firstTileCoordinates) {
        this.createEmptyGrid(gridSize);

        const mines = Math.floor((this.getPercentageOfMines(gameDifficulty) / 100) * gridSize.x * gridSize.y);
        this.minesIndicator = mines;
        let remainingMines = mines;

        // Distribution des mines sur la grille
        while (remainingMines > 0) {
            const minedTileCoordinates = {
                x: Math.floor((Math.random() * gridSize.x)),
                y: Math.floor((Math.random() * gridSize.y)),
            }

            if (this.#areObjectsEqual(minedTileCoordinates, firstTileCoordinates)) {
                this.gameGrid[minedTileCoordinates.x][minedTileCoordinates.y].tile = this.tileTypes.noMineNearby;
            } else if (remainingMines > 0 && this.gameGrid[minedTileCoordinates.x][minedTileCoordinates.y].tile != this.tileTypes.minePlacedHere) {
                this.gameGrid[minedTileCoordinates.x][minedTileCoordinates.y].tile = this.tileTypes.minePlacedHere;
                remainingMines--;
            } else if (this.gameGrid[minedTileCoordinates.x][minedTileCoordinates.y].tile != this.tileTypes.minePlacedHere) {
                this.gameGrid[minedTileCoordinates.x][minedTileCoordinates.y].tile = this.tileTypes.noMineNearby;
            }
        }

        // Détection des mines autour de la case
        const offsets = [-1, 0, 1];
        for (let gridX = 0; gridX < gridSize.x; gridX++) {
            for (let gridY = 0; gridY < gridSize.y; gridY++) {
                let minesNearby = 0;

                for (let xOffset of offsets) {
                    for (let yOffset of offsets) {
                        if (xOffset === 0 && yOffset === 0) {
                            continue;
                        }
                        const neighborTileCoordinates = {
                            x: gridX + xOffset,
                            y: gridY + yOffset,
                        }

                        if (neighborTileCoordinates.x >= 0 && 
                            neighborTileCoordinates.x < gridSize.x && 
                            neighborTileCoordinates.y >= 0 && 
                            neighborTileCoordinates.y < gridSize.y) {

                            if (this.gameGrid[neighborTileCoordinates.x][neighborTileCoordinates.y].tile === this.tileTypes.minePlacedHere) {
                                minesNearby++;
                            }
                        }
                    }
                }

                if (this.gameGrid[gridX][gridY].tile !== this.tileTypes.minePlacedHere) {
                    if (minesNearby === 0) {
                        this.gameGrid[gridX][gridY].tile = this.tileTypes.noMineNearby;
                    } else {
                        this.gameGrid[gridX][gridY].tile = this.tileTypes[`minesNearby` + minesNearby];
                    }
                }
            }
        }
    }

    flipTile(gridSize, gameDifficulty, clickedTileCoordinates, safeMode) {
        return new Promise((resolve, reject) => {
            const firstClick = this.firstClick;
            if (this.firstClick) {
                this.firstClick = false;
                this.fillGrid(gridSize, gameDifficulty, clickedTileCoordinates);
            }

            let isDefeat = false

            if (!this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].isFlipped && this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].flagId !== 1) {
                this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].isFlipped = true;
                this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].flagId = 0;
                    
                if (this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].tile === this.tileTypes.noMineNearby) {
                    this.#discoversAdjacentTiles(clickedTileCoordinates);
                } else if (firstClick) {
                    if (this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].tile !== this.tileTypes.minePlacedHere) {
                        const adjacentTiles = this.#getAdjacentTiles(clickedTileCoordinates, gridSize, false);

                        for (const tile of adjacentTiles) {
                            if (tile.tile === this.tileTypes.noMineNearby) {
                                this.gameGrid[tile.x][tile.y].isFlipped = true;
                                this.gameGrid[tile.x][tile.y].flagId = 0;
                                this.#discoversAdjacentTiles({x: tile.x, y: tile.y});
                            }
                        }
                    }
                }

                if (this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].tile === this.tileTypes.minePlacedHere) {
                    if (safeMode) {
                        this.minesIndicator--;
                    } else {
                        isDefeat = true
                        this.firstClick = true
                        this.#revealAllMines()
                    }
                }
            }

            resolve(isDefeat);
        });
    }

    flipTilesAround(gridSize, clickedTileCoordinates, safeMode) {
        return new Promise((resolve, reject) => {
            let isDefeat = false

            if (this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].isFlipped && this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].tile !== this.tileTypes.noMineNearby && this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].tile !== this.tileTypes.minePlacedHere) {
                const adjacentTiles = this.#getAdjacentTiles(clickedTileCoordinates, gridSize, true);

                for (const adjacentTileCoordinates of adjacentTiles) {
                    if (this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].flagId === 0 && !this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].isFlipped){
                        this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].isFlipped = true;
                        this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].flagId = 0;
                            
                        if (this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].tile === this.tileTypes.noMineNearby) {
                            this.#discoversAdjacentTiles(adjacentTileCoordinates);
                        }

                        if (this.gameGrid[adjacentTileCoordinates.x][adjacentTileCoordinates.y].tile === this.tileTypes.minePlacedHere) {
                            if (safeMode) {
                                this.minesIndicator--;
                            } else {
                                isDefeat = true
                                this.firstClick = true
                                this.#revealAllMines()
                            }
                        }
                    }
                }
            }

            resolve(isDefeat);
        });
    }

    changeTileFlag(clickedTileCoordinates) {
        if (!this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].isFlipped) {

            let currentTileFlagId = 2;
            if ([0, 1, 2].includes(this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].flagId)) {
                currentTileFlagId = this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].flagId;
            }
            const nextTileFlagId = currentTileFlagId === 2 ? 0 : currentTileFlagId + 1
            this.gameGrid[clickedTileCoordinates.x][clickedTileCoordinates.y].flagId = nextTileFlagId;
            this.#updateMinesIndicator(currentTileFlagId, nextTileFlagId);
        }
    }

    checkVictory(gridSize) {
        return new Promise((resolve, reject) => {
            let isVictory = true;

            for (let gridX = 0; gridX < gridSize.x; gridX++) {
                for (let gridY = 0; gridY < gridSize.y; gridY++) {
                    if (this.gameGrid[gridX][gridY].tile !== this.tileTypes.minePlacedHere && !this.gameGrid[gridX][gridY].isFlipped) {
                        isVictory = false;
                    }
                }
            }

            if (isVictory) {
                this.firstClick = true
            }

            resolve(isVictory);
        });
    }

    getTileCoordinates(clickX, clickY, canvasWidth, canvasHeight, gridSize) {
        const tileSize = Math.min(canvasWidth / gridSize.x, canvasHeight / gridSize.y);
        const gridFrame = {
            start:{
                x: (canvasWidth - (gridSize.x * tileSize)) / 2,
                y: (canvasHeight - (gridSize.y * tileSize)) / 2,
            },
            size: {
                x: tileSize * gridSize.x,
                y: tileSize * gridSize.y,
            }
        }

        if (clickX >= gridFrame.start.x && clickX <= gridFrame.start.x + gridFrame.size.x &&
            clickY >= gridFrame.start.y && clickY <= gridFrame.start.y + gridFrame.size.y) {

            const tileCoordinates = {
                x: Math.floor((clickX - gridFrame.start.x) / tileSize),
                y: Math.floor((clickY - gridFrame.start.y) / tileSize),
            }

            if (tileCoordinates.x >= 0 && tileCoordinates.x < this.gameGrid.length &&
                tileCoordinates.y >= 0 && tileCoordinates.y < this.gameGrid[0].length) {

                return tileCoordinates;
            }
        }
        return false;
    }
}