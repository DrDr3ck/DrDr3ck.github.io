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
	constructor(name) {
		this.name = name;
	}

	start() {}

	cancel() {}

	draw() {
		push();
		fill(51);
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		if (tileX >= 0 && tileY >= 0 && tileX < tileMap.ni && tileY < tileMap.nj) {
			rect(tileX * tileSize + 20, tileY * tileSize + 20, tileSize, tileSize);
		}
		pop();
	}
}

class InstallBlockTool extends ToolBase {
	constructor(blockIndex) {
		super('install_block');
		this.blockIndex = blockIndex;
	}

	action() {
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		// check if block is free on this tile
		const tile = tileMap.tiles[tileX][tileY];
		if (tile.back === 0 && tile.front === 0) {
			tile.back = -1;
			jobManager.addJob(new InstallBlockJob(this.blockIndex, tileX, tileY, 5000));
		} else if (tile.front === 0 && tile.back > 0) {
			tile.front = -1;
			jobManager.addJob(new InstallBlockJob(this.blockIndex, tileX, tileY, 5000));
		}
	}
}

class RemoveBlockTool extends ToolBase {
	constructor() {
		super('remove_block');
	}

	action() {
		const tileX = Math.floor((mouseX - 20) / tileSize);
		const tileY = Math.floor((mouseY - 20) / tileSize);
		// check if block is free on this tile
		const tile = tileMap.tiles[tileX][tileY];
		if (tile.front > 0) {
			jobManager.addJob(new RemoveBlockJob(tileX, tileY, 5000));
		} else if (tile.front === 0 && tile.back > 0) {
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
