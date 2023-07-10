export class View {
    constructor() {
        this._isGameBuild = false;
    }

    // Getters

    get isGameBuild() {
        return this._isGameBuild;
    }

    // Setters

    set isGameBuild(isGameBuild) {
        this._isGameBuild = isGameBuild;
    }

    // Methods
    
    buildGame(gameFrame, gridSize) {
        let gameHTML = `
            <div data-msw>
                <div data-msw-header>
                    <strong data-msw-title>Démineur</strong>
                    <div data-msw-settings>
                        <div>
                            <span>Difficulté :</span>
                            <button type="button" data-msw-setting-difficulty="easy" data-msw-checked="false">Facile</button>
                            <button type="button" data-msw-setting-difficulty="normal" data-msw-checked="false">Moyen</button>
                            <button type="button" data-msw-setting-difficulty="hard" data-msw-checked="false">Difficile</button>
                        </div>
                        <div>
                            <input type="number" name="" step="1" min="4" max="50" value="` + gridSize.x + `" placeholder="10" autocomplete="off" spellchecking="false" data-msw-setting-gridsize="x">
                            <span>×</span>
                            <input type="number" name="" step="1" min="4" max="50" value="` + gridSize.y + `" placeholder="10" autocomplete="off" spellchecking="false" data-msw-setting-gridsize="y">
                        </div>
                    </div>
                    <div data-msw-current>
                        <nav>
                            <button type="button" title="Comment jouer ?" data-msw-help>
                                <a href="https://fr.wikipedia.org/wiki/D%C3%A9mineur_(genre_de_jeu_vid%C3%A9o)" target="_blank">
                                    <img src="./public/img/question.png" alt="How to play ?" data-msw-effect-zoom-in-rotate-left>
                                </a>
                            </button>
                            <button type="button" title="[S] Mode sans défaites" data-msw-safemode data-msw-checked="false">
                                <img src="./public/img/medal.png" alt="No defeat mode" data-msw-effect-zoom-in-rotate-left>
                            </button>
                            <button type="button" title="[F] Plein écran" data-msw-fullscreen>
                                <img src="./public/img/fullscreen.png" alt="Full-screen" data-msw-effect-zoom-out>
                            </button>
                            <button type="button" title="[R] Recommencer une partie" data-msw-restart>
                                <img src="./public/img/restart.png" alt="Start a new game" data-msw-effect-rotate-right>
                            </button>
                        </nav>
                        <div title="Mines restantes">
                            <span data-msw-remaining-mines>0</span>
                            <img src="./public/img/flag.png" alt="mines restantes">
                        </div>
                    </div>
                </div>
                <div data-msw-content>
                    <div data-msw-canvas-container>
                        <canvas id="msw-canvas" data-msw-canvas>
                    </div>
                </div>
            </div>        
        `;

        if (gameFrame.innerHTML = gameHTML) {
            this.isGameBuild = true;
        } else {
            this.isGameBuild = false;
        }
        return this.isGameBuild;
    }

    displayMinesIndicator(minesIndicator) {
        document.querySelector(`[data-msw-remaining-mines]`).innerHTML = minesIndicator;
    }

    useFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.querySelector(`[data-msw-canvas]`).requestFullscreen();
        }
    }
    
    checkDifficulty(difficulty) {
        const difficultyElements = document.querySelectorAll(`[data-msw-setting-difficulty]`);
        difficultyElements.forEach(element => {
            element.dataset.mswChecked = `false`;
        });

        document.querySelector(`[data-msw-setting-difficulty="` + difficulty + `"]`).dataset.mswChecked = `true`
    }

    checkSafeMode(safeMode) {
        document.querySelector(`[data-msw-safemode]`).dataset.mswChecked = safeMode ? `true` : `false`
    }
}