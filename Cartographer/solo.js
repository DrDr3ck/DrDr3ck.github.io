const window_width = 1460; //window.screen.availWidth > 1280 ? 1280 : window.screen.availWidth;
const window_height = 800; //window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	20,
	470,
	200,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let gameState = GAME_LOADING_STATE ;

let titre =  null;

let toggleDebug = false;

let pieces = 0;
const piecesMax = 14;

let season = Season.Printemps;
let seasonTime = SeasonTime[season];
let curTime = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let seed = urlParams.get('seed');
if( !seed ) {
    const currentDateTime = new Date();
    seed = currentDateTime.getTime();
}

const SIMPLE_SQUARE = [["#"]];
const GOLDEN_L = [["G","G"],[" ","G"]];
const BIG_L = [["#","#"],["#","#"],["# "," "]];
const GOLDEN_I = [["G","G"]];
const GOLDEN_BIGI = [["G","G","G"]];
const SIMPLE_PLUS = [[" ","#"," "],["#","#","#"],[" ","#"," "]];
const GOLDEN_DIAG = [["G"," "],[" ","G"]];
const SIMPLE_S = [["#","#"," "],[" ","#","#"]];
const LONG_DIAG = [["#"," "," "],[" ","#"," "],[" "," ","#"]];
const BIG_T = [["#","#","#"],[" ","#"," "],[" ","#"," "]];
const LONG_S = [[" ","#"],[" ","#"],["#","#"],["#"," "]];
const SIMPLE_LINE = [["#"],["#"],["#"],["#"]];
const SIMPLE_T = [["#","#","#"],[" ","#"," "]];
const SIMPLE_L = [["# "," "],["#"," "],["#","#"]];
const LONG_L = [["#","#","#"],["#"," "," "],["#"," "," "]];
const STAIRS = [[" "," ","#"],[" ","#","#"],["#","#"," "]];
const SIMPLE_U = [["#","#","#"],["#"," ","#"]];
const DOUBLE_I = [["#","#"],[" "," "],["#","#"]];

const allShapes = [
    GOLDEN_L, GOLDEN_I, GOLDEN_DIAG, GOLDEN_BIGI, BIG_T, SIMPLE_LINE,
    LONG_S, SIMPLE_T, SIMPLE_L, SIMPLE_SQUARE, LONG_L, BIG_L,
    SIMPLE_PLUS, SIMPLE_S, STAIRS, LONG_DIAG, SIMPLE_U, DOUBLE_I
];

// forestButton, cityButton, fieldButton, waterButton, monsterButton
const forest = "forest";
const city = "city";
const field = "field";
const water = "water";
const monster = "monster";

const explorations = [
    {title: "Hameau", type: [city], time: 1, shape: [GOLDEN_L, BIG_L]},
    {title: "Terres Agricoles", type: [field], time: 1, shape: [GOLDEN_I, SIMPLE_PLUS]},
    {title: "Foret Oubliee", type: [forest], time: 1, shape: [GOLDEN_DIAG, SIMPLE_S]},
    {title: "Grande Riviere", type: [water], time: 1, shape: [GOLDEN_BIGI, STAIRS]},
    {title: "Marecage", type: [forest, water], time: 2, shape: [BIG_T]},
    {title: "Village de Pecheurs", type: [city, water], time: 2, shape: [SIMPLE_LINE]},
    {title: "Village Perche", type: [city, forest], time: 2, shape: [LONG_S]},
    {title: "Exploitation Agricole", type: [city, field], time: 2, shape: [SIMPLE_T]},
    {title: "Verger", type: [forest, field], time: 2, shape: [SIMPLE_L]},
    {title: "Terres Fracturees", type: [forest, city, field, water, monster], time: 0, shape: [SIMPLE_SQUARE]},
    {title: "Ruisseau Preserve", type: [field, water], time: 2, shape: [LONG_L]},
    {title: "Avant-poste en Ruines", type: [], time: 0, shape: []},
    {title: "Offensive de Kobolds", type: [monster], time: 0, shape: [SIMPLE_T]},
    {title: "Attaque de Gobelins", type: [monster], time: 0, shape: [LONG_DIAG]},
    {title: "Raid de Gnolls", type: [monster], time: 0, shape: [SIMPLE_U]},
    {title: "Assaut de Gobelours", type: [monster], time: 0, shape: [DOUBLE_I]}
];

function enableTypeButtons(index) {
    const types = explorations[index].type;
    curSelectedType = -1;
    [forest,city,field,water,monster].forEach(
        (type, i) => {
            const isEnable = types.includes(type);
            typeButtons[i].visible = isEnable;
            if( isEnable && curSelectedType === -1) {
                curSelectedType = i;
            }
        }
    );
}

function chooseShape(index) {
    curSelectedShape = allShapes[index];
    isGoldShape = index < 4;
}

let xBoard = window_width/2-350+87-50;
let yBoard = 65;
let sizeBoard = 58.8; 

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

let points = [
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0}
];

let useTemple = false;
let templesPosition = [];

/**
 * Creates a board of type A or B
 * @param type 
 * @returns created board array
 */
function createBoard(type) {
    const b = [];
    for( let j = 0; j< 11; j++) {
        const row = [];
        for( let i = 0; i< 11; i++) {
            row.push({turn: -1, value: EMPTYCASE});
        }    
        b.push(row);
    }
    if( type === "A") {
        b[3][1].value = "M"; // montagne
        b[8][2].value = "M"; // montagne
        b[5][5].value = "M"; // montagne
        b[2][8].value = "M"; // montagne
        b[7][9].value = "M"; // montagne

        templesPosition = [
            {X:1,Y:2},
            {X:5,Y:1},
            {X:9,Y:2},
            {X:1,Y:8},
            {X:5,Y:9},
            {X:9,Y:8},
        ];
    }
    return b;
}

const board = createBoard("A");

/**
 * Returns true if a monster os next to the given case position
 */
function hasMonster(i,j) {
    if( i > 0 ) {
        if( board[i-1][j].value === MONSTERCASE ) return true;
    }
    if( i < board.length-1 ) {
        if( board[i+1][j].value === MONSTERCASE ) return true;
    }
    if( j > 0 ) {
        if( board[i][j-1].value === MONSTERCASE ) return true;
    }
    if( j < board[i].length-1 ) {
        if( board[i][j+1].value === MONSTERCASE ) return true;
    }
}

let monsters = 0;

function hasDecret(decretName) {
    // TODO
    return false;
}

function nextClicked() {
    // check if a mountain is closed:
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            // find a mountain
            if( board[i][j].value === "M" ) {
                // check neighborhood
                if( neighborhood(board,i,j) === 4 ) {
                    board[i][j].value = "-M";
                    pieces++;
                }
            }
        }
    }

    // check if a golden shape has been used
    if( curSelectedShape[0].some(s=>s==="G") ) {
        pieces++;
    }

    // count monsters
    monsters = 0;
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            // find a monster
            if( board[i][j].value === EMPTYCASE ) {
                if( hasMonster(i,j) ) {
                    monsters++;
                }
            }
        }
    }

    // count decrets !!
    if( hasDecret("Frontieres") ) {
        // const result = countFrontieres(board);
    }

    if( curSelectedType !== MONSTERCASE ) {
        curTime = Math.min(seasonTime, curTime+explorations[curSeasonCards[curSeasonCards.length-1]].time)
    }

    turn++;
    nextButton.enabled = false;
    undoButton.enabled = false;
    pointButton.visible = (curTime === seasonTime);
    if( pointButton.visible ) {
        pointsClicked();
    }
    nextCard();
}

function nextCard() {
    if( curTime === seasonTime ) {
        // count points !!
        return;
    }
    useTemple = false;
    let curCard = cards.shift();
	curSeasonCards.push(curCard);
    if( curCard === 11 ) {
        useTemple = true;
        curCard = cards.shift();
	    curSeasonCards.push(curCard);
        if( curCard === 11 ) {
            curCard = cards.shift();
	        curSeasonCards.push(curCard);
        }
    }
    setupCard(curCard);
}

function undoClicked() {
    // remove shape of current turn
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            if( board[i][j].turn === turn ) {
                board[i][j].turn = -1;
                board[i][j].value = EMPTYCASE;
            }
        }
    }
    nextButton.enabled = false;
    undoButton.enabled = false;
}

let curSelectedShape = null;
let isGoldShape = false;

function turnShape(curShape) {
    if( !curShape ) {
        return;
    }
    const newShape = [];
    const newWidth = curShape[0].length;
    const newHeight = curShape.length;
    for(let i=0; i < newWidth; i++ ) {
        const row = [];
        for(let j=0; j < newHeight; j++ ) {
            row.push(curShape[j][i]);
        }
        newShape.push(row);
    }
    curShape = newShape;
    curShape = flipShape(curShape, false);
    return curShape;
}

function flipShape(curShape, mayTurn=true) {
    if( !curShape ) {
        return;
    }
    const shape = curShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length/2;j++) {
            const tmp = row[j];
            row[j] = row[row.length-j-1];
            row[row.length-j-1] = tmp;
        }
    }
    curShape = shape;
    if( mayTurn ) {
        if( curShape.length < curShape[0].length ) {
            curShape = turnShape(curShape);
            curShape = turnShape(curShape);
        }
    }
    return curShape;
}

function closeCurrentDialog() {
	uiManager.setDialog(null);
}

class PointsDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);

        this.components.forEach((c) => (c.visible = true));
        this.confirmButton = new BButton(10,390,"Confirm",() => {
            const total = this.decret1+this.decret2+pieces-monsters;
            // ajouter les points et changer de saisons
            if( season === Season.Printemps ) {
                points[0] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
                season = Season.Ete;
            } else if( season === Season.Ete ) {
                points[1] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
                season = Season.Automne;
            } else if( season === Season.Automne ) {
                points[2] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
                season = Season.Hiver;
            } else {
                points[3] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
                season = Season.End;
                uiManager.addLogger("The End");
            }
            seasonTime = SeasonTime[season];
            curTime = 0;
            pointButton.visible = false;
            curSeasonCards = [];
            if( season !== Season.End ) {
                cards = cardMgr.getSeason(season);
                nextCard();
            }
            closeCurrentDialog();
            delete this;
        });
        const plusDialogButton = new BFloatingButton(330, 380, '+', ()=>{
            this.confirmButton.visible = true;
        });
        plusDialogButton.setTextSize(32);
        this.components.push(plusDialogButton);

        const decret1Inc1Button = new BFloatingButton(12, 150, '+1', () => {
            this.decret1++;
            this.confirmButton.visible = false;
        });
        decret1Inc1Button.setTextSize(32);
        this.components.push(decret1Inc1Button);
        const decret1Inc5Button = new BFloatingButton(52, 150, '+5', () => {
            this.decret1+=5;
            this.confirmButton.visible = false;
        });
        decret1Inc5Button.setTextSize(32);
        this.components.push(decret1Inc5Button);
        const decret1Dec1Button = new BFloatingButton(12, 200, '-1', () => {
            this.decret1--;
            this.confirmButton.visible = false;
        });
        decret1Dec1Button.setTextSize(32);
        this.components.push(decret1Dec1Button);
        const decret1Dec5Button = new BFloatingButton(52, 200, '-5', () => {
            this.decret1-=5;
            this.confirmButton.visible = false;
        });
        decret1Dec5Button.setTextSize(32);
        this.components.push(decret1Dec5Button);

        const decret2Inc1Button = new BFloatingButton(312-20, 150, '+1', () => {
            this.decret2++;
            this.confirmButton.visible = false;
        });
        decret2Inc1Button.setTextSize(32);
        this.components.push(decret2Inc1Button);
        const decret2Inc5Button = new BFloatingButton(332, 150, '+5', () => {
            this.decret2+=5;
            this.confirmButton.visible = false;
        });
        decret2Inc5Button.setTextSize(32);
        this.components.push(decret2Inc5Button);
        const decret2Dec1Button = new BFloatingButton(312-20, 200, '-1', () => {
            this.decret2--;
            this.confirmButton.visible = false;
        });
        decret2Dec1Button.setTextSize(32);
        this.components.push(decret2Dec1Button);
        const decret2Dec5Button = new BFloatingButton(332, 200, '-5', () => {
            this.decret2-=5;
            this.confirmButton.visible = false;
        });
        decret2Dec5Button.setTextSize(32);
        this.components.push(decret2Dec5Button);

        this.decret1 = 0;
        this.decret2 = 0;

        const monsterButton = new BButton(200,300,`${-monsters}`,()=>{});
        monsterButton.w = 100;
        const pieceButton = new BButton(100,300,pieces.toString(),()=>{});
        pieceButton.w = 100;
        this.confirmButton.setTextSize(30);
        this.confirmButton.w = 150;
        this.components.push(monsterButton);
        this.components.push(pieceButton);
        this.components.push(this.confirmButton);
        pieceButton.enabled = false;
        monsterButton.enabled = false;

        this.transparency = 60;
    }

    doDraw() {
        super.doDraw();
        if (this.popupAnimation !== 0) {
            return;
        }
        fill(250);
		stroke(0);
		textSize(32);
		textAlign(LEFT, TOP);
		text(season, 100, 15);

        textAlign(CENTER, CENTER);
        textSize(60);
        text(this.decret1.toString(), 150,150);
        text(this.decret2.toString(), 250,150);

        textAlign(RIGHT, CENTER);
        text(this.decret1+this.decret2+pieces-monsters, 370,270);
    }
}

function pointsClicked() {
    const dialog = new PointsDialog(1080, 50, 380, 400);
    uiManager.setDialog(dialog);
    dialog.confirmButton.visible = false;
}

let turn = 0;

let curSelectedType = -1;

const startButton = new BButton(40, window_height - 100, "START", startClicked);
const copySeedButton = new BButton(window_width - 450, window_height - 40, "Copy", copySeed);
const resetSeedButton = new BButton(window_width - 230, window_height - 40, "Reset", resetSeed);
copySeedButton.setTextSize(35);
copySeedButton.w = 200;
resetSeedButton.setTextSize(35);
resetSeedButton.w = 200;

const nextButton = new BButton(window_width - 80 - 200*scale, window_height - 100, "NEXT", nextClicked);
nextButton.setTextSize(45*scale);
nextButton.w = 200*scale;
const undoButton = new BButton(window_width - 80 - 200*scale, window_height - 30, "UNDO", undoClicked);
undoButton.setTextSize(45*scale);
undoButton.w = 200*scale;

const pointButton = new BFloatingButton(window_width - 200 - 60 - 100*scale, window_height - 100, "+", pointsClicked);

let cardMgr = null;
let cards = []; // cards for the current season
let curSeasonCards = [];

const typeButtons = [];
const buttons = [];
const shapeButtons = [];

const decretTypes = ["forest", "zone", "ville", "champs"];
const decretPoints = {
    forest: [17,25,18,22],
    zone: [24,24,24,20],
    ville: [16,21,16,20],
    champs: [22,24,20,27]
};
const occurrences = [];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

    spritesheet.addSpriteSheet('board', './board.png', 700, 697);
    spritesheet.addSpriteSheet('cases', './cases.png', 58, 58);
    spritesheet.addSpriteSheet('decret', './decret.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('exploration', './exploration.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('icons', './icons.png', 60,60);
    spritesheet.addSpriteSheet('piece', './piece.png', 33,33);
    spritesheet.addSpriteSheet('season', './season.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('shapes', './shapes.png', 70,40);

    spritesheet.addSpriteSheet('forest', './decret-forest-100.png', 400, 570);
	spritesheet.addSpriteSheet('zone', './decret-zone-100.png', 400, 570);
	spritesheet.addSpriteSheet('ville', './decret-ville-100.png', 400, 570);
	spritesheet.addSpriteSheet('champs', './decret-champs-100.png', 400, 570);

	lastTime = Date.now();    
}

function setupMyUI() {
    const forestButton =new BImageButton(830, 65, spritesheet.getImage('cases', 0), ()=>{
        curSelectedType = 0;
    });
    const cityButton =new BImageButton(830, 65+sizeBoard+5, spritesheet.getImage('cases', 1), ()=>{
        curSelectedType = 1;
    });
    const fieldButton =new BImageButton(830, 65+(sizeBoard+5)*2, spritesheet.getImage('cases', 2), ()=>{
        curSelectedType = 2;
    });
    const waterButton =new BImageButton(830, 65+(sizeBoard+5)*3, spritesheet.getImage('cases', 3), ()=>{
        curSelectedType = 3;
    });
    const monsterButton =new BImageButton(830, 65+(sizeBoard+5)*4, spritesheet.getImage('cases', 4), ()=>{
        curSelectedType = MONSTERCASE;
    });

    const turnButton =new BImageButton(1280, 520, spritesheet.getImage('icons', 1), ()=>{
        curSelectedShape = turnShape(curSelectedShape);
    });
    const flipButton =new BImageButton(1280+70, 520, spritesheet.getImage('icons', 0), ()=>{
        curSelectedShape = flipShape(curSelectedShape);
    });

    typeButtons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton]);
    buttons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton, turnButton, flipButton]);

    let X = 130;
    let Y = 490;
    for( let i=0; i < 18; i++ ) {
        shapeButtons.push(new BImageButton(X, Y, spritesheet.getImage('shapes', i), ()=>{
            chooseShape(i);
        }));
    }

    copySeedButton.x = window_width/2-100;
    copySeedButton.y = 43;

    uiManager.setUI([...buttons, nextButton, undoButton, pointButton, ...shapeButtons, copySeedButton]);
    nextButton.enabled = false;
    undoButton.enabled = false;
    pointButton.visible = false;

    typeButtons.forEach(b=>b.visible=false);
    shapeButtons.forEach(b=>b.visible=false);

    cardMgr = new CardMgr(seed);    
    if( seed ) {
        uiManager.addLogger(`seed: ${seed}`);
    }

    cardMgr.shuffleArray(decretTypes);
    occurrences.push(...[Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4))]);

    cardMgr.init();
    cards = cardMgr.getSeason(season);
    nextCard();
}

function drawLoading() {
    spritesheet.drawSprite('cartographer', 0, window_width/2 - 553/2, 20);
	fill(9, 47, 18);
    const total = spritesheet.totalImagesToLoad;
	const current = spritesheet.totalLoadedImages;
    rect(width / 4, height / 4 * 3, current / total * width / 2, height / 10);
	stroke(0);
	noFill();
	rect(width / 4, height / 4 * 3, width / 2, height / 10);
    fill(250);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, 640);
	if (
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		gameState = GAME_START_STATE;
        uiManager.setUI([startButton, copySeedButton, resetSeedButton]);
        if( document.location.toString().includes("seed=") ) {
            startClicked();
        }
	}
}

function preload() {
	spritesheet.addSpriteSheet('cartographer', './cartographer.png', 553, 759);
}


function startClicked() {
    gameState = GAME_PLAY_STATE;
    uiManager.addLogger("Cartographer solo");
    setupMyUI();
}

let cardButton = [];

function drawType(typeName, i, unique=true) {
    const cardTypes = ["forest", "city", "field", "water", "monster"];
    const typeIndex = cardTypes.indexOf(typeName);
    const typeButton = typeButtons[typeIndex];
    typeButton.visible = true;
    typeButton.enabled = !unique;
    typeButton.x = 1380;
    typeButton.y = 20+70*i;
    if( unique || i === 0 ) {
        curSelectedType = typeIndex;
    }
}

function drawSingleShape(shape, i, unique=true) {
    const shapeIndex = allShapes.indexOf(shape);
    const shapeButton = shapeButtons[shapeIndex];
    shapeButton.visible = true;
    shapeButton.enabled = !unique;
    shapeButton.x = 1280;
    shapeButton.y = 20+50*i;
    if( unique || i === 0 ) {
        chooseShape(shapeIndex);
    }
}

/**
 * \return true if at least one temple is available
 */
function canUseTemple() {
    // check if a temple is still available
    return templesPosition.filter(pos=>
        board[pos.X][pos.Y].value === EMPTYCASE
    ).length > 0;
}

function isATemple(x,y) {
    return templesPosition.findIndex(pos=>pos.X===x && pos.Y===y) >= 0;
}

function canPlaceShape(shape, X, Y, needToBeOnTemple=false) {
    let isOnTemple = false;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }

            const curX = X+i;
            const curY = Y+j;
            if( isATemple(curX, curY) ) {
                isOnTemple = true;
            }
            
            if( !isEmptyCase({X:curX, Y:curY})) {
                return false;
            }
        }
    }
    if( needToBeOnTemple ) {
        return isOnTemple;
    }
    return true;
}

function canPlaceOnBoard(shape) {
    for( let j = 0; j<11; j++ ) {
        for( let i = 0; i < 11; i++) {
            if( canPlaceShape(shape, i, j, useTemple) ) {
                return true;
            }
        }
    }
}

function getAllShapes(shape) {
    const shapes = [];
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = flipShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    return shapes;
}

function checkShapeOnBoard(shape) {
    const shapes = getAllShapes(shape);
    if( shapes.some(s=>canPlaceOnBoard(s)) ) {
        return true;
    }
    return false;
}

function canBePlaced(cardIndex) {
    const curCard = explorations[cardIndex];
    const cardShapes = curCard.shape;
    if( checkShapeOnBoard(cardShapes[0]) ) {
        return true;
    }
    if( cardShapes.length > 1 ) {
        if( checkShapeOnBoard(cardShapes[1]) ) {
            return true;
        }
    }
    return false;
}

function setupCard(cardIndex) {
    // can we use a temple ?
    if( useTemple && !canUseTemple() ) {
        // set 'terres fracturees' as selected card
        cardIndex = 9;
        uiManager.addLogger("No available ruins");
        useTemple = false;
    }
    
    if( !canBePlaced(cardIndex) ) {
        // set 'terres fracturees' as selected card
        cardIndex = 9;
        uiManager.addLogger("Cannot place this shape");
    }
    
    curSelectedShape = null;
    curSelectedType = -1;
    typeButtons.forEach(b=>b.visible=false);
    shapeButtons.forEach(b=>b.visible=false);

    const curCard = explorations[cardIndex];
    uiManager.addLogger(curCard.title);
    const types = curCard.type;
    const shapes = curCard.shape;
    
    types.forEach((t,i)=>drawType(t, i, types.length === 1))
    shapes.forEach((s,i)=>drawSingleShape(s, i, shapes.length === 1))
}

function mouseOverCase() {
    if(
        mouseX > xBoard && mouseX < xBoard+sizeBoard*11 &&
        mouseY > yBoard && mouseY < yBoard+sizeBoard*11
    ) {
        return {X: Math.floor((mouseX-xBoard)/sizeBoard), Y: Math.floor((mouseY-yBoard)/sizeBoard)};
    }
    return null;
}

function drawDecretCard(X,Y,title,index,selection) {
    const cardDecretWidth = 400;
    const cardDecretHeight = 570;
    const decrets = ["A","B","C","D"];
    scale/=2;
	if( decrets.includes(title) ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale*.75);
	} else {
		spritesheet.drawScaledSprite(title, index, X, Y, scale*.75);
	}
    scale*=2;
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardDecretWidth/2*scale*.75, cardDecretHeight/2*scale*.75, 10);
    
}

function isMouseOverDecret() {
	let X = 20;
	let Y = 20;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 0;
	}
	X = 190;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 1;
	}
	Y = 240;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 3;
	}
	X = 20;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 2;
	}
	return -1;
}

function isMouseOverExploration() {
    let X = 1100;
	let Y = 20+40*(curSeasonCards.length-1);
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return true;
	}
    return false;
}

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, index, drawRuin=false) {
    if( index === 11 && drawRuin ) {
        X-=20;
    }
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	spritesheet.drawScaledSprite('exploration', index, X, Y, scale*.75);
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 10);
}

const letters = "ABCDEFGHIJK".split('');

function drawBoard() {
    const X = window_width/2-350;
    const Y = 50;
	spritesheet.drawScaledSprite('board', 0, X, Y, scale);

    spritesheet.drawScaledSprite('decret', 0, 20, 20, scale*.75);
    spritesheet.drawScaledSprite('decret', 1, 190, 20, scale*.75);
    spritesheet.drawScaledSprite('decret', 2, 20, 240, scale*.75);
    spritesheet.drawScaledSprite('decret', 3, 190, 240, scale*.75);

    const overDecret = isMouseOverDecret();
    if( overDecret !== 0 ) {
        drawDecretCard(20, 20, decretTypes[0], occurrences[0], season === Season.Printemps || season === Season.Hiver);
    }
    if( overDecret !== 1 ) {
        drawDecretCard(190, 20, decretTypes[1], occurrences[1], season === Season.Ete || season === Season.Printemps);
    }
    if( overDecret !== 2 ) {
        drawDecretCard(20, 240, decretTypes[2], occurrences[2], season === Season.Automne || season === Season.Ete);
    }
    if( overDecret !== 3 ) {
        drawDecretCard(190, 240, decretTypes[3], occurrences[3], season === Season.Hiver || season === Season.Automne);
    }

    const delta = 0; // TODO
    for( i = 0; i < curSeasonCards.length+delta; i++ ) {
        const card = curSeasonCards[i];
        drawExplorationCard(1100,20+40*i, card, i === curSeasonCards.length+delta-2);	
    }

    /*
    for( i = 0; i < cards.length+delta; i++ ) {
        const card = cards[i];
        drawExplorationCard(1100,20+40*i, card, i === cards.length+delta-2);	
    }
    */

    strokeWeight(1);

    for( let j = 0; j<11; j++ ) {
        for( let i = 0; i < 11; i++) {
            if( !isEmptyCase({X:i, Y:j}) ) {
                spritesheet.drawScaledSprite('cases', board[i][j].value, xBoard+sizeBoard*i, yBoard+sizeBoard*j, scale);
                if( board[i][j].value === "-M") {
                    stroke(0);
                    fill(51);
                    ellipse(xBoard+sizeBoard*i+sizeBoard/2,yBoard+sizeBoard*j+sizeBoard/2+12,22);
                }
            }
            stroke(0);
            noFill();
            if( toggleDebug && board[i][j].value === "M" ) {
                fill(0);
            } else if( toggleDebug && templesPosition.findIndex(pos=>pos.X===i && pos.Y===j) >= 0 ) {
                fill(250,150,0);
            }
            rect(xBoard+sizeBoard*i, yBoard+sizeBoard*j, sizeBoard, sizeBoard);
        }
    }

    // temple ?
    if( useTemple || pointButton.visible) {
        strokeWeight(4);
        highlightTemples();
    }
    strokeWeight(1);

    if( overDecret >= 0 ) {
        scale*=3;
        drawDecretCard(window_width/2-cardWidth/2*scale, 100, decretTypes[overDecret],occurrences[overDecret], false);
        scale/=3;
    }

    if( !pointButton.visible && isMouseOverExploration() ) {
        scale*=3;
        const card = curSeasonCards[curSeasonCards.length-1];
        drawExplorationCard(window_width/2-cardWidth/2*scale, 100, card, false);
        scale/=3;
    }

    textSize(25);
    fill(125);
    textAlign(LEFT, CENTER);
    if( curSelectedShape ) {
        drawShape(25,8, false);
    } else if( pointButton.visible ) {
        text("End of Season", 770, 510);
    }

    // draw cursor on board
    if( !uiManager.currentDialog ) {
        const overCase = mouseOverCase();
        if( overCase !== null ) {
            push();
            textAlign(CENTER, CENTER);
            textSize(25);
            fill(25);
            if( toggleDebug ) {
                text(overCase.X, 305,770);	
                text(overCase.Y, 335,770);	
            } else {
                text(overCase.X+1, 335,770);	
                text(letters[overCase.Y], 305,770);	
            }

            // TODO: check if shape is OUT of the board
            drawShape(overCase.X, overCase.Y);
            if( isGoldShape ) {
                spritesheet.drawScaledSprite('piece', 0, mouseX-33/2, mouseY-33/2, scale);
            }
            pop();
        }
    }

    drawPieces();

    // TODO:
    // selected type button
    /*
    stroke(255,228,180);
    noFill();
    strokeWeight(2);
    if( curSelectedType >= 0 ) {
        rect(830, 65+(sizeBoard+5)*curSelectedType, sizeBoard, sizeBoard);
    }
    */

    if( toggleDebug ) {
        // logger
        rect(
            uiManager.loggerContainer.x,
            uiManager.loggerContainer.y,
            uiManager.loggerContainer.w,
            uiManager.loggerContainer.h
        );
    }

    drawTime();
    drawPoints();

    // affiche le titre si le joueur en a gagné un
    if( season === Season.End && titre ) {
        textAlign(CENTER, CENTER);
        text(titre, 1275, 610);
        textAlign(LEFT, TOP);
    }
}

function drawTime() {
    fill(250);
    stroke(0);
    textSize(32);
    textAlign(LEFT, TOP);
    if( season !== Season.End) {
        text(`${season} ${curTime}/${seasonTime}`, 380, 10);
    } else {
        text(season, 380, 10);
    }
}

function drawPoints() {
    drawSeasonPoint(20,600,0);
    drawSeasonPoint(190,600,1);
    drawSeasonPoint(20,700,2);
    drawSeasonPoint(190,700,3);
    const total = points.reduce((acc,val)=>acc+val.total, 0);
    fill(250);
    stroke(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(total,160,680);

    if( season === Season.End || toggleDebug ) {
        const totalSolo = [0,1,2,3].reduce((acc,val)=>
            acc+decretPoints[decretTypes[val]][occurrences[val]], 0
        );
        textSize(22);
        fill(247, 255, 60);
        text(`- ${totalSolo} = ${total-totalSolo}`,300,680);
        if( season === Season.End ) {
            if( total-totalSolo < -30 ) {
                uiManager.addLogger("Fin du jeu");
            } else if( total-totalSolo < -20 ) {
                titre = "Buveur d'encre patenté";
            } else if( total-totalSolo < -10 ) {
                titre = "Gribouilleur attardé";
            } else if( total-totalSolo < -5 ) {
                titre = "Assistant incompétent";
            } else if( total-totalSolo < 0 ) {
                titre = "Assesseur amateur";
            } else if( total-totalSolo < 10 ) {
                titre = "Apprenti géomètre";
            } else if( total-totalSolo < 20 ) {
                titre = "Topographe itinérant";
            } else if( total-totalSolo < 30 ) {
                titre = "Maitre cartographe";
            } else {
                titre = "Cartographe légendaire";
            }
            if( titre ) {
                uiManager.addLogger(titre);
            }
        }
    }

    fill(250);
    textAlign(LEFT, TOP);
}

function drawSeasonPoint(x,y,seasonIndex) {
    const decret1Value = points[seasonIndex].decret1;
    const decret2Value = points[seasonIndex].decret2;
    const piecesValue = points[seasonIndex].pieces;
    const monstersValue = points[seasonIndex].monsters;
    fill(250);
    stroke(0);
    textSize(18);
    const delta = 35;
    textAlign(LEFT, TOP);
    text(decret1Value, x, y);
    text(decret2Value, x+delta, y);
    text(piecesValue, x, y+delta);
    text(-monstersValue, x+delta, y+delta);
    const total = decret1Value+decret2Value+piecesValue-monstersValue;
    text(total,x+delta*2,y+delta/2);
    noFill();
    rect(x-5,y-5,110,delta*2,10);
    line(x+delta-5,y-5,x+delta-5,y+delta*2-5);
    line(x+delta*2-5,y-5,x+delta*2-5,y+delta*2-5);
    line(x-5,y+delta-7,x+delta*2-5,y+delta-7);
}

function highlightTemples() {
    noFill();
    templesPosition.forEach(pos=>{
        if( board[pos.X][pos.Y].value === EMPTYCASE ) {
            stroke(255,228,180);
            rect(xBoard+sizeBoard*pos.X, yBoard+sizeBoard*pos.Y, sizeBoard, sizeBoard);
        } else {
            stroke(155,128,180);
            rect(xBoard+sizeBoard*pos.X, yBoard+sizeBoard*pos.Y, sizeBoard, sizeBoard);
        }
    });
}

function drawPieces() {
    strokeWeight(1);
    const X = 430;
    const Y = 775;
    const sizePiece = 20;
    for( let i = 0; i < piecesMax; i++ ) {
        if( i < pieces ) {
            spritesheet.drawScaledSprite('piece', 0, X+i*sizePiece*2-sizePiece+3, Y-sizePiece+4, scale);
        } else {
            stroke(0);
            fill(151);
            ellipse(X+i*sizePiece*2,Y,sizePiece);
        }
    }

    text(-monsters,1000,775);
}

let canDraw = true;
let isDrawnOnTemple = false;

function drawShape(X,Y,checkDraw=true) {
    if( !curSelectedShape ) {
        return;
    }
    const deltaX = 0;
    let scale = 0.6;
    if( checkDraw ) {
        canDraw = true;
        isDrawnOnTemple = false;
        scale = 1;
    }
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }
            const curX = X+i;
            const curY = Y+j;
            spritesheet.drawScaledSprite('cases', curSelectedType, xBoard+sizeBoard*curX*scale+deltaX, yBoard+sizeBoard*curY*scale, scale);
            if( checkDraw && !isEmptyCase({X:curX, Y:curY})) {
                stroke(250,50,50);
                strokeWeight(4);
                noFill();
                rect(xBoard+sizeBoard*curX+deltaX, yBoard+sizeBoard*curY, sizeBoard, sizeBoard);
                strokeWeight(1);
                canDraw = false;
            }
            if( checkDraw && useTemple ) {
                if( templesPosition.findIndex(pos=>pos.X===curX && pos.Y===curY) >= 0 ) {
                    isDrawnOnTemple = true;
                }
            }
        }
    }
}

function addShape() {
    if( !curSelectedShape ) {
        return false;
    }
    const overCase = mouseOverCase();
    if( overCase === null ) {
        return false;
    }
    if( useTemple && !isDrawnOnTemple ) {
        uiManager.addLogger("Shape should be on a ruin");
        return false;
    }
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }
            const curX = overCase.X+i;
            const curY = overCase.Y+j;
            board[curX][curY].value = curSelectedType;
            board[curX][curY].turn = turn;    
        }
    }
    return true;
}

function isEmptyCase(position) {
    if( position.X >= board.length ) {
        return 0;
    }
    const curCase = board[position.X][position.Y];
    if( !curCase ) {
        return false;
    }
    return curCase.value === EMPTYCASE;
}

function isCurrentCase(position) {
    const curCase = board[position.X][position.Y]
    return curCase.value === curSelectedType;
}

function shapeAlreadyAdded() {
    // check if a case with current turn has already been added in board
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            if( board[i][j].turn === turn ) {
                return true;
            }
        }
    }
    return false;
}

function addCurrentCase() {
    if( !curSelectedShape ) {
        return;
    }
    const overCase = mouseOverCase();
    if( overCase === null ) {
        // out of board
        return;
    }
    if( shapeAlreadyAdded() ) {
        uiManager.addLogger("Shape already added");
        setTimeout(function() {
            uiManager.addLogger("Please click Next or Undo");
        }, 1500);
        return;
    }
    if( !canDraw ) {
        uiManager.addLogger("Cannot be drawn here");
        return;
    }
    if( addShape() ) {
        nextButton.enabled = true;
        undoButton.enabled = true;
    }
}

function copySeed() {
    if( !navigator.clipboard ) {
        uiManager.addLogger("cannot copy");
        return;
    }
    if( document.location.toString().includes("seed=") ) {
        navigator.clipboard.writeText(`${document.location.toString()}`);
    } else {
        navigator.clipboard.writeText(`${document.location.toString()}?seed=${seed}`);
    }
    uiManager.addLogger("seed copied");
}

function resetSeed() {
    if( document.location.toString().includes("seed=") ) {
        const url = document.location.toString().split("?")[0];
        document.location.assign(url);
    } else {
        const currentDateTime = new Date();
        seed = currentDateTime.getTime();
    }
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);
    if (gameState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();
	uiManager.update(elapsedTime);

    if (gameState === GAME_PLAY_STATE) {
	    drawBoard();
    }

	if (gameState === GAME_START_STATE) {
		background(51);
        spritesheet.drawSprite('cartographer', 0, window_width/2 - 553/2, 20);
        textSize(22);
        textAlign(CENTER, CENTER);
        text(`seed: ${seed}`, window_width  - 300, window_height - 100);
	}

    textAlign(LEFT, TOP);
	uiManager.draw();

	if (gameState === GAME_PLAY_STATE) {
		if (toolManager.currentTool) {
			toolManager.currentTool.draw();
		}
		jobManager.draw();
	}

	lastTime = currentTime;
}

function mouseClicked() {
    if( !uiManager.currentDialog ) {
        addCurrentCase();
    }

	toolManager.mouseClicked();
	uiManager.mouseClicked();

	return false;
}

function mousePressed() {
	console.log(mouseX, mouseY);
    if( toggleDebug ) {
        uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
    }
}

function mouseReleased() {
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
        if( toggleDebug ) {
            uiManager.addLogger(`Screen size: ${window.screen.availWidth.toString()}x${window.screen.availHeight.toString()}`);
        }
	}

    // next seed
    if (key === "NS") {
        const newSeed = parseInt(cardMgr.seed)+1;
        console.log(newSeed);
        document.location.replace(`http://localhost:8000/Cartographer/solo.html?seed=${newSeed.toString()}`)
    }

    if( turn === 0 ) {
        if (key === "a") {
            occurrences[0] = (occurrences[0]+1)%4;
        }
        if (key === "b") {
            occurrences[1] = (occurrences[1]+1)%4;
        }
        if (key === "c") {
            occurrences[2] = (occurrences[2]+1)%4;
        }
        if (key === "d") {
            occurrences[3] = (occurrences[3]+1)%4;
        }
    }

    if( key === "t" ) {
        // tourner la forme de 90 degres
        curSelectedShape = turnShape(curSelectedShape);
    }
    if( key === "r" || key === "f" ) {
        // retourner la forme (miroir)
        curSelectedShape = flipShape(curSelectedShape);
    }
}

