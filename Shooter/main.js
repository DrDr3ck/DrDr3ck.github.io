const uiManager = new UIManager();
const windowWidth = 1440;
const windowHeight = 900;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 300, windowHeight - 100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = null;
const jobManager = null;
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let lastTime = 0;

function preload() {}

function musicClicked() {
	// TODO
}

const FPS = 60;
let world = null;

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [ speakerButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
	spritesheet.addSpriteSheet('world', './sprites.png', 32, 32);

	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

function drawGame() {
	world.draw();
}

function initGame() {
	world = new World();

	// add walls
	world.platforms.push(new Platform(300, windowHeight - 100, 200, 10));
	world.platforms.push(new Platform(100, windowHeight - 200, 200, 20));
	world.platforms.push(new Platform(300, windowHeight - 250, 200, 10));
	world.platforms.push(new Platform(300, windowHeight - 400, 200, 10));
	world.platforms.push(new Platform(300, windowHeight - 550, 200, 10));

	world.walls.push(new Wall(550, 100, 10, windowHeight));
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.maxLoadedSounds === soundManager.maxLoadingSounds &&
		spritesheet.maxLoadedImages === spritesheet.maxLoadingImages
	) {
		curState = GAME_PLAY_STATE; //GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Finish him!!!');
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

	if (keyIsDown(LEFT_ARROW)) {
		if (world.player2.sprite.state !== 'left') {
			world.player2.sprite.playAnimation('left');
			world.player2.vx = -3;
			world.player2.inMove = true;
		}
	} else if (keyIsDown(RIGHT_ARROW)) {
		if (world.player2.sprite.state !== 'right') {
			world.player2.sprite.playAnimation('right');
			world.player2.vx = 3;
			world.player2.inMove = true;
		}
	}

	if (keyIsDown(81)) {
		// Q or 65 A
		if (world.player1.sprite.state !== 'left') {
			world.player1.sprite.playAnimation('left');
			world.player1.vx = -3;
			world.player1.inMove = true;
		}
	} else if (keyIsDown(68)) {
		// D
		if (world.player1.sprite.state !== 'right') {
			world.player1.sprite.playAnimation('right');
			world.player1.vx = 3;
			world.player1.inMove = true;
		}
	}

	if (keyIsDown(UP_ARROW)) {
		// JUMP
		if (!world.player2.inMove) {
			world.player2.vy = -17.5;
			world.player2.inMove = true;
		}
	}
	if (keyIsDown(90)) {
		// Z or 87 W
		// JUMP
		if (!world.player1.inMove) {
			world.player1.vy = -17.5;
			world.player1.inMove = true;
		}
	}

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

	uiManager.draw();
	if (toolManager && toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	if (jobManager) {
		jobManager.draw();
	}

	lastTime = currentTime;
}

/*****/
var haveEvents = 'GamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;

function connecthandler(e) {
  addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad; var d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  var t = document.createElement("h1");
  t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
  d.appendChild(t);
  var b = document.createElement("div");
  b.className = "buttons";
  for (var i=0; i<gamepad.buttons.length; i++) {
    var e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);
  var a = document.createElement("div");
  a.className = "axes";
  for (var i=0; i<gamepad.axes.length; i++) {
    var e = document.createElement("progress");
    e.className = "axis";
    //e.id = "a" + i;
    e.setAttribute("max", "2");
    e.setAttribute("value", "1");
    e.innerHTML = i;
    a.appendChild(e);
  }
  d.appendChild(a);
  document.getElementById("start").style.display = "none";
  document.body.appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }
  for (j in controllers) {
    var controller = controllers[j];
    var d = document.getElementById("controller" + j);
    var buttons = d.getElementsByClassName("button");
    for (var i=0; i<controller.buttons.length; i++) {
      var b = buttons[i];
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      var pct = Math.round(val * 100) + "%"
      b.style.backgroundSize = pct + " " + pct;
      if (pressed) {
        b.className = "button pressed";
      } else {
        b.className = "button";
      }
    }

    var axes = d.getElementsByClassName("axis");
    for (var i=0; i<controller.axes.length; i++) {
      var a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i] + 1);
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addgamepad(gamepads[i]);
      } else {
        controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
if (!haveEvents) {
  setInterval(scangamepads, 500);
}
/*****/

function mouseClicked() {
	if (toolManager) {
		toolManager.mouseClicked();
	}
	uiManager.mouseClicked();
}

function keyPressed() {
	if (key === 'm' || key === 'M') {
		musicClicked();
	}
	if (key === 's' || key === 'S') {
		speakerClicked();
	}
}

function keyReleased() {
	// TODO: check if a key controller of player2 is still down or not
	world.player2.sprite.playAnimation('idle');
	world.player2.vx = 0;

	world.player1.sprite.playAnimation('idle');
	world.player1.vx = 0;
}
