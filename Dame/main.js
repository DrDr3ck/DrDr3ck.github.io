const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 400, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_WIN_STATE = 3;
let curState = GAME_START_STATE;
const PLAYER_CHOOSE = 1;
const PLAYER_SELECTED = 2;
const PLAYER_MOVE = 3;
const PLAYER_WIN = 4;
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
const menu = [ startButton ];
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

function initBoard(empty = false) {
	board = [];
	for (let col = 0; col < 10; col++) {
		board.push([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
		if (!empty) {
			for (let row = 0; row < 10; row++) {
				const white = (row * 10 + col) % 2 === row % 2;
				if (row <= 3 && !white) {
					board[col][row] = 1;
				}
				if (row >= 6 && !white) {
					board[col][row] = 2;
				}
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
	return Math.abs(val) === curPlayer;
}

function canMove(pawnType, col, row) {
	if (outOfBoard(col, row)) {
		return false;
	}
	// check if pawn can move on a free tile
	if (pawnType === 1 || pawnType === -1) {
		if (isFree(col - 1, row + 1) || isFree(col + 1, row + 1)) {
			return true;
		}
	}
	if (pawnType === -1) {
		if (isFree(col - 1, row - 1) || isFree(col + 1, row - 1)) {
			return true;
		}
	}
	if (pawnType === 2 || pawnType === -2) {
		if (isFree(col - 1, row - 1) || isFree(col + 1, row - 1)) {
			return true;
		}
	}
	if (pawnType === -2) {
		if (isFree(col - 1, row + 1) || isFree(col + 1, row + 1)) {
			return true;
		}
	}
	return false;
}

/**
 * Check if there is an enemy pawn at col,row
 * @param {*} col 
 * @param {*} row 
 */
function enemyPawn(col, row) {
	if (outOfBoard(col, row)) {
		return false;
	}
	return Math.abs(board[col][row]) === 3 - curPlayer;
}

function canPawnJumpEnemy(col, row, dx, dy) {
	if (enemyPawn(col + dx, row + dy) && isFree(col + dx * 2, row + dy * 2)) {
		return true;
	}
	return false;
}

function canQueenJumpEnemy(col, row, dx, dy) {
	let curCol = col + dx;
	let curRow = row + dy;
	while (isFree(curCol, curRow)) {
		curCol += dx;
		curRow += dy;
	}
	if (canPawnJumpEnemy(curCol - dx, curRow - dy, dx, dy)) {
		return true;
	}
	return false;
}

function canJump(pawnType, col, row) {
	if (outOfBoard(col, row)) {
		return false;
	}
	// check if 'pion' can jump over an enemy
	if (pawnType === 1) {
		if (canPawnJumpEnemy(col, row, -1, 1)) {
			return true;
		}
		if (canPawnJumpEnemy(col, row, 1, 1)) {
			return true;
		}
		if (canPawnJumpEnemy(col, row, -1, -1)) {
			return true;
		}
		if (canPawnJumpEnemy(col, row, 1, -1)) {
			return true;
		}
	}
	if (pawnType === -1) {
		// Queen
		if (canQueenJumpEnemy(col, row, -1, 1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, 1, 1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, -1, -1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, 1, -1)) {
			return true;
		}
	}
	if (pawnType === 2) {
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
	if (pawnType === -2) {
		// Queen
		if (canQueenJumpEnemy(col, row, -1, 1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, 1, 1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, -1, -1)) {
			return true;
		}
		if (canQueenJumpEnemy(col, row, 1, -1)) {
			return true;
		}
	}
	return false;
}

function deselectSelectedPawn(tileX, tileY) {
	if (outOfBoard(tileX, tileY)) {
		return;
	}
	const val = board[tileX][tileY];
	if (!isCurrentPlayer(val)) {
		return;
	}
	if (selectablePawns.length <= 1) {
		return;
	}
	if (selectedPawn && selectedPawn.col === tileX && selectedPawn.row === tileY) {
		gameState = PLAYER_CHOOSE;
		selectedPawn = null;
		moves = [];
		return;
	}
}

/**
 * Adds a potential move to list of moves
 * @param {*} col 
 * @param {*} row 
 */
function addMove(col, row) {
	moves.push({ col: col, row: row });
}

/**
 * Adds a pawn as a selectable pawn
 * @param {*} col 
 * @param {*} row 
 */
function addSelectablePawn(col, row) {
	selectablePawns.push({ col: col, row: row });
}

/**
 * Gets list of selectable pawn for current player
 */
function computeSelectable() {
	selectablePawns = [];
	force = false;
	for (let col = 0; col < 10; col++) {
		for (let row = 0; row < 10; row++) {
			const val = board[col][row];
			if (!isCurrentPlayer(val)) {
				continue;
			}
			if (canJump(val, col, row)) {
				if (!force) {
					selectablePawns = [];
					force = true;
				}
				addSelectablePawn(col, row);
			}
			if (!force && canMove(val, col, row)) {
				addSelectablePawn(col, row);
			}
		}
	}
	console.log(JSON.stringify(selectablePawns));
}

function findEnemy(tileX, tileY, dx, dy) {
	let col = tileX;
	let row = tileY;
	while (isFree(col, row)) {
		col += dx;
		row += dy;
	}
	if (enemyPawn(col, row)) {
		return { col: col, row: row };
	}
	return null;
}

function addMoves(tileX, tileY, dx, dy) {
	let col = tileX + dx;
	let row = tileY + dy;
	while (isFree(col, row)) {
		addMove(col, row);
		col += dx;
		row += dy;
	}
}

function addQueenMoves(tileX, tileY, dx, dy) {
	let col = tileX + dx;
	let row = tileY + dy;
	while (isFree(col, row)) {
		addMove(col, row);
		col += dx;
		row += dy;
	}
	if (enemyPawn(col, row) && isFree(col + dx, row + dy)) {
		addMove(col + dx, row + dy);
		col += dx * 2;
		row += dy * 2;
		while (isFree(col, row)) {
			addMove(col, row);
			col + dx;
			row + dy;
		}
	}
}

/**
 * Gets list of tile where selected pawn can move on
 * @param {*} tileX 
 * @param {*} tileY 
 */
function computeMove(tileX, tileY) {
	moves = [];
	const val = board[tileX][tileY];
	if (curPlayer === 1) {
		let col = tileX - 1;
		let row = tileY + 1;

		if (force && val === -1) {
			// special case for Queen
			// 1. get pawn/queen to jump over
			let enemyPosition = findEnemy(col, row, -1, 1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, -1, 1);
			}
			enemyPosition = findEnemy(col, tileY - 1, -1, -1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, -1, -1);
			}
		} else {
			if (!force && (isFree(col, row) || (val == -1 && isFree(tileX - 1, tileY - 1)))) {
				if (val === -1) {
					addQueenMoves(tileX, tileY, -1, 1);
					addQueenMoves(tileX, tileY, -1, -1);
				} else {
					addMove(col, row);
				}
			} else if (enemyPawn(col, row) && isFree(col - 1, row + 1)) {
				addMove(col - 1, row + 1);
			} else if (enemyPawn(col, row - 2) && isFree(col - 1, row - 3)) {
				addMove(col - 1, row - 3);
			}
		}
		col = tileX + 1;
		row = tileY + 1;
		if (force && val === -1) {
			// special case for Queen
			// 1. get pawn/queen to jump over
			let enemyPosition = findEnemy(col, row, 1, 1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, 1, 1);
			}
			enemyPosition = findEnemy(col, tileY - 1, 1, -1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, 1, -1);
			}
		} else {
			if (!force && (isFree(col, row) || (val == -1 && isFree(tileX + 1, tileY - 1)))) {
				if (val === -1) {
					addQueenMoves(tileX, tileY, 1, 1);
					addQueenMoves(tileX, tileY, 1, -1);
				} else {
					addMove(col, row);
				}
			} else if (enemyPawn(col, row) && isFree(col + 1, row + 1)) {
				addMove(col + 1, row + 1);
			} else if (enemyPawn(col, row - 2) && isFree(col + 1, row - 3)) {
				addMove(col + 1, row - 3);
			}
		}
	}
	if (curPlayer === 2) {
		let col = tileX - 1;
		let row = tileY - 1;
		if (force && val === -2) {
			// special case for Queen
			// 1. get pawn/queen to jump over
			let enemyPosition = findEnemy(col, row, -1, -1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, -1, -1);
			}
			enemyPosition = findEnemy(col, tileY + 1, -1, 1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, -1, 1);
			}
		} else {
			if (!force && (isFree(col, row) || (val == -2 && isFree(tileX - 1, tileY + 1)))) {
				if (val === -2) {
					addQueenMoves(tileX, tileY, -1, -1);
					addQueenMoves(tileX, tileY, -1, 1);
				} else {
					addMove(col, row);
				}
			} else if (enemyPawn(col, row) && isFree(col - 1, row - 1)) {
				addMove(col - 1, row - 1);
			} else if (enemyPawn(col, row + 2) && isFree(col - 1, row + 3)) {
				addMove(col - 1, row + 3);
			}
		}
		col = tileX + 1;
		row = tileY - 1;
		if (force && val === -2) {
			// special case for Queen
			// 1. get pawn/queen to jump over
			let enemyPosition = findEnemy(col, row, 1, -1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, 1, -1);
			}
			enemyPosition = findEnemy(col, tileY + 1, 1, 1);
			// 2. add all free move after this pawn/queen
			if (enemyPosition) {
				addMoves(enemyPosition.col, enemyPosition.row, 1, 1);
			}
		} else {
			if (!force && (isFree(col, row) || (val == -2 && isFree(tileX + 1, tileY + 1)))) {
				if (val === -2) {
					addQueenMoves(tileX, tileY, 1, -1);
					addQueenMoves(tileX, tileY, 1, 1);
				} else {
					addMove(col, row);
				}
			} else if (enemyPawn(col, row) && isFree(col + 1, row - 1)) {
				addMove(col + 1, row - 1);
			} else if (enemyPawn(col, row + 2) && isFree(col + 1, row + 3)) {
				addMove(col + 1, row + 3);
			}
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
	moves = [];
	computeSelectable();
	if (selectablePawns.length === 0) {
		gameState = PLAYER_WIN;
		curState = GAME_WIN_STATE;
		curPlayer = 3 - curPlayer;
		uiManager.setUI(menu);
	}
}

/**
 * Returns true if move corresponds to a Jump
 * @param {*} fromX 
 * @param {*} fromY 
 * @param {*} toX 
 * @param {*} toY 
 */
function isJumping(fromX, fromY, toX, toY) {
	return Math.abs(fromX - toX) > 1 || Math.abs(fromY - toY) > 1;
}

function removePawn(fromX, fromY, toX, toY) {
	const dx = toX > fromX ? 1 : -1;
	const dy = toY > fromY ? 1 : -1;
	let col = fromX+dx;
	let row = fromY+dy;
	let jump = false;
	let diff = Math.abs(fromX-toX)-1;
	while( diff > 0 ) {
		if (board[col][row] !== 0) {
			board[col][row] = 0;
			jump = true;
		}
		col+=dx;
		row+=dy;
		diff--;
	}
	return jump;
}

/**
 * Moves selected pawn to tileX,tileY
 * @param {*} tileX 
 * @param {*} tileY 
 */
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
	let curPawnValue = board[selectedPawn.col][selectedPawn.row];
	if (curPawnValue === 1 && tileY === 9) {
		curPawnValue = -1;
	}
	if (curPawnValue === 2 && tileY === 0) {
		curPawnValue = -2;
	}
	board[tileX][tileY] = curPawnValue;
	board[selectedPawn.col][selectedPawn.row] = 0;
	// has jump ?
	if (isJumping(selectedPawn.col, selectedPawn.row, tileX, tileY)) {
		// remove a pawn ?
		if (removePawn(selectedPawn.col, selectedPawn.row, tileX, tileY)) {
			// may jump over another enemy pawn ?
			if (canJump(curPlayer, tileX, tileY)) {
				// same player plays again !!
				setSelectedPawn(tileX, tileY);
				force = true;
				computeMove(tileX, tileY);
				return;
			}
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

/**
 * Selects pawn at tileX, tileY if possible
 * @param {*} tileX 
 * @param {*} tileY 
 */
function selectPawn(tileX, tileY) {
	if (!isInList(selectablePawns, tileX, tileY)) {
		return;
	}
	setSelectedPawn(tileX, tileY);
	computeMove(tileX, tileY);
}

const xMargin = 100;
const yMargin = 20;

function isInList(list, col, row) {
	let result = false;
	list.forEach((m) => {
		if (m.col === col && m.row === row) {
			result = true;
		}
	});
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

			if (isCurrentPlayer(val)) {
				if (gameState === PLAYER_CHOOSE) {
					if (isInList(selectablePawns, col, row)) {
						strokeWeight(2);
						stroke(250);
						if (force) {
							stroke(250, 250, 50);
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
				// Pawn
				fill(val === 1 ? 1 : 151);
				ellipse(x + tileSize / 2, y + tileSize / 2, tileSize - 4, tileSize - 4);
			} else if (val < 0) {
				// Queen
				fill(val === -1 ? 1 : 151);
				ellipse(x + tileSize / 2, y + tileSize / 2, tileSize - 4, tileSize - 4);
				ellipse(x + tileSize / 2, y + tileSize / 2, tileSize - 12, tileSize - 12);
				push();
				textAlign(CENTER, CENTER);
				textSize(36);
				text('☥', x + tileSize / 2, y + 2 + tileSize / 2);
				pop();
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

	if (curState === GAME_START_STATE || curState === GAME_WIN_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (gameState === PLAYER_WIN) {
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text(`${curPlayer === 1 ? 'Black' : 'White'} wins!`, width / 2, height / 2);
		pop();
	}

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
		deselectSelectedPawn(getTileXFromMouse(), getTileYFromMouse());
		movePawn(getTileXFromMouse(), getTileYFromMouse());
	}
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}
	if (key === 'Q') {
		initBoard(true);
		board[2][3] = -1;
		//board[5][6] = -2;
		board[2][1] = 2;
		curPlayer = 1;
		nextPlayer();
	}
}
