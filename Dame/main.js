const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 400, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let curState = GAME_START_STATE;
const PLAYER_CHOOSE = 1;
const PLAYER_SELECTED = 2;
const PLAYER_MOVE = 3;
let curPlayer = 0;
let gameState = 0;
let selectedPawn = null;
let moves = [];
let selectablePawns = [];
let force = false;

let toggleDebug = false;

function startClicked() {
    curState = GAME_PLAY_STATE;
    uiManager.setUI([]);
    initBoard();
    curPlayer = 1;
    nextPlayer();
}

const startButton = new BButton(130, 580, 'START', startClicked);
startButton.setTextSize(45);
const menu = [
    startButton
];
uiManager.setUI(menu);

let lastTime = 0;

let board = [];

function setup() {
    canvas = createCanvas(800, 600);
    canvas.parent('canvas');

    frameRate(60);

    uiManager.addLogger('Jeu de Dames');
    lastTime = Date.now();

    initBoard();
}

const tileSize = 48;

function initBoard() {
    board = [];
    for (let col = 0; col < 10; col++) {
        board.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        for (let row = 0; row < 10; row++) {
            const white = ((row * 10 + col) % 2 === row % 2);
            if (row <= 3 && !white) {
                board[col][row] = 1;
            }
            if (row >= 6 && !white) {
                board[col][row] = 2;
            }
        }
    }
}

function outOfBoard(col, row) {
    if (col < 0 || row < 0 || col >= 10 || row >= 10) {
        return true;
    }
    return false;
}

function isFree(col, row) {
    if (outOfBoard(col, row)) {
        return false;
    }
    return board[col][row] === 0;
}

function isCurrentPlayer(val) {
    return (val === curPlayer);
}

function canMove(player, col, row) {
    if (outOfBoard(col, row)) {
        return false;
    }
    // check if 'pion' can move
    if (player === 1) {
        if (isFree(col - 1, row + 1) || isFree(col + 1, row + 1)) {
            return true;
        }
    }
    if (player === 2) {
        if (isFree(col - 1, row - 1) || isFree(col + 1, row - 1)) {
            return true;
        }
    }
    return false;
}

function enemyPawn(col, row) {
    if (outOfBoard(col, row)) {
        return false;
    }
    return board[col][row] === 3 - curPlayer;
}

function canJump(player, col, row) {
    if (outOfBoard(col, row)) {
        return false;
    }
    // check if 'pion' can jump over an enemy
    if (player === 1) {
        if (enemyPawn(col - 1, row + 1) && isFree(col - 2, row + 2)) {
            return true;
        }
        if (enemyPawn(col + 1, row + 1) && isFree(col + 2, row + 2)) {
            return true;
        }
        if (enemyPawn(col - 1, row - 1) && isFree(col - 2, row - 2)) {
            return true;
        }
        if (enemyPawn(col + 1, row - 1) && isFree(col + 2, row - 2)) {
            return true;
        }
    }
    if (player === 2) {
        if (enemyPawn(col - 1, row - 1) && isFree(col - 2, row - 2)) {
            return true;
        }
        if (enemyPawn(col + 1, row - 1) && isFree(col + 2, row - 2)) {
            return true;
        }
        if (enemyPawn(col - 1, row + 1) && isFree(col - 2, row + 2)) {
            return true;
        }
        if (enemyPawn(col + 1, row + 1) && isFree(col + 2, row + 2)) {
            return true;
        }
    }
    return false;
}

function deselectCurrentPawn(tileX, tileY) {
    if (outOfBoard(tileX, tileY)) {
        return;
    }
    const val = board[tileX][tileY];
    if (!isCurrentPlayer(val)) {
        return;
    }
    if( selectablePawns.length <=1 ) {
        return;
    }
    if (selectedPawn && selectedPawn.col === tileX && selectedPawn.row === tileY) {
        gameState = PLAYER_CHOOSE;
        selectedPawn = null;
        moves = [];
        return;
    }
}

function addMove(col, row) {
    moves.push({ col: col, row: row });
}

function addSelect(col, row) {
    selectablePawns.push({ col: col, row: row });
}

function computeSelectable() {
    selectablePawns = [];
    force = false;
    for (let col = 0; col < 10; col++) {
        for (let row = 0; row < 10; row++) {
            const val = board[col][row];
            if( val !== curPlayer ) {
                continue;
            }
            if (canJump(val, col, row)) {
                if (!force) {
                    selectablePawns = [];
                    force = true;
                }
                addSelect(col, row);
            }
            if (!force && canMove(val, col, row)) {
                addSelect(col, row);
            }
        }
    }
    console.log(JSON.stringify(selectablePawns));
}

function computeMove(tileX, tileY) {
    moves = [];
    if (curPlayer === 1) {
        let col = tileX - 1;
        const row = tileY + 1;
        if (!force && isFree(col, row)) {
            addMove(col, row);
        } else if( enemyPawn(col, row) && isFree(col-1 ,row+1) ) {
            addMove(col-1, row+1);
        } else if( enemyPawn(col, row-2) && isFree(col-1 ,row-3) ) {
            addMove(col-1, row-3);
        }
        col = tileX + 1;
        if (!force && isFree(col, row)) {
            addMove(col, row);
        } else if( enemyPawn(col, row) && isFree(col+1 ,row+1) ) {
            addMove(col+1, row+1);
        } else if( enemyPawn(col, row-2) && isFree(col+1 ,row-3) ) {
            addMove(col+1, row-3);
        }
    }
    if (curPlayer === 2) {
        if( tileX === 0 && tileY === 5) {
            console.log("");
        }
        let col = tileX - 1;
        const row = tileY - 1;
        if (!force && isFree(col, row)) {
            addMove(col, row);
        } else if( enemyPawn(col, row) && isFree(col-1 ,row-1) ) {
            addMove(col-1, row-1);
        } else if( enemyPawn(col, row+2) && isFree(col-1 ,row+3) ) {
            addMove(col-1, row+3);
        }
        col = tileX + 1;
        if (!force && isFree(col, row)) {
            addMove(col, row);
        } else if( enemyPawn(col, row) && isFree(col+1 ,row-1) ) {
            addMove(col+1, row-1);
        } else if( enemyPawn(col, row+2) && isFree(col+1 ,row+3) ) {
            addMove(col+1, row+3);
        }
    }
}

function nextPlayer() {
    curPlayer = 3 - curPlayer;
    gameState = PLAYER_CHOOSE;
    if (curPlayer === 1) {
        uiManager.addLogger(`Black turn`);
    } else {
        uiManager.addLogger(`White turn`);
    }
    computeSelectable();
}

function isJumping(fromX, fromY, toX, toY) {
    return Math.abs(fromX-toX)>1 || Math.abs(fromY-toY)>1;
}

function removePawn(fromX, dx, fromY, dy) {
    // TODO
    board[fromX+dx][fromY+dy] = 0;
}

function movePawn(tileX, tileY) {
    if (outOfBoard(tileX, tileY)) {
        return;
    }
    const val = board[tileX][tileY];
    if (val !== 0) {
        return;
    }
    if (!isInList(moves, tileX, tileY)) {
        return;
    }
    // move pawn
    board[tileX][tileY] = curPlayer;
    board[selectedPawn.col][selectedPawn.row] = 0;
    // jump ?
    if( isJumping(selectedPawn.col, selectedPawn.row, tileX, tileY) ) {
        // remove a pawn !!
        const dx = tileX > selectedPawn.col ? 1 : -1;
        const dy = tileY > selectedPawn.row ? 1 : -1;
        removePawn(selectedPawn.col, dx, selectedPawn.row, dy);
        // may jump over another enemy pawn ?
        if( canJump(curPlayer, tileX, tileY)) {
            setSelectedPawn(tileX, tileY);
            force = true;
            computeMove(tileX, tileY);
            return;
        }
    }
    // reset
    selectedPawn = null;
    moves = [];
    gameState = PLAYER_MOVE;
    nextPlayer();
}

function setSelectedPawn(tileX, tileY) {
    selectedPawn = { col: tileX, row: tileY };
    gameState = PLAYER_SELECTED;
}

function selectPawn(tileX, tileY) {
    if (outOfBoard(tileX, tileY)) {
        return;
    }
    const val = board[tileX][tileY];
    if (!isCurrentPlayer(val)) {
        return;
    }
    if (!canMove(val, tileX, tileY)) {
        //return;
    }

    setSelectedPawn(tileX, tileY);
    computeMove(tileX, tileY);
}

const xMargin = 100;
const yMargin = 20;

function isInList(list, col, row) {
    let result = false;
    list.forEach(m => {
        if (m.col === col && m.row === row) {
            result = true;
        }
    }
    );
    return result;
}

function drawBoard() {
    for (let col = 0; col < 10; col++) {
        for (let row = 0; row < 10; row++) {
            const val = board[col][row];
            const x = col * tileSize + xMargin;
            const y = row * tileSize + yMargin;
            if ((row * 10 + col) % 2 === row % 2) {
                fill(151);
            } else {
                fill(51);
            }
            stroke(100);
            strokeWeight(1);
            rect(x, y, tileSize, tileSize);
            if (isInList(moves, col, row)) {
                rect(x + 5, y + 5, tileSize - 10, tileSize - 10);
            }

            if (val === curPlayer) {
                if (gameState === PLAYER_CHOOSE) {
                    if (isInList(selectablePawns, col, row)) {
                        strokeWeight(2);
                        stroke(250);
                        if( force ) {
                            stroke(250,250,50);
                        }
                    }
                }
                if (gameState === PLAYER_SELECTED) {
                    if (col === selectedPawn.col && row === selectedPawn.row) {
                        strokeWeight(4);
                        stroke(250);
                    }
                }
            }

            if (val > 0) {
                fill(val === 1 ? 1 : 151);
                ellipse(x + tileSize / 2, y + tileSize / 2, tileSize - 4, tileSize - 4);
            }
            fill(250);
            if (toggleDebug) {
                text(row * 10 + col, x + 2, y + tileSize - 2);
            }
        }
    }
}

function draw() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastTime;
    background(51);

    uiManager.processInput();
    uiManager.update(elapsedTime);

    drawBoard();

    if (curState === GAME_START_STATE) {
        background(51, 51, 51, 200);
    }

    uiManager.draw();

    if (curState === GAME_PLAY_STATE) {
        if (toolManager.currentTool) {
            toolManager.currentTool.draw();
        }
        jobManager.draw();
    }

    lastTime = currentTime;
}

function getTileXFromMouse() {
    return Math.floor((mouseX - xMargin) / tileSize);
}

function getTileYFromMouse() {
    return Math.floor((mouseY - yMargin) / tileSize);
}

function mouseClicked() {
    toolManager.mouseClicked();
    uiManager.mouseClicked();

    if (gameState === PLAYER_CHOOSE) {
        selectPawn(getTileXFromMouse(), getTileYFromMouse());
    } else if (gameState === PLAYER_SELECTED) {
        deselectCurrentPawn(getTileXFromMouse(), getTileYFromMouse());
        movePawn(getTileXFromMouse(), getTileYFromMouse());
    }
}

function keyPressed() {
    if (key === 'D') {
        toggleDebug = !toggleDebug;
    }
}