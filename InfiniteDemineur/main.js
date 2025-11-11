// Variable globale pour le bouton pressé
let buttonPressed = undefined;
// Désactive le menu contextuel du navigateur sur clic droit
document.addEventListener('contextmenu', function(e) {
	e.preventDefault();
});
const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(
	windowWidth - 300,
	windowHeight - 100,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function preload() {}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/GameEngine/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(
	windowWidth - 70 - 10 - 70,
	70,
	"\uD83D\uDD0A",
	speakerClicked
);
const musicButton = new BFloatingSwitchButton(
	windowWidth - 70,
	70,
	"\uD83C\uDFB6",
	musicClicked
);
const startButton = new BButton(
	80,
	windowHeight - 50 - 200,
	"START",
	startClicked
);

const mines = [
	"Escondida",
	"Grasberg",
	"Carajás",
	"Mirny",
	"Canyon de Bingham",
	"Super Pit de Kalgoorlie",
	"Oyu Tolgoi",
	"Diavik",
	"Jwaneng",
	"Mine de Kiruna"
];
const seed = new Seed(() => {
	const names = mines;
	return names[Math.floor(Math.random() * names.length)];
});
const resetButton = seed.getResetButton(80, 80, {});

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [speakerButton, startButton, musicButton, resetButton];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");
	frameRate(60);
	lastTime = Date.now();
}

function updateGame(elapsedTime) { }

// Mines positions globales
let minePositions = null;
let revealedCells = [];
let flaggedCells = [];

function initGame() {
	// Initialisation des mines
	const rows = 10;
	const cols = 10;
	minePositions = [];
	revealedCells = [];
	while (minePositions.length < 12) {
		const x = Math.floor(Math.random() * cols);
		const y = Math.floor(Math.random() * rows);
		if (!minePositions.some(pos => pos.x === x && pos.y === y)) {
			minePositions.push({ x, y });
		}
	}
	console.log("Mine positions:", minePositions);
	// Initialise la grille des cases révélées et des drapeaux
	for (let i = 0; i < rows; i++) {
		revealedCells[i] = [];
		flaggedCells[i] = [];
		for (let j = 0; j < cols; j++) {
			revealedCells[i][j] = false;
			flaggedCells[i][j] = false;
		}
	}
}

function drawGame() {
	// Paramètres du tableau
	const rows = 10;
	const cols = 10;
	const cellSize = 40;
	const offsetX = (windowWidth - cols * cellSize) / 2;
	const offsetY = (windowHeight - rows * cellSize) / 2;

	// Les mines sont maintenant initialisées dans initGame

	// Dessine la grille
	stroke(200);
	let hoveredX = null;
	let hoveredY = null;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			// Vérifie si la case est une mine
			const isMine = minePositions.some(pos => pos.x === j && pos.y === i);
			if (revealedCells[i] && revealedCells[i][j]) {
				fill(150, 200, 255); // bleu pastel
			} else if (isMine) {
				fill(200, 0, 0); // rouge
			} else {
				fill(100);
			}
			rect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
			// Affiche le drapeau si la case est marquée
			if (flaggedCells[i] && flaggedCells[i][j]) {
				fill(255, 0, 0);
				textSize(22);
				text("🚩", offsetX + j * cellSize + cellSize / 2, offsetY + i * cellSize + cellSize / 2);
			}
			// Affiche le nombre de mines autour si la case est révélée
			if (revealedCells[i] && revealedCells[i][j]) {
				const count = countMinesAround(j, i);
				fill(255);
				textSize(20);
				text(count, offsetX + j * cellSize + cellSize / 2, offsetY + i * cellSize + cellSize / 2);
			}
			// Détection du survol
			if (
				mouseX >= offsetX + j * cellSize && mouseX < offsetX + (j + 1) * cellSize &&
				mouseY >= offsetY + i * cellSize && mouseY < offsetY + (i + 1) * cellSize
			) {
				hoveredX = j;
				hoveredY = i;
			}
		}
	}
	// Affiche les coordonnées et le nombre de mines autour si le curseur est sur une case
	if (hoveredX !== null && hoveredY !== null) {
		fill(255);
		textSize(24);
		const mineCount = countMinesAround(hoveredX, hoveredY);
		text(`X: ${hoveredX}, Y: ${hoveredY} | Mines autour: ${mineCount}`,
			offsetX + cols * cellSize / 2,
			offsetY + rows * cellSize + 30);
	}
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text("Loading...", width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger("Game loaded");
	}
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);
	if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();
	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_START_STATE) {
		seed.render(100, 160, { label: "Seed", color: 220 });
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

	uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	jobManager.draw();

	lastTime = currentTime;
}

function mouseClicked() {
	
}

function mousePressed() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	// Détection du clic gauche sur une case du tableau
	const rows = 10;
	const cols = 10;
	const cellSize = 40;
	const offsetX = (windowWidth - cols * cellSize) / 2;
	const offsetY = (windowHeight - rows * cellSize) / 2;
	console.log("Mouse clicked at:", mouseX, mouseY, mouseButton);
	if (mouseButton === LEFT) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const x1 = offsetX + j * cellSize;
				const y1 = offsetY + i * cellSize;
				if (
					mouseX >= x1 && mouseX < x1 + cellSize &&
					mouseY >= y1 && mouseY < y1 + cellSize
				) {
					revealCell(j, i);
				}
			}
		}
	}
	// Gestion du clic droit pour marquer/dé-marquer une case
	if (mouseButton === RIGHT) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const x1 = offsetX + j * cellSize;
				const y1 = offsetY + i * cellSize;
				if (
					mouseX >= x1 && mouseX < x1 + cellSize &&
					mouseY >= y1 && mouseY < y1 + cellSize
				) {
					if (flaggedCells[i][j]) {
						flaggedCells[i][j] = false;
					} else {
						flaggedCells[i][j] = true;
					}
				}
			}
		}
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}

// Révèle une case et ses voisines si elle vaut 0
function revealCell(x, y) {
	if (revealedCells[y][x]) return;
	revealedCells[y][x] = true;
	const count = countMinesAround(x, y);
	if (count === 0) {
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) continue;
				const nx = x + dx;
				const ny = y + dy;
				if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
					if (!revealedCells[ny][nx]) {
						revealCell(nx, ny);
					}
				}
			}
		}
	}
}

// Compte le nombre de mines autour d'une case (x, y)
function countMinesAround(x, y) {
	let count = 0;
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			if (dx === 0 && dy === 0) continue;
			const nx = x + dx;
			const ny = y + dy;
			if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
				if (minePositions.some(pos => pos.x === nx && pos.y === ny)) {
					count++;
				}
			}
		}
	}
	return count;
}

	
