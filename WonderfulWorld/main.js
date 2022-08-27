const uiManager = new UIManager();
const windowWidth = 1800;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const soutiens = [
	["financiers"], ["generaux"], ["financiers","generaux"], ["financiers"], ["generaux"]
];

let financiers = 0;
let generaux = 0;

// TODO list
// undo defausse
// handle pions and crystalium
// recycle construction cards

const materiauxCards = [
	0,0,0,0,0,0,
	1,1,1,1,1,
	2,2,2,2,2,
	3,3,3,3,3,3,3,
	4,4,
	5,5,5,5,5,
	6,6,6,6,6,6,6,
	7,7,7,7,7,7,
	8,8,8,8,8,8,8
];
const energieCards = [
	0,0,
	1,1,1,
	2,2,2,2,2,2,2,
	3,3,3,3,
	4,4,4,4,4,4,
	5,5,5,
	6,7,
	8,8,8,8
];
const orCards = [
	0,0,1,1,2,2,3,3,4,4,
	5,5,6,7,8,9,
	10,11,12,12,13,14,
    15,15,16,16,17,18,19
];
const scienceCards = [
	0,1,2,3,4,5,6,7,8,9,
	10,11,12,13,14,15,16,17,18,19,
	20,21,22
];
const explorationCards = [
	0,1,2,3,4,5,
	6,7,8,9,10,11,
	12,13,14,15,16
];

const cards = [];
const gameCards = [];
materiauxCards.forEach(c=>cards.push({type: "materiaux", index: c}));
energieCards.forEach(c=>cards.push({type: "energie", index: c}));
orCards.forEach(c=>cards.push({type: "or", index: c}));
scienceCards.forEach(c=>cards.push({type: "science", index: c}));
explorationCards.forEach(c=>cards.push({type: "exploration", index: c}));

console.log(cards.length);

let hand = [];
let storedHand = [];

let turn = 0;

let cubes = [];

const constructionCards = [];

const empireCards = [];

let empireCubes = 0;
let empireCrystalium = 0;

let selectedCardIndex = -1;
let defausseCard = null;
let overConstructionZone = false;
let overConstructionCardIndex = -1;
let overEmpireZone = false;
let overRecycleZone = false;
let overDefausseZone = false;
let defausseMode = false;

let productionStep = null;
let productionCount = 0;

let corner = {X:0,Y:0};
const spriteSize = {width: 240, height: 365};
let imageNb = 0;

const description = { materiaux: [], energie: [], or: [], science: [], exploration: []};

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_H1_STATE = 2;
const GAME_H2_STATE = 3;
const GAME_PROD_STATE = 4;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function randomInt(i) {
	return Math.floor(Math.random() * i);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 2196, 580);

	spritesheet.addSpriteSheet('cover', './cover.jpg', 1200, 800);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GameEngine/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_H1_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
	turn = 11;
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(1035, 80, "START", startClicked);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

	spritesheet.addSpriteSheet('empires', './empires.png', 370, 230);

	spritesheet.addSpriteSheet('verso', './verso.png', 240, 365);
	spritesheet.addSpriteSheet('materiaux', './materiaux.png', 240, 365);
	spritesheet.addSpriteSheet('energie', './energie.png', 240, 365);
	spritesheet.addSpriteSheet('or', './or.png', 240, 365);
	spritesheet.addSpriteSheet('science', './science.png', 240, 365);
	spritesheet.addSpriteSheet('exploration', './exploration.png', 240, 365);

	spritesheet.addSpriteSheet('pions', './pions.png', 152/2, 75);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const scale = 0.9;

function drawCard(card, X, Y) {
	if( card.type === "none" ) {
		return;
	}
	spritesheet.drawScaledSprite(card.type, card.index, X, Y, scale);
	const cardDesc = description[card.type][card.index];
	if( cardDesc ) {
		// draw cubes to check
		noFill();
		stroke(250);
		const cubesType = [];
		Object.keys(cardDesc.construction).forEach(k=>{for(let i=0; i < cardDesc.construction[k]; i++) {cubesType.push(k);};});
		cubesType.forEach((t,i)=>{
			if( ["financiers", "generaux"].includes(t) ) {
				ellipse(X+5+14,Y+5+31.5*i+14,28,28);
			} else {
				rect(X+5,Y+5+31.5*i,28,28);
			}
		});
		// FOR DEBUG ONLY
		if( cardDesc.bonus ) {
			const bonus = Object.keys(cardDesc.bonus)[0];
			const count = cardDesc.bonus[bonus];
			if( bonus === "financiers" || bonus === "generaux" ) {
				for( let i=0; i < count; i++ ) {
					ellipse(X+5+14+30*i+90-(30*(count-1)/2),Y+5+250+14,28,28);
				}
			} else if( bonus === "crystalium" ) {
				for( let i=0; i < count; i++ ) {
					rect(X+5+30*i+90-(30*(count-1)/2),Y+5+250,28,28);
				}
			}
		}
		// END DEBUG
		if( card.construction ) {
			// draw cube already put in place
			let cubePosition = 0;
			["materiaux","energie","science","or","exploration","crystalium"].forEach(type=>{
				drawCompletedCubes(card, type, X, Y, cubePosition);
				if( card.construction[type] >= 0 ) {
					cubePosition = cubePosition + card.construction[type];
				}
			});
			["financiers","generaux"].forEach(type=>{
				// TODO
			});
		}
	}
}

function drawCompletedCubes(card, type, X, Y, position) {
	if( card.construction[type] > 0 ) {
		let curCompleted = card.construction[`${type}_completed`];
		for( let i=0; i < card.construction[type]; i++ ) {
			if( curCompleted > 0 ) {
				drawCube(type, X+5+15, Y+5+15+31.5*position);
			}
			curCompleted--;
			position++;
		}
	}
}

function computeProduction(prod) {
	if( !prod ) return 0;
	if( Number.isInteger(prod) ) {
		return prod;
	}
	if( prod.startsWith("1x") ) {
		const type = prod.split('1x')[1];
		return empireCards.filter(c=>c.type === type).length;
	}
	return prod;
}

// return the number of cube produced by the empire
function getProductionCube(type) {
	if( type === "materiaux" ) {
		return 2 + empireCards.map(c=>computeProduction(c.production[type])).reduce((a,b)=>a+b,0);
	}
	if( type === "energie" ) {
		return 1 + empireCards.map(c=>computeProduction(c.production[type])).reduce((a,b)=>a+b,0);
	}
	if( type === "science" ) {
		return 1 + empireCards.map(c=>computeProduction(c.production[type])).reduce((a,b)=>a+b,0);
	}
	return empireCards.map(c=>computeProduction(c.production[type])).reduce((a,b)=>a+b,0);
}

function drawCube(curCube, X, Y) {
	if( curCube === "materiaux" ) {
		fill(199,179,148);
	} else if( curCube === "energie" ) {
		fill(18,17,19);
	} else if( curCube === "science" ) {
		fill(148,176,83);
	} else if( curCube === "or" ) {
		fill(241,220,6);
	} else if( curCube === "exploration" ) {
		fill(116,140,173);
	} else {
		// crystalium
		fill(198,67,45);
	}
	rect(X-15,Y-15,28,28,5);
}

const handX = 350
const handDeltaX = 220;
const handY = 665;
const cardWidth = 240*scale;
const cardHeight = 365*scale;

function drawGame() {
	if( overRecycleZone ) {
		fill(150);
		stroke(150);
		rect(350, 5, 1100, 280, 55);
	}
	spritesheet.drawScaledSprite('board', 0, 350, 0, 0.5);

	if( cubes.length > 0 ) {
		push();
		textSize(35);
		fill(250);
		stroke(0);
		// draw number of cubes in each circle
		["materiaux", "energie", "science","or","exploration"].forEach((type,i)=>{
			const nb = cubes.filter(t=>t===type).length;
			text(nb, 440+208*i, 150);
		});
		pop();
	}
	
	if( defausseCard ) {
		drawCard(defausseCard, windowWidth-cardWidth-5, windowHeight-cardHeight-5);
	} else {
		spritesheet.drawScaledSprite('verso', 0, windowWidth-cardWidth-5, windowHeight-cardHeight-5, 0.9);
		text(cards.length, 1600,910);
	}
	if( overDefausseZone ) {
		stroke(250);
		strokeWeight(3);
		rect(windowWidth-cardWidth-5, windowHeight-cardHeight-5, cardWidth, cardHeight, 5);
		strokeWeight(1);
	}

	// main
	hand.forEach((c,i)=>{
		if( i !== selectedCardIndex ) {
			drawCard(c, handX+handDeltaX*i, handY);
		}
	});

	push();
	fill(250);
	stroke(0);
	text(`Turn: ${turn/10}`, 1400, 260);
	pop();
	
	// en cours de construction
	if( overConstructionZone ) {
		fill(150);
		stroke(150);
		strokeWeight(3);
	} else {
		noFill();
		stroke(0);
		strokeWeight(1);
	}
	rect(350, 300, 1400, 360, 25);
	strokeWeight(1);
	if( overConstructionCardIndex >= 0 ) {
		noFill();
		stroke(250);
		if( cubes.length > 0 && !needCube(constructionCards[overConstructionCardIndex], cubes[0]) ) {
			stroke(198,67,45);
		}
		strokeWeight(5);
		rect(350+220*overConstructionCardIndex+10, 300+15, cardWidth, cardHeight, 5);
		strokeWeight(1);
	}
	constructionCards.forEach((c,i)=>drawCard(c, 350+220*i+10, 300+15));

	// empire
	spritesheet.drawScaledSprite('empires', 0, 10, 770, scale);
	push();
	fill(250);
	stroke(0);
	textSize(30);
	if( financiers ) {
		spritesheet.drawSprite('pions', 1, 25, 780);
		text(financiers, 25+30, 780+30);
	}
	if( generaux ) {
		spritesheet.drawSprite('pions', 0, 25, 870);
		text(generaux, 25+30, 870+30);
	}
	pop();
	empireCards.forEach((c,i)=>drawCard(c, 125, 437-35*i));
	if( empireCubes ) {
		push();
		fill(250);
		stroke(0);
		textSize(30);
		text(empireCubes, 230, 890);
		pop();
	}
	if( empireCrystalium ) {
		push();
		stroke(0);
		textSize(30);
		drawCube("crystalium", 200, 925);
		stroke(250);
		text(empireCrystalium, 230, 935);
		pop();
	}

	// draw selected card if any
	if( selectedCardIndex >= 0 ) {
		drawCard(hand[selectedCardIndex], mouseX-cardWidth/2, mouseY-cardHeight/2);
	}

	if( cubes.length > 0 ) {
		drawCube(cubes[0], mouseX, mouseY);
	}
}

function getFullCard(card) {
	const desc = description[card.type][card.index];
	if( !desc ) {
		console.log("no desc for this card", card.type, card.index);
		return {...card};
	}
	const construction = {...desc.construction};
	Object.keys(desc.construction).forEach(key=>{
		construction[`${key}_completed`] = 0;
	});
	return {...card, construction, production: desc.production, recyclage: desc.recyclage, bonus: desc.bonus };
}

// take 5 cards
function fillHand(defausse=false) {
	hand = [];
	if( defausse ) {
		for( let i = 0; i < 5; i++ ) {
			hand.push( getFullCard(cards.pop()) );
		}
	} else if( gameCards.length >= 5 ) {
		for( let i = 0; i < 5; i++ ) {
			hand.push( gameCards.pop() );  
		}
	} else {
		// end of game !! TODO
	}
}

function initGame() {
	shuffleArray(cards);
	for( let i=0; i < 40; i++ ) {
		gameCards.push(getFullCard(cards.pop()));
	}
	fillHand(false);
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

        // init game
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
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
	if( curState === GAME_START_STATE ) {
		fill(250);
		stroke(0);
		textSize(75);
		text("It's a wonderful world", 300, 75);
		spritesheet.drawSprite("cover", 0, (windowWidth-1200)/2, (windowHeight-800)/2);
	}
	if (curState !== GAME_START_STATE) {
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

function mouseMoved() {
	overConstructionZone = false;
	overRecycleZone = false;
	overDefausseZone = false;
	overConstructionCardIndex = -1;
	overEmpireZone = false;
	if( selectedCardIndex >= 0 ) {
		if( mouseX >= 350 && mouseY >= 300 && mouseX <= 350+1400 && mouseY <= 300+360) {
			overConstructionZone = true;
		}
		if( mouseX >= 350 && mouseY >= 5 && mouseX <= 350+1100 && mouseY <= 5+280) {
			overRecycleZone = true;
		}
		if( cards.length >= 5 && mouseX >= windowWidth-cardWidth-5 && mouseY >= windowHeight-cardHeight-5 && mouseX <= windowWidth-5 && mouseY <= windowHeight-5 ) {
			overDefausseZone = true;
		}
	} else if( cubes.length > 0 ) {
		// check if cube is over a construction card
		constructionCards.forEach((c,i)=>{
			// 350+220*i+10, 300+15, cardWidth, cardHeight
			if( mouseX >= 350+220*i+10 && mouseY >= 300+15 && mouseX <= 350+220*i+10+cardWidth && mouseY <= 300+15+cardHeight) {
				overConstructionCardIndex = i;
			}
		});
		// check if cube is over the Empire
		if( mouseX >= 10 && mouseY >= 770 && mouseX <= 10+370 && mouseY <= 770+230) {
			overEmpireZone = true;
		}
	}
}

function storeHand() {
	storedHand = hand.filter(c=>c.type !== "none").map(c=>{return {...c};});
}

function restoreHand() {
	hand = storedHand.map(c=>{return {...c};});
}

function addCardToHand(card) {
	hand.push({...card});
}

function addCube(cardIndex, curCube) {
	const card = constructionCards[cardIndex];
	const completed = `${curCube}_completed`;
	card.construction[completed] = card.construction[completed] + 1;
	// check if card is fully built
	let built = true;
	Object.keys(card.construction).forEach(
		c=>{
			if( c.endsWith("completed") ) {
				return;
			}
			if( card.construction[c] > card.construction[`${c}_completed`]) {
				built = false;
			}
		}
	);
	if( built ) {
		// store card on empire and remove it from construction zone
		if( card.bonus ) {
			addBonus(card.bonus);
		}
		empireCards.push(card);
		constructionCards.splice(cardIndex, 1);
		overConstructionCardIndex = -1;
	}
}

function addBonus(bonus) {
	if( bonus.financiers ) {
		financiers+=bonus.financiers;
	}
	if( bonus.generaux ) {
		generaux+=bonus.generaux;
	}
	if( bonus.crystalium ) {
		empireCrystalium+=bonus.crystalium;
	}
}

function needCube(card, curCube) {
	const type = card.construction[curCube];
	if( type > 0 && type > card.construction[`${curCube}_completed`] ) {
		return true;
	}
	return false;
}

function addCubeOnEmpire() {
	empireCubes++;
	if( empireCubes === 5 ) {
		empireCubes = 0;
		empireCrystalium++;
	}
}

function nextProductionStep(step) {
	if( step === "exploration" ) {
		return null;
	}
	if( step === "or" ) {
		return "exploration";
	}
	if( step === "science" ) {
		return "or";
	}
	if( step === "energie" ) {
		return "science";
	}
	if( step === "materiaux" ) {
		return "energie";
	}
}

function closeCurrentDialog() {
	uiManager.setDialog(null);
	nextProduction();
}

function popupDialog() {
	const dialog = new Dialog(720, 580, 100, 200);
	dialog.startX = 300 + 200;
	dialog.startY = 700 - 150;
	dialog.components.push(new BFloatingButton(14, 180, '\u2716', closeCurrentDialog));
	uiManager.setDialog(dialog);
}

function nextProduction() {
	productionStep = nextProductionStep(productionStep);
	if( !productionStep ) {
		curState = GAME_H1_STATE;
		fillHand(false);
		turn = floor(turn/10)*10+11;
	} else {
		productionCount = getProductionCube(productionStep);
		if( productionCount > 0 ) {
			cubes = Array(productionCount).fill(productionStep);
		} else {
			// TODO: if no cube for this step ?
			popupDialog();
		}
	}
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( cubes.length > 0 ) {
		// check if cube can be drop here...
		if( overConstructionCardIndex >= 0 ) {
			const curCard = constructionCards[overConstructionCardIndex];
			if( needCube(curCard, cubes[0]) ) {
				addCube(overConstructionCardIndex, cubes[0]);
				cubes.splice(0,1);
			}
		}
		if( overEmpireZone ) {
			addCubeOnEmpire();
			cubes.splice(0,1);
		}
		if( cubes.length === 0 ) { // cube has been dropped
			// check if we are in production stage
			if( productionStep ) {
				// next type of cube !
				nextProduction();
			}
		}
	} else if( selectedCardIndex === -1 ) {
		hand.forEach((c,i)=>{
			if( c.type === "none" ) {
				return;
			}
			const cX = handX+handDeltaX*i;
			const cY = handY;
			if( mouseX > cX && mouseX < cX+cardWidth && mouseY > cY && mouseY < cY+cardHeight ) {
				if( defausseMode ) {
					// add the selected card to the hand and remove other cards
					const newCard = {...hand[i]};
					restoreHand();
					addCardToHand(newCard);
					defausseMode = false;
				} else {
					selectedCardIndex = i;
				}
			}
		});
	} else {
		if( overConstructionZone ) {
			const selectedCard = hand[selectedCardIndex];
			constructionCards.push({...selectedCard});
			selectedCard.type = "none";
		}
		if( overRecycleZone ) {
			const selectedCard = hand[selectedCardIndex];
			selectedCard.type = "none";
			cubes.push(selectedCard.recyclage);
		}
		if( overDefausseZone ) {
			const selectedCard = hand[selectedCardIndex];
			if( defausseCard ) {
				defausseCard = null;
				selectedCard.type = "none";
				// store hand
				storeHand();
				fillHand(true);
				defausseMode = true;
			} else {
				defausseCard = {...selectedCard};
			}
			selectedCard.type = "none";
		}
		selectedCardIndex = -1;
	}
	if( cubes.length === 0 && selectedCardIndex === -1 && curState !== GAME_PROD_STATE ) {
		if( hand.every(c=>c.type === "none") ) {
			if( curState === GAME_H1_STATE ) {
				curState = GAME_H2_STATE;
				turn += 1;
				fillHand(false);
			} else {
				curState = GAME_PROD_STATE;
				productionStep = "materiaux";
				productionCount = getProductionCube(productionStep);
				if( productionCount > 0 ) {
					cubes = Array(productionCount).fill(productionStep);
				}
			}
		}
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if( key === "a" ) {
		// to do
		corner = {X: mouseX, Y: mouseY};
	}
	if( key === "c" ) {
		// copy image
		copy(corner.X, corner.Y, spriteSize.width, spriteSize.height, spriteSize.width*imageNb, 0, spriteSize.width, spriteSize.height);
		imageNb = imageNb + 1;
	}
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}

// description des cartes
function addDescriptionCard(type, title, count, construction, production, recyclage, bonus=null) {
	description[type].push({title, count, construction, production, recyclage, bonus});
}

addDescriptionCard("materiaux", "Base Militaire", 6, {materiaux: 3, energie: 1}, {materiaux: "1xmateriaux", science: 1}, "materiaux", {generaux: 1});
addDescriptionCard("materiaux", "Centrale Nucléaire", 5, {materiaux: 4, science: 1}, {energie: 3}, "energie");
addDescriptionCard("materiaux", "Place Financière", 5, {materiaux: 4, energie: 1}, {or: 2}, "or", {financiers: 1});
addDescriptionCard("materiaux", "Centre de Recherche", 7, {materiaux: 3, energie: 1}, {science: 2}, "science");
addDescriptionCard("materiaux", "Réseau de Transport", 2, {materiaux: 3}, {}, "materiaux");
addDescriptionCard("materiaux", "Plate-Forme Pétrolière", 5, {materiaux: 3, exploration: 1}, {energie: 1, or: 1}, "energie", {financiers: 1});
addDescriptionCard("materiaux", "Usine de Recyclage", 7, {materiaux: 2}, {materiaux: 2}, "materiaux");
addDescriptionCard("materiaux", "Complexe Industriel", 6, {materiaux: 3, energie: 1}, {materiaux: 1, or: 1}, "or", {financiers: 1});
addDescriptionCard("materiaux", "Eoliennes", 7, {materiaux: 2}, {energie: 1}, "energie");

addDescriptionCard("energie", "Escadrille de Soucoupes", 2, {energie: 3, science: 2}, {exploration: 3}, "science");
addDescriptionCard("energie", "Sous-Marin", 3, {materiaux: 2, energie: 3}, {exploration: 2}, "materiaux", {generaux: 1});
addDescriptionCard("energie", "Division de Chars", 7, {materiaux: 1, energie: 2}, {exploration: 1}, "materiaux", {generaux: 1});
addDescriptionCard("energie", "Brise-Glace", 4, {energie: 3, science: 1}, {exploration: 2}, "exploration");
addDescriptionCard("energie", "Zeppelin", 6, {energie: 2}, {exploration: 1}, "exploration");
addDescriptionCard("energie", "Laboratoire Aéroporté", 3, {energie: 3}, {science: 1, exploration: 1}, "science");
addDescriptionCard("energie", "Juggernaut", 1, {materiaux: 3, energie: 3, crystalium: 1}, {exploration: 2}, "materiaux", {generaux: 2});
addDescriptionCard("energie", "Porte-Avions", 1, {materiaux: 3, energie: 4}, {exploration: "1xenergie"}, "materiaux", {generaux: 2});
addDescriptionCard("energie", "Méga-Foreuse", 4, {materiaux: 1, energie: 2}, {materiaux: 1, exploration: 1}, "materiaux");

addDescriptionCard("or", "Laboratoire Secret", 2, {materiaux: 2, or: 3}, {science: 2}, "science", {crystalium: 1});
addDescriptionCard("or", "Zone Portuaire", 2, {or: 5}, {materiaux: 2, or: 2}, "or", {financiers: 2});
addDescriptionCard("or", "Ville Souterraine", 2, {materiaux: 3, or: 3}, {materiaux: 2, energie: 2}, "energie", {crystalium: 1});
addDescriptionCard("or", "Agence d'Espionnage", 2, {energie: 2, or: 2}, {exploration: 2}, "exploration");
addDescriptionCard("or", "Ville Sous-Marine", 2, {energie: 2, science: 1, or: 2}, {science: 1, exploration: 2}, "exploration");
addDescriptionCard("or", "Ville-Casino", 2, {energie: 3, or: 4}, {or: 2}, "or");
addDescriptionCard("or", "Université", 1, {science: 1, or: 2}, {science: "1xor"}, "science");
addDescriptionCard("or", "Base Polaire", 1, {energie: 3, or: 4}, {exploration: 3}, "exploration", {generaux: 1});
addDescriptionCard("or", "Base Lunaire", 1, {energie: 2, science: 2, or: 2, crystalium: 1}, {}, "exploration", {generaux: 2});
addDescriptionCard("or", "Barrage Géant", 1, {materiaux: 3, or: 2}, {energie: 4}, "energie");
addDescriptionCard("or", "Exposition Universelle", 1, {or: 3, financier: 2}, {}, "or");
addDescriptionCard("or", "Monument National", 1, {materiaux: 5, or: 3}, {}, "or");
addDescriptionCard("or", "Société Secrète", 2, {or: 3, crystalium: 1}, {}, "or");
addDescriptionCard("or", "Tour Géante", 1, {materiaux: 2, or: 3, financier: 1}, {}, "or");
addDescriptionCard("or", "Canon Solaire", 1, {energie: 2, science: 1, or: 3}, {}, "energie", {generaux: 1});
addDescriptionCard("or", "Centre de Propagande", 2, {or: 3}, {or: "1xor"}, "or", {generaux: 1});
addDescriptionCard("or", "Musée", 2, {or: 3}, {}, "exploration");
addDescriptionCard("or", "Train Magnétique", 1, {energie: 1, science: 1, or: 3}, {or: "1xmateriaux"}, "or", {financiers: 2});
addDescriptionCard("or", "Ascenseur Spatial", 1, {energie: 3, science: 1, or: 2}, {}, "energie", {financiers: 1});
addDescriptionCard("or", "Congrès Mondial", 1, {or: 6, financier: 2}, {}, "or");

addDescriptionCard("science", "Clonage Humain", 1, {science: 2, or: 1}, {or: 1}, "or", {financiers: 1});
addDescriptionCard("science", "Téléportation", 1, {science: 8}, {}, "exploration", {crystalium: 2});
addDescriptionCard("science", "Animorphes", 1, {energie: 1, science: 2}, {materiaux: 1}, "energie", {generaux: 1});
addDescriptionCard("science", "Super-Sonar", 1, {science: 4}, {exploration: "1xenergie"}, "exploration");
addDescriptionCard("science", "Aquaculture", 1, {science: 4, or: 2}, {}, "science", {financiers: 1});
addDescriptionCard("science", "Contrôle du Climat", 1, {science: 5}, {energie: 2, or: 1}, "energie");
addDescriptionCard("science", "Super Calculateur", 1, {science: 4}, {science: 1}, "science");
addDescriptionCard("science", "Neuroscience", 1, {science: 3}, {science: "1xscience"}, "science");
addDescriptionCard("science", "Transmutation", 1, {science: 3, or: 2}, {or: 3}, "or", {crystalium: 1});
addDescriptionCard("science", "Cryogénisation", 1, {science: 7}, {}, "or", {financiers: 1});
addDescriptionCard("science", "Automates de Contrôle", 1, {science: 4, or: 1}, {}, "or");
addDescriptionCard("science", "Inverseur de Gravité", 1, {energie: 1, science: 4, crystalium: 1}, {}, "science", {financiers: 1});
addDescriptionCard("science", "Réalité Virtuelle", 1, {science: 5}, {or: "1xscience"}, "or");
addDescriptionCard("science", "Robots de Compagnie", 1, {science: 3}, {materiaux: "1xmateriaux"}, "materiaux");
addDescriptionCard("science", "Greffes Bioniques", 1, {science: 5}, {materiaux: 2}, "materiaux", {generaux: 1});
addDescriptionCard("science", "Générateur Quantique", 1, {science: 5}, {energie: 3}, "energie");
addDescriptionCard("science", "Méga-Bombe", 1, {energie: 2, science: 2}, {}, "energie", {generaux: 2});
addDescriptionCard("science", "Amélioration Génétique", 1, {science: 4}, {}, "science", {financiers: 2});
addDescriptionCard("science", "Super-Soldats", 1, {science: 7}, {}, "exploration", {generaux: 1});
addDescriptionCard("science", "Satellites", 1, {energie: 2, science: 4}, {exploration: 2}, "exploration", {generaux: 1});
addDescriptionCard("science", "Technologie Inconnue", 1, {science: 7, crystalium: 1}, {}, "science");
addDescriptionCard("science", "Voyage Temporel", 1, {science: 5, crystalium: 3}, {}, "exploration");
addDescriptionCard("science", "Vaccin Universel", 1, {science: 3}, {}, "or");

addDescriptionCard("exploration", "Ile d'Avalon", 1, {exploration: 5}, {science: 1}, "science");
addDescriptionCard("exploration", "Dimension Parallèle", 1, {science:3, exploration: 4, generaux: 1}, {}, "exploration", {crystalium: 3});
addDescriptionCard("exploration", "Trésor de Barbe Noire", 1, {exploration: 3}, {or: 1, exploration: 1}, "or");
addDescriptionCard("exploration", "Continent Perdu de Mu", 1, {exploration: 6}, {or: 1}, "or", {crystalium: 2});
addDescriptionCard("exploration", "Roswell", 1, {exploration: 6}, {science: 1}, "science", {generaux: 1});
addDescriptionCard("exploration", "Tombeau d'Alexandre", 1, {exploration: 7}, {}, "or", {generaux: 2});
addDescriptionCard("exploration", "Atlantide", 1, {exploration: 7, crystalium: 1}, {}, "or");
addDescriptionCard("exploration", "Mines du Roi Salomon", 1, {exploration: 4}, {or: "1xmateriaux"}, "or");
addDescriptionCard("exploration", "Cité d'Agartha", 1, {exploration: 4, crystalium: 1}, {exploration: 2}, "exploration");
addDescriptionCard("exploration", "Fontaine de Jouvence", 1, {exploration: 7}, {}, "energie", {crystalium: 3});
addDescriptionCard("exploration", "Jardin des Hespérides", 1, {exploration: 5}, {}, "exploration");
addDescriptionCard("exploration", "Cités d'Or", 1, {exploration: 4}, {or: 3}, "or");
addDescriptionCard("exploration", "Centre de la Terre", 1, {exploration: 5, generaux: 2}, {}, "exploration");
addDescriptionCard("exploration", "Trésor des Templiers", 1, {exploration: 5}, {or: 2}, "or", {crystalium: 2});
addDescriptionCard("exploration", "Arche d'Alliance", 1, {exploration: 4}, {}, "exploration", {crystalium: 1});
addDescriptionCard("exploration", "Anciens Astronautes", 1, {exploration: 6, generaux: 1}, {science: "1xexploration"}, "science", {crystalium: 2});
addDescriptionCard("exploration", "Triangle des Bermudes", 1, {exploration: 4}, {science: 1}, "science", {crystalium: 1});
