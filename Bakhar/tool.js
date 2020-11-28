class ToolManager {
	constructor() {
		this.currentTool = null;
	}

	setTool(tool) {
		if (this.currentTool) {
			this.currentTool.cancel();
		}
		this.currentTool = tool;
		if (this.currentTool) {
			this.currentTool.start();
		}
	}

	mouseClicked() {
		if (!this.currentTool) return;
		this.currentTool.action();
	}
}

class ToolBase {
	constructor(name, sizeX, sizeY) {
		this.name = name;
		this.size = { x: sizeX, y: sizeY };
		this.fill = { r: 51, g: 51, b: 51, a: 255 };
	}
	
	start() { }
	
	cancel() { }
	
	draw() {
		push();
		fill(this.fill.r, this.fill.g, this.fill.b, this.fill.a);
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		if (tileX >= 0 && tileY >= 0 && tileX < tileMap.ni && tileY < tileMap.nj) {
			rect(tileX * tileSize + 20, tileY * tileSize + 20, tileSize * this.size.x, tileSize * this.size.y);
		}
		pop();
	}
}

class InstallTool extends ToolBase {
	constructor(type, blockIndex) {
		super(`install_${type}`, 1, 1);
		this.blockIndex = blockIndex;
		this.type = type;
		if (type === "structure") {
			this.size.y = 2;
		}
	}
	
	action() {
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		// check if block is free on this tile
		const tile = tileMap.tiles[tileX][tileY];
		if (!tile) { return; }
		if (this.type === 'block') {
			if (tile.isFree()) {
				tile.backInUse();
				uiManager.addLogger(`Adding back ${this.type}`);
				jobManager.addJob(new InstallBlockJob(this.blockIndex, tileX, tileY, 5000));
			} else if (tile.isFrontFree()) {
				tile.frontInUse();
				uiManager.addLogger(`Adding front ${this.type}`);
				jobManager.addJob(new InstallBlockJob(this.blockIndex, tileX, tileY, 5000));
			}
		} else if (this.type === 'structure') {
			if (tile.isStructureFree()) {
				uiManager.addLogger(`TODO: Adding front ${this.type}`);
			}
		}
	}
}

class RemoveBlockTool extends ToolBase {
	constructor() {
		super('remove_block', 1, 1);
		this.fill = { r: 151, g: 51, b: 51, a: 128 };
	}
	
	action() {
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		// check if block is free on this tile
		const tile = tileMap.tiles[tileX][tileY];
		if (tile.front > 0) {
			uiManager.addLogger("Removing front block");
			jobManager.addJob(new RemoveBlockJob(tileX, tileY, 5000));
		} else if (tile.front === 0 && tile.back > 0) {
			uiManager.addLogger("Removing back block");
			jobManager.addJob(new RemoveBlockJob(tileX, tileY, 5000));
		}
	}
}

function test() {
	const testTM = new ToolManager();
	expect(testTM.currentTool === null, 'error in ToolManager constructor');
	testTM.setTool(new ToolBase('myTool'));
	expect(testTM.currentTool !== null, 'error in setTool');
	expect(testTM.currentTool.name === 'myTool', 'error in ToolBase constructor');
	testTM.setTool(null);
	expect(testTM.currentTool === null, 'error in setTool');
}

test();
