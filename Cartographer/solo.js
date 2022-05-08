const window_width = 1460; //window.screen.availWidth > 1280 ? 1280 : window.screen.availWidth;
const window_height = 800; //window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 200,
	window_height - 400*scale,
	200,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const spritesheet = new SpriteSheet();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let gameState = GAME_PLAY_STATE;

let toggleDebug = false;

let pieces = 0;
const piecesMax = 14;

let season = Season.Printemps;
let seasonTime = 8;
let curTime = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const seed = urlParams.get('seed')
console.log(seed);

const generator = new Math.seedrandom(seed);
function randomInt(i) {
    return Math.floor(generator() * i);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = randomInt(i+1);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
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
}

let xBoard = window_width/2-350+87-50;
let yBoard = 65;
let sizeBoard = 58.8; 

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

let points = [0,0,0,0]; // 400, 760

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
        curTime = Math.min(seasonTime, curTime+explorations[curSelectedCardIndex].time)
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
    curSelectedShape = null;
}

let curSelectedShape = null;
let curSelectedCardIndex = -1;

function turnShape() {
    if( !curSelectedShape ) {
        return;
    }
    const newShape = [];
    const newWidth = curSelectedShape[0].length;
    const newHeight = curSelectedShape.length;
    for(let i=0; i < newWidth; i++ ) {
        const row = [];
        for(let j=0; j < newHeight; j++ ) {
            row.push(curSelectedShape[j][i]);
        }
        newShape.push(row);
    }
    curSelectedShape = newShape;
    flipShape(false);
}

function flipShape(mayTurn=true) {
    if( !curSelectedShape ) {
        return;
    }
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length/2;j++) {
            const tmp = row[j];
            row[j] = row[row.length-j-1];
            row[row.length-j-1] = tmp;
        }
    }
    curSelectedShape = shape;
    if( mayTurn ) {
        if( curSelectedShape.length < curSelectedShape[0].length ) {
            turnShape();
            turnShape();
        }
    }
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
                points[0] = total;
                season = Season.Ete;
                seasonTime = 8;
                curTime = 0;
                pointButton.visible = false;
            } else if( season === Season.Ete ) {
                points[1] = total;
                season = Season.Automne;
                seasonTime = 7;
                curTime = 0;
                pointButton.visible = false;
            } else if( season === Season.Automne ) {
                points[2] = total;
                season = Season.Hiver;
                seasonTime = 6;
                curTime = 0;
                pointButton.visible = false;
            } else {
                points[3] = total;
                season = "The End";
                seasonTime = 0;
                curTime = 0;
                pointButton.visible = false;
                uiManager.addLogger("The End");
            }
            curSeasonCards = [];
            if( season !== "The End" ) {
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
        fill(255);
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

const nextButton = new BButton(window_width - 80 - 200*scale, window_height - 100, "NEXT", nextClicked);
nextButton.setTextSize(45*scale);
nextButton.w = 200*scale;
const undoButton = new BButton(window_width - 80 - 200*scale, window_height - 30, "UNDO", undoClicked);
undoButton.setTextSize(45*scale);
undoButton.w = 200*scale;

const pointButton = new BFloatingButton(window_width - 200 - 80 - 400*scale, window_height - 100, "+", pointsClicked);

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 700, 697);
    spritesheet.addSpriteSheet('cases', './cases.png', 58, 58);
    spritesheet.addSpriteSheet('decret', './decret.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('exploration', './exploration.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('icons', './icons.png', 60,60);
    spritesheet.addSpriteSheet('piece', './piece.png', 33,33);
    spritesheet.addSpriteSheet('season', './season.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('shapes', './shapes.png', 70,40);
    spritesheet.addSpriteSheet('temple', './temple.png', 58, 58);

    spritesheet.addSpriteSheet('forest', './decret-forest.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('zone', './decret-zone.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('ville', './decret-ville.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('champs', './decret-champs.png', cardWidth, cardHeight);
}

const cardMgr = new CardMgr();
let cards = []; // cards for the current season
let curSeasonCards = [];

const typeButtons = [];
const buttons = [];
const shapeButtons = [];

const types = ["forest", "zone", "ville", "champs"];
shuffleArray(types);
const occurrences = [Math.floor(randomInt(4)), Math.floor(randomInt(4)), Math.floor(randomInt(4)), Math.floor(randomInt(4))];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer solo");
	lastTime = Date.now();

    /*
    const templeButton = new BImageButton(830, 65-sizeBoard-5, spritesheet.getImage('temple', 0), ()=>{
        useTemple = !useTemple;
    });
    */
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

    const turnButton =new BImageButton(280, 460, spritesheet.getImage('icons', 1), ()=>{
        turnShape();
    });
    const flipButton =new BImageButton(280, 70+460, spritesheet.getImage('icons', 0), ()=>{
        flipShape();
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

    uiManager.setUI([...buttons, nextButton, undoButton, pointButton, ...shapeButtons]); // no templeButton anymore
    nextButton.enabled = false;
    undoButton.enabled = false;
    pointButton.visible = false;

    typeButtons.forEach(b=>b.visible=false);
    shapeButtons.forEach(b=>b.visible=false);

    cardMgr.init();
    cards = cardMgr.getSeason(season);
    nextCard();
}

let cardButton = [];

function drawType(typeName, i, unique=true) {
    const types = ["forest", "city", "field", "water", "monster"];
    const typeIndex = types.indexOf(typeName);
    const typeButton = typeButtons[typeIndex];
    typeButton.visible = true;
    typeButton.enabled = !unique;
    typeButton.x = 20;
    typeButton.y = 460+70*i;
    if( unique ) {
        curSelectedType = typeIndex;
    }
}

function drawSingleShape(shape, i, unique=true) {
    const shapeIndex = allShapes.indexOf(shape);
    const shapeButton = shapeButtons[shapeIndex];
    shapeButton.visible = true;
    shapeButton.enabled = !unique;
    shapeButton.x = 100+80*i;
    shapeButton.y = 460;
    if( unique ) {
        chooseShape(shapeIndex);
    }
}

function setupCard(cardIndex) {
    curSelectedShape = null;
    curSelectedType = -1;
    curSelectedCardIndex = cardIndex;
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
	const decrets = ["A","B","C","D"];
	if( decrets.includes(title) ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale*.75);
	} else {
		spritesheet.drawScaledSprite(title, index, X, Y, scale*.75);
	}
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 10);
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

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, index) {
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	textAlign(CENTER, CENTER);
	textSize(25);
	fill(25);
	text(index.toString(), X+20,Y+20);	
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
        drawDecretCard(20, 20, types[0], occurrences[0], season === Season.Printemps || season === Season.Hiver);
    }
    if( overDecret !== 1 ) {
        drawDecretCard(190, 20, types[1], occurrences[1], season === Season.Ete || season === Season.Printemps);
    }
    if( overDecret !== 2 ) {
        drawDecretCard(20, 240, types[2], occurrences[2], season === Season.Automne || season === Season.Ete);
    }
    if( overDecret !== 3 ) {
        drawDecretCard(190, 240, types[3], occurrences[3], season === Season.Hiver || season === Season.Automne);
    }

    const delta = 0; // TODO
    for( i = 0; i < curSeasonCards.length+delta; i++ ) {
        const card = curSeasonCards[i];
        drawExplorationCard(1100,20+40*i, card);	
    }

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
    if( useTemple ) {
        strokeWeight(2);
        highlightTemples();
    }
    strokeWeight(1);

    if( overDecret >= 0 ) {
        scale*=3;
        drawDecretCard(window_width/2-cardWidth/2*scale, 100, types[overDecret],occurrences[overDecret], false);
        scale/=3;
    }

    textSize(25);
    fill(125);
    textAlign(LEFT, CENTER);
    if( curSelectedShape ) {
        drawShape(-5,9, false);
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
                text(overCase.X, 300,770);	
                text(overCase.Y, 330,770);	
            } else {
                text(overCase.X+1, 330,770);	
                text(letters[overCase.Y], 300,770);	
            }

            // TODO: check if shape is OUT of the board
            drawShape(overCase.X, overCase.Y);
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
        rect(window_width - 200,
            window_height - 400*scale,
            200,
            100);
    }

    drawPoints();
}

function drawPoints() {
    const total = `${points.join(" + ")} = ${points.reduce((acc,val)=>acc+val)}`;
    fill(255);
    stroke(0);
    textSize(32);
    textAlign(LEFT, TOP);
    text(`${season} ${curTime}/${seasonTime}`, 380, 10);
    textAlign(RIGHT, TOP);
    text(total, 1080, 10);
    textAlign(LEFT, TOP);
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
let onTemple = false;

function drawShape(X,Y,checkDraw=true) {
    if( !curSelectedShape ) {
        return;
    }
    if( checkDraw ) {
        canDraw = true;
        onTemple = false;
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
            spritesheet.drawScaledSprite('cases', curSelectedType, xBoard+sizeBoard*curX, yBoard+sizeBoard*curY, scale);
            if( checkDraw && !isEmptyCase({X:curX, Y:curY})) {
                stroke(250,50,50);
                strokeWeight(4);
                noFill();
                rect(xBoard+sizeBoard*curX, yBoard+sizeBoard*curY, sizeBoard, sizeBoard);
                strokeWeight(1);
                canDraw = false;
            }
            if( checkDraw && useTemple ) {
                if( templesPosition.findIndex(pos=>pos.X===curX && pos.Y===curY) >= 0 ) {
                    onTemple = true;
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
    console.log("usetemple", useTemple);
    console.log("onTemple", onTemple);
    if( useTemple && !onTemple ) {
        uiManager.addLogger("Shape should be on a temple");
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
    if( !canDraw ) {
        uiManager.addLogger("Cannot draw this shape here");
        return;
    }
    if( shapeAlreadyAdded() ) {
        uiManager.addLogger("Shape already added for this turn");
        setTimeout(function() {
            uiManager.addLogger("Please click Next or Undo");
        }, 1500);
        return;
    }
    if( addShape() ) {
        nextButton.enabled = true;
        undoButton.enabled = true;
    }
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	drawBoard();

	if (gameState === GAME_START_STATE) {
		background(51, 51, 51, 200);
	}

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

    if (key === "B") {
        console.log(board);
    }

    if (key === "N") {
        curSelectedShape = SIMPLE_S;
    }

    if( key === "t" ) {
        // tourner la forme de 90 degres
        turnShape();
    }
    if( key === "r" || key === "f" ) {
        // retourner la forme (miroir)
        flipShape();
    }

    if( key === "P") {
        pointsClicked();
    }
}

