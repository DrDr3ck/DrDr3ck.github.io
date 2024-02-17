const COLOR = {
	ORANGE: 0,
	BLUE: 1,
	PURPLE: 2,
	GREEN: 3,
};

const OBJECT = {
	PARCHMENT: 4,
	FEATHER: 5,
	FLASK: 6,
};

class Card {
	constructor(color) {
		this.color = color;
		this.corners = [null, null, null, null];
		this.cost = null;
		this.points = null;
		this.center = null;
		this.verso = {
			corners: [
				{ value: null },
				{ value: null },
				{ value: null },
				{ value: null },
			],
			center: [color],
		};
	}

	color() {
		return this.color;
	}

	setCorners(topLeft, topRight, bottomLeft, bottomRight) {
		this.corners = [topLeft, topRight, bottomLeft, bottomRight];
	}

	setCost(cost) {
		this.cost = cost;
	}

	setPoints(points) {
		this.points = points;
	}

	setCenter(center) {
		this.center = center;
	}

	setVerso(corners, center) {
		this.verso.corners = corners;
		this.verso.center = center;
	}

	drawBackground(x, y, scale) {
		spritesheet.drawScaledSprite("background_cards", this.color, x, y, scale);
	}

	drawCorners(corners, x, y, scale) {
		const coordsX = [x, x + 210 - 54, x, x + 210 - 54];
		const coordsY = [y, y, y + 140 - 65, y + 140 - 65];
		const cornerIndex = this.color * 4;
		corners.forEach((corner, index) => {
			if (!corner) {
				return;
			}
			//console.log(corner);
			spritesheet.drawScaledSprite(
				"corners",
				cornerIndex + index,
				coordsX[index],
				coordsY[index],
				scale
			);
			this.drawResource(
				corner.value,
				index,
				coordsX[index],
				coordsY[index],
				scale
			);
		});
	}

	drawResource(resourceIndex, cornerIndex, x, y, scale) {
		if (resourceIndex === null) {
			return;
		}
		if (resourceIndex > 3) {
			spritesheet.drawScaledSprite(
				"objects",
				resourceIndex - 4,
				cornerIndex % 2 ? x + 8 : x + 2,
				cornerIndex < 2 ? y + 8 : y + 14,
				scale
			);
		} else {
			spritesheet.drawScaledSprite(
				"resources",
				resourceIndex,
				cornerIndex % 2 ? x + 8 : x + 2,
				cornerIndex < 2 ? y + 8 : y + 14,
				scale
			);
		}
	}

	drawCenter(center, x, y, scale) {
		if (!center) {
			return;
		}
		if (center.length === 1) {
			spritesheet.drawScaledSprite(
				"centers",
				center[0],
				x + (210 - 70) / 2,
				y + (140 - 70) / 2,
				scale
			);
		}
		if (center.length === 2) {
			// TODO
		}
		if (center.length === 3) {
			// TODO
		}
	}

	drawPoints(x, y, scale) {
		if (!this.points) {
			return;
		}
		if (this.points === "1") {
			spritesheet.drawScaledSprite("points", 4, x + (210 - 70) / 2, y, scale);
		} else if (this.points === "3") {
			spritesheet.drawScaledSprite("points", 5, x + (210 - 70) / 2, y, scale);
		} else if (this.points === "5") {
			spritesheet.drawScaledSprite("points", 6, x + (210 - 70) / 2, y, scale);
		} else if (this.points === OBJECT.PARCHMENT) {
			spritesheet.drawScaledSprite("points", 0, x + (210 - 70) / 2, y, scale);
		} else if (this.points === OBJECT.FEATHER) {
			spritesheet.drawScaledSprite("points", 1, x + (210 - 70) / 2, y, scale);
		} else if (this.points === OBJECT.FLASK) {
			spritesheet.drawScaledSprite("points", 2, x + (210 - 70) / 2, y, scale);
		} else if (this.points === "corner") {
			spritesheet.drawScaledSprite("points", 3, x + (210 - 70) / 2, y, scale);
		}
	}

	draw(x, y, scale = 1) {
		this.drawBackground(x, y, scale);
		this.drawCorners(this.corners, x, y, scale);
		this.drawCenter(this.center, x, y, scale);
		this.drawPoints(x, y, scale);
	}

	drawVerso(x, y, scale) {
		this.drawBackground(x, y, scale);
		this.drawCorners(this.verso.corners, x, y, scale);
		this.drawCenter(this.verso.center, x, y, scale);
	}
}
