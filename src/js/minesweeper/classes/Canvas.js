export class Canvas {
    constructor() {
        this._canvas = null;
        this._ctx = null;
        this._center = {
            x: 0,
            y: 0,
        }
        this._themeColors = null
        this._themeList = {
            classic: {
                topHiddenTileGradientColor      : `#7575ff`,
                botHiddenTileGradientColor      : `#4242e8`,
                botHiddenTileCircleGradientColor: `#8c8cff`,
                topFlippedTileGradientColor     : `#f7f7f7`,
                botFlippedTileGradientColor     : `#e3e3e3`,
                backgroundColor                 : `#ffffff`,
                cancelledMineColor              : `#ff0000`,
                defaultWritingColor             : `#000000`,
                minesNearby1Color               : `#7575ff`,
                minesNearby2Color               : `#008000`,
                minesNearby3Color               : `#ff0000`,
                minesNearby4Color               : `#800080`,
                minesNearby5Color               : `#ffa500`,
                minesNearby6Color               : `#000000`,
                minesNearby7Color               : `#a52a2a`,
                minesNearby8Color               : `#ffd700`,
            },
            dark: {
                topHiddenTileGradientColor      : `#828282`,
                botHiddenTileGradientColor      : `#000000`,
                botHiddenTileCircleGradientColor: `#b5b5b5`,
                topFlippedTileGradientColor     : `#f7f7f7`,
                botFlippedTileGradientColor     : `#e3e3e3`,
                backgroundColor                 : `#ffffff`,
                cancelledMineColor              : `#828282`,
                defaultWritingColor             : `#000000`,
                minesNearby1Color               : `#000000`,
                minesNearby2Color               : `#008000`,
                minesNearby3Color               : `#ff0000`,
                minesNearby4Color               : `#0070ff`,
                minesNearby5Color               : `#ffa500`,
                minesNearby6Color               : `#000000`,
                minesNearby7Color               : `#a52a2a`,
                minesNearby8Color               : `#ffd700`,
            },
            forest: {
                topHiddenTileGradientColor      : `#1ed050`,
                botHiddenTileGradientColor      : `#40ad1e`,
                botHiddenTileCircleGradientColor: `#5fdf38`,
                topFlippedTileGradientColor     : `#c57f51`,
                botFlippedTileGradientColor     : `#ab6b41`,
                backgroundColor                 : `#308216`,
                cancelledMineColor              : `#cd0000`,
                defaultWritingColor             : `#ffffff`,
                minesNearby1Color               : `#ffffff`,
                minesNearby2Color               : `#ddc732`,
                minesNearby3Color               : `#cd0000`,
                minesNearby4Color               : `#bf09bf`,
                minesNearby5Color               : `#ffa500`,
                minesNearby6Color               : `#092cbf`,
                minesNearby7Color               : `#00cdb5`,
                minesNearby8Color               : `#000000`,
            },
        }
        this._fontFamily = null

        this.loadedImages = [];
        this.images = [
            { src: './public/img/flag5.png', width: 1.1, height: 1.1 },
            { src: './public/img/question3.png', width: 1, height: 1 },
            { src: './public/img/bomb.png', width: 0.8, height: 0.8 },
        ];
    
        const imagePromises = this.images.map((imageObj) => this.#loadImage(imageObj.src));
    
        Promise.all(imagePromises)
            .then((loadedImages) => {
                this.loadedImages = loadedImages;
            })
            .catch((error) => {
                console.error('Erreur lors du chargement des images:', error);
            });
    }

    // Getters

    get canvas() {
        return this._canvas;
    }
    get ctx() {
        return this._ctx;
    }
    get center() {
        return this._center;
    }
    get themeColors() {
        return this._themeColors;
    }
    get themeList() {
        return this._themeList;
    }
    get fontFamily() {
        return this._fontFamily;
    }

    // Setters

    set canvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }
    set center(center) {
        this._center = center;
    }
    set themeColors(themeColors) {
        this._themeColors = themeColors;
    }
    set themeList(themeList) {
        this._themeList = themeList;
    }
    set fontFamily(fontFamily) {
        this._fontFamily = fontFamily + `, Arial, sans-serif`;
    }

    // Methods

    #selectImage(imageIndex, tileSize, currentTile) {
        const image = this.loadedImages[imageIndex];
        const imageObj = this.images[imageIndex];
        const imageWidth = tileSize * imageObj.width;
        const imageHeight = tileSize * imageObj.height;
        const imageX = currentTile.x + (tileSize - imageWidth) / 2;
        const imageY = currentTile.y + (tileSize - imageHeight) / 2;

        return {
            image: image,
            obj: imageObj,
            width: imageWidth,
            height: imageHeight,
            x: imageX,
            y: imageY,
        };
    }
              
    #loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    selectTheme(themeKey) {
        return this._themeList[this._themeList.hasOwnProperty(themeKey) ? themeKey : `classic`];
    }

    draw(gridSize, gameGrid, tileTypes, forceRendering = false, safeMode) {
        const tileSize = Math.min(this.canvas.width / gridSize.x, this.canvas.height / gridSize.y);
        const gridFrame = {
            start:{
                x: (this.canvas.width - (gridSize.x * tileSize)) / 2,
                y: (this.canvas.height - (gridSize.y * tileSize)) / 2,
            },
            size: {
                x: tileSize * gridSize.x,
                y: tileSize * gridSize.y,
            }
        }

        if (this.canvas){
            this.clear();

            if (this.loadedImages.length === this.images.length || forceRendering) {
                for (let gridX = 0; gridX < gridSize.x; gridX++) {
                    for (let gridY = 0; gridY < gridSize.y; gridY++) {
                        const currentTile = {
                            x: gridFrame.start.x + gridX * tileSize,
                            y: gridFrame.start.y + gridY * tileSize,
                        }
    
                        if (gameGrid[gridX][gridY].isFlipped){ // Case découverte
                            const borderRadius = tileSize * 0.1;
                            const overlaySize = tileSize * 0.95;
                            const overlay = {
                                x: currentTile.x + (tileSize - overlaySize) / 2,
                                y: currentTile.y + (tileSize - overlaySize) / 2
                            }
    
                            this.ctx.beginPath();
                            this.ctx.moveTo(overlay.x + borderRadius, overlay.y);
                            this.ctx.lineTo(overlay.x + overlaySize - borderRadius, overlay.y);
                            this.ctx.arcTo(overlay.x + overlaySize, overlay.y, overlay.x + overlaySize, overlay.y + borderRadius, borderRadius);
                            this.ctx.lineTo(overlay.x + overlaySize, overlay.y + overlaySize - borderRadius);
                            this.ctx.arcTo(overlay.x + overlaySize, overlay.y + overlaySize, overlay.x + overlaySize - borderRadius, overlay.y + overlaySize, borderRadius);
                            this.ctx.lineTo(overlay.x + borderRadius, overlay.y + overlaySize);
                            this.ctx.arcTo(overlay.x, overlay.y + overlaySize, overlay.x, overlay.y + overlaySize - borderRadius, borderRadius);
                            this.ctx.lineTo(overlay.x, overlay.y + borderRadius);
                            this.ctx.arcTo(overlay.x, overlay.y, overlay.x + borderRadius, overlay.y, borderRadius);
                            this.ctx.closePath();
                            
                            // Dégradé de couleur du fond
                            const gradient = this.ctx.createLinearGradient(currentTile.x, currentTile.y, currentTile.x, currentTile.y + tileSize);
                            gradient.addColorStop(0, this.themeColors.topFlippedTileGradientColor);
                            gradient.addColorStop(1, this.themeColors.botFlippedTileGradientColor);
                            this.ctx.fillStyle = gradient;
                            this.ctx.fill();

                            if (gameGrid[gridX][gridY].tile === tileTypes.minePlacedHere){ // Mine sur la case
                                if (safeMode) {
                                    const crossSize = tileSize * 0.75;
                                    const cross = {
                                        x: currentTile.x + tileSize / 2,
                                        y: currentTile.y + tileSize / 2,
                                    }

                                    this.ctx.strokeStyle = this.themeColors.cancelledMineColor;
                                    this.ctx.lineWidth = .1 * tileSize;

                                    this.ctx.beginPath();
                                    this.ctx.moveTo(cross.x - crossSize / 2, cross.y - crossSize / 2);
                                    this.ctx.lineTo(cross.x + crossSize / 2, cross.y + crossSize / 2);
                                    this.ctx.moveTo(cross.x + crossSize / 2, cross.y - crossSize / 2);
                                    this.ctx.lineTo(cross.x - crossSize / 2, cross.y + crossSize / 2);
                                    this.ctx.stroke();
                                }
                                const img = this.#selectImage(2, tileSize, currentTile)
                                this.ctx.drawImage(img.image, img.x, img.y, img.width, img.height);
                            } else if (gameGrid[gridX][gridY].tile !== tileTypes.noMineNearby){ // Mines proches
                                const text = (Object.keys(tileTypes).find(key => tileTypes[key] === gameGrid[gridX][gridY].tile)).split('minesNearby')[1];
                                
                                this.ctx.fillStyle = this.themeColors[`minesNearby` + text + `Color`] || this.themeColors.defaultWritingColor;
                                this.ctx.font = tileSize * 0.65 + 'px ' + this.fontFamily;
                                
                                const textMetrics = this.ctx.measureText(text);
                                const textWidth = textMetrics.width;
                                const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
                                
                                this.ctx.fillText(
                                    text, 
                                    overlay.x + (overlaySize - textWidth) / 2, 
                                    overlay.y + (overlaySize - textHeight) / 2 + textMetrics.actualBoundingBoxAscent
                                );
                            }
                        } else { // Case cachée
                            const borderRadius = tileSize * 0.1;
                            const overlaySize = tileSize * 0.95;
                            const overlay = {
                                x: currentTile.x + (tileSize - overlaySize) / 2,
                                y: currentTile.y + (tileSize - overlaySize) / 2
                            }
    
                            this.ctx.beginPath();
                            this.ctx.moveTo(overlay.x + borderRadius, overlay.y);
                            this.ctx.lineTo(overlay.x + overlaySize - borderRadius, overlay.y);
                            this.ctx.arcTo(overlay.x + overlaySize, overlay.y, overlay.x + overlaySize, overlay.y + borderRadius, borderRadius);
                            this.ctx.lineTo(overlay.x + overlaySize, overlay.y + overlaySize - borderRadius);
                            this.ctx.arcTo(overlay.x + overlaySize, overlay.y + overlaySize, overlay.x + overlaySize - borderRadius, overlay.y + overlaySize, borderRadius);
                            this.ctx.lineTo(overlay.x + borderRadius, overlay.y + overlaySize);
                            this.ctx.arcTo(overlay.x, overlay.y + overlaySize, overlay.x, overlay.y + overlaySize - borderRadius, borderRadius);
                            this.ctx.lineTo(overlay.x, overlay.y + borderRadius);
                            this.ctx.arcTo(overlay.x, overlay.y, overlay.x + borderRadius, overlay.y, borderRadius);
                            this.ctx.closePath();
                            
                            // Dégradé de couleur du fond
                            const gradient = this.ctx.createLinearGradient(currentTile.x, currentTile.y, currentTile.x, currentTile.y + tileSize);
                            gradient.addColorStop(0, this.themeColors.topHiddenTileGradientColor);
                            gradient.addColorStop(1, this.themeColors.botHiddenTileGradientColor);
                            this.ctx.fillStyle = gradient;
                            this.ctx.fill();
    
                            // Cercle avec dégradé et bordure
                            const circleRadius = overlaySize * 0.35;
                            const circleX = overlay.x + overlaySize / 2;
                            const circleY = overlay.y + overlaySize / 2;
                            const circleGradient = this.ctx.createLinearGradient(circleX, circleY - circleRadius, circleX, circleY + circleRadius);
                            circleGradient.addColorStop(0, this.themeColors.botHiddenTileGradientColor);
                            circleGradient.addColorStop(1, this.themeColors.botHiddenTileCircleGradientColor);
    
                            this.ctx.beginPath();
                            this.ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
                            this.ctx.fillStyle = circleGradient;
                            this.ctx.fill();
    
                            this.ctx.strokeStyle = this.themeColors.botHiddenTileGradientColor;
                            this.ctx.lineWidth = .05 * tileSize;
                            this.ctx.stroke();
    
                            switch (gameGrid[gridX][gridY].flagId) {
                                case 1: // Drapeau de mine
                                    var img = this.#selectImage(0, tileSize, currentTile)
                                    this.ctx.drawImage(img.image, img.x, img.y, img.width, img.height);
                                    break;
                                    
                                case 2: // Drapeau de doute
                                    var img = this.#selectImage(1, tileSize, currentTile)
                                    this.ctx.drawImage(img.image, img.x, img.y, img.width, img.height);
                                    break;
                            
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }
    
    drawVictoryScreen() {
        this.drawFinalScreen('victory')
      }
      

    drawDefeatScreen() {
        this.drawFinalScreen('defeat')
    }

    drawFinalScreen(result) {
        const finalScreen = {
            result: {
                text: ``,
                topGradientColor: ``,
                botGradientColor: ``,
            },
            description: {
                text: ``,
                color: ``,
            }
        }

        switch (result) {
            case 'victory':
                finalScreen.result.text = 'Victoire !'
                finalScreen.result.topGradientColor = 'yellow'
                finalScreen.result.botGradientColor = 'gold'
                finalScreen.description.text = 'Félicitations, vous avez déminé la grille !';
                finalScreen.description.color = 'white'
                break;
                
            case 'defeat':
                finalScreen.result.text = 'Défaite'
                finalScreen.result.topGradientColor = 'red'
                finalScreen.result.botGradientColor = 'brown'
                finalScreen.description.text = 'Dommage, réessayez encore une fois !';
                finalScreen.description.color = 'white'
                break;
        
            default:
                break;
        }

        this.ctx.fillStyle = '#00000055';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Texte de titre
        const textSpacing = [90, 100];
        const canvasSizeRef = Math.min(this.canvas.width, this.canvas.height)
        const resultTextSize = canvasSizeRef / 8;
        const resultTextY = this.canvas.height / (2 * (textSpacing[1] / textSpacing[0]));
        const gradient = this.ctx.createLinearGradient(
            0,
            resultTextY - resultTextSize / 2,
            0,
            resultTextY + resultTextSize / 2
        );
        gradient.addColorStop(0, finalScreen.result.topGradientColor);
        gradient.addColorStop(1, finalScreen.result.botGradientColor);
        this.ctx.fillStyle = gradient;
        this.ctx.font = '700 ' + resultTextSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = canvasSizeRef / 200;
        this.ctx.fillText(finalScreen.result.text, this.canvas.width / 2, resultTextY);
      
        // Texte de description
        this.ctx.fillStyle = finalScreen.description.color;
        this.ctx.font = '400 ' + canvasSizeRef / 22 + 'px ' + this.fontFamily;
        this.ctx.fillText(
            finalScreen.description.text,
            this.canvas.width / 2,
            this.canvas.height / (2 * (textSpacing[0]/textSpacing[1]))
        );
    }

    clear() {
        if (this.canvas){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.themeColors.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    updateSize() {
        return new Promise((resolve, reject) => {
            if (this.canvas){
                this.canvas.width = this.canvas.offsetWidth;
                this.canvas.height = this.canvas.offsetHeight;
        
                this.center.x = this.canvas.width / 2;
                this.center.y = this.canvas.height / 2;
            }
            resolve()
        });
    }
}