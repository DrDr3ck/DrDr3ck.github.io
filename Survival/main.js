const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
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

/*****************************/

let curDate = {
	day: 1,
	hour: 0,
	min: 0,
	milli: 0
};

let stock = [
	{ 
		type: "power", 
		value: 10
	},
	{ 
		type: "food",
		value: 10
	},
	{	
		type: "water",
		value: 5
	}
];

const shelterColor = {
	stairs: {r:254,g:72,b:6},
	power: {r:43,g:73,b:64},
	water: {r:119,g:224,b:254},
	food: {r:41,g:216,b:6},
}

let overRoom = null;
let overRobot = null;

const shelter = {
	floors: [
		{
			level: 0,
			rooms: [
				{type: "stairs", position: "0", size: 1, robots: [{name: "R1"}, {name: "R2"}]},
				{type: "power", position: "1", size: 2, curTime:0, maxTime: 10000, robots: []}
			]
		},
		{
			level: 1,
			rooms: [
				{type: "water", position: "-2", size: 2, curTime:0, maxTime: 10000, robots: []},
				{type: "stairs", position: "0", size: 1, robots: [{name: "R3"}, {name: "R4"}]},
				{type: "food", position: "1", size: 2, curTime:0, maxTime: 10000, robots: []}
			]
		}
	]
}

/*****************************/

function preload() {
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/Survival/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

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

	spritesheet.addSpriteSheet('farm_robot', './farm_robot.png', 32, 48);

    frameRate(60);

    lastTime = Date.now();
}

function displayRobot(x,y,robot,index) {
	spritesheet.drawScaledSprite("farm_robot", 0, x+30*index, y, robot.name === overRobot ? 0.9 : 1);
}

function displayTime(x,y,ratio) {
	const radius = 30;
	stroke(0);
	fill(22,80,22);
	circle(x,y,radius);
	fill(44,160,44);
	arc(x,y,radius,radius, -HALF_PI, PI*2*ratio-HALF_PI);
}

function displayDate() {
	stroke(0);
	fill(0);
	rect(5,5,130+10*Math.floor(Math.log10(curDate.day)),30,5);
	fill(220,8,18);
	textSize(20);
	textAlign(LEFT, TOP);
	text(`Day ${curDate.day} - ${curDate.hour < 10 ? '0' : ''}${curDate.hour}:${curDate.min < 10 ? '0' : ''}${curDate.min}`, 10, 10);
}

function displayStock() {
	const food = stock.filter(s=>s.type==="food")[0].value || 0;
	const water = stock.filter(s=>s.type==="water")[0].value || 0;
	const power = stock.filter(s=>s.type==="power")[0].value || 0;
	noStroke();
	fill(0);
	rect(450-5,5,80+10*Math.floor(Math.log10(food)),30,5);
	rect(600-5,5,85+10*Math.floor(Math.log10(water)),30,5);
	rect(750-5,5,90+10*Math.floor(Math.log10(power)),30,5);
	stroke(0);
	fill(22,168,194);
	textSize(20);
	textAlign(LEFT, TOP);
	text(`Food: ${food}`,450,10);
	text(`Water: ${water}`,600,10);
	text(`Power: ${power}`,750,10);
}

const width = 75;
const height = 150;
function displayRoom(room, level) {
	const xRoom = 500+room.position*width;
	const yRoom = 100+level*height;
	const size = room.size;
	
	if( overRoom && overRoom.position === room.position && overRoom.level === level ) {
		strokeWeight(3);
	} else {
		strokeWeight(1);
	}

	fill(shelterColor[room.type].r,shelterColor[room.type].g,shelterColor[room.type].b);
	rect(xRoom,yRoom,width*size,height);

	strokeWeight(1);
	if( room.maxTime ) {
		displayTime(xRoom-30+width*size,yRoom+30,room.curTime/room.maxTime);
	}
	if( room.robots ) {
		room.robots.forEach((robot,index)=>displayRobot(xRoom+5, yRoom+height-50, robot, index));
	}
}

function displayFloor(floor) {
	floor.rooms.forEach(room=>displayRoom(room,floor.level));
}

function displayShelter() {
	shelter.floors.forEach(floor=>displayFloor(floor));
}

function updateGame(elapsedTime) {
	const min = 500;
	curDate.milli += elapsedTime;
	while( curDate.milli > min ) {
		curDate.milli -= min;
		curDate.min += 1;
	}
	if( curDate.min >= 60 ) {
		curDate.min -= 60;
		curDate.hour += 1;
	}
	if( curDate.hour >= 24 ) {
		curDate.hour -= 24;
		curDate.day += 1;
	}

	// update each room
	shelter.floors.forEach(floor=>{
		floor.rooms.forEach(room=>{
			if( room.curTime && room.curTime < room.maxTime ) {
				room.curTime += elapsedTime;
				if( room.curTime > room.maxTime ) {
					// room ready for 'action'
					room.curTime = room.maxTime;
				}
			}
		});
	});
}

function drawGame() {
	displayShelter();
	displayDate();
	displayStock();
}

function initGame() {

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

function isOverRoomPosition(x,y,room,level) {
	const xRoom = 500+room.position*width;
	const yRoom = 100+level*height;
	if( x > xRoom && x < xRoom+width*room.size && y > yRoom && y < yRoom+height ) {
		return true;
	}
	return false;
}

function isOverRobot(x,y,roomPosition,roomLevel,robotIndex) {
	const xRoom = 500+roomPosition*width;
	const yRoom = 100+roomLevel*height;
	const xRobot = xRoom+5+robotIndex*30;
	const yRobot = yRoom+height-50;
	if( x > xRobot && x < xRobot+32 && y > yRobot && y < yRobot+48 ) {
		return true;
	}
	return false;
}

function mouseMoved() {
	overRoom = null;
	overRobot = null;
	shelter.floors.forEach(floor=>{
		floor.rooms.forEach(room=>{
			if( isOverRoomPosition(mouseX, mouseY, room, floor.level) ) {
				overRoom = {level: floor.level, position: room.position}
			}
			if( room.robots ) {
				room.robots.forEach((robot,index)=>{
					if( isOverRobot(mouseX, mouseY, room.position, floor.level, index)) {
						overRobot = robot.name;
					}
				});
			}
		});
	});
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
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