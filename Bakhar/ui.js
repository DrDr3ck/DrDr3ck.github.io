function expect(check, text) {
	if (!check) {
		throw text;
	}
}

class BCraftRecipe extends UIContainer {
	constructor(x, y) {
		const craftSize = 80;
		const maxTile = 4;
		super(x, y, (craftSize + 10) * (maxTile+1) + 10, craftSize + 20);
		this.recipe = [];
		this.craftSize = craftSize;
	}

	setRecipe(recipe) {
		this.recipe = recipe;
	}

	getOver() {
		if (this.over) {
			if (this.components[0].over) {
				return this.components[0];
			}
			return this;
		}
		return null;
	}
	
	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		rect(this.x, this.y, this.w, this.h, 5);
		let x = this.x + 10;
		const y = this.y + 10;
		textSize(12);
		textAlign(CENTER);
		this.recipe.items.forEach(
			item => {
				rect(x, y, this.craftSize, this.craftSize, 5);
				push();
				noStroke();
				drawText(item.name, x + this.craftSize / 2, y + 8);
				drawText(item.count, x + this.craftSize / 2, y + this.craftSize - 8);
				pop();
				x += this.craftSize + 10;
			}
		);
		super.doDraw();
	}
}

class BCraftQueue extends UIContainer {
	constructor(x, y, size) {
		const itemSize = 80;
		super(x, y, (itemSize + 10) * size + 10, itemSize + 20);
		this.maxQueue = size;
		this.itemSize = itemSize;
	}

	addCraft(recipe) {
		uiManager.addLogger(`debug: add recipe ${recipe.description}`);
	}

	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		translate(this.x, this.y);
		rect(0, 0, this.w, this.h, 5);
		this.components.forEach((c) => c.draw());
	}
}
