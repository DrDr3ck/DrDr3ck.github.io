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
	}
}
