const COLOR = {
	ORANGE: 0,
	BLUE: 1,
	PURPLE: 2,
	GREEN: 3,
	GOLD: 4,
};

const OBJECT = {
	PARCHMENT: 4,
	FEATHER: 5,
	INKWELL: 6,
};

const CARD = {
	RECTO: "recto",
	VERSO: "verso",
};

class Card {
	constructor(color, corners = [null, null, null, null], center = null) {
		this.color = color;
		this.corners = corners;
		this.cost = null;
		this.points = null;
		this.center = center;
		this.verso = {
			corners: [
				{ value: null },
				{ value: null },
				{ value: null },
				{ value: null },
			],
			center: [color],
		};
		this.rectoVerso = CARD.RECTO;
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
		this.center = [center];
	}

	setVerso(corners, center) {
		this.verso.corners = corners;
		this.verso.center = center;
	}

	drawBackground(x, y, scale) {
		spritesheet.drawScaledSprite("background_cards", this.color, x, y, scale);
	}

	drawCorners(corners, x, y, scale) {
		const coordsX = [x, x + (210 - 54) * scale, x, x + (210 - 54) * scale];
		const coordsY = [y, y, y + (140 - 65) * scale, y + (140 - 65) * scale];
		const cornerIndex = this.color * 4;
		corners.forEach((corner, index) => {
			if (!corner) {
				return;
			}
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
				x + ((210 - 70) * scale) / 2,
				y + ((140 - 70) * scale) / 2,
				scale
			);
		}
		fill(190, 170, 125);
		stroke(0);
		strokeWeight(1);
		if (center.length === 2) {
			const X = x + ((210 - 45) * scale) / 2;
			const Y = y + ((140 - 90) * scale) / 2;
			rect(X, Y, 45 * scale, 90 * scale, 5);
			spritesheet.drawScaledSprite("resources", center[0], X, Y, scale);
			spritesheet.drawScaledSprite(
				"resources",
				center[1],
				X,
				Y + 45 * scale,
				scale
			);
		}
		if (center.length === 3) {
			const X = x + ((210 - 45) * scale) / 2;
			const Y = y + ((140 - 135) * scale) / 2;
			rect(X, Y, 45 * scale, 135 * scale, 5);
			spritesheet.drawScaledSprite("resources", center[0], X, Y, scale);
			spritesheet.drawScaledSprite(
				"resources",
				center[1],
				X,
				Y + 45 * scale,
				scale
			);
			spritesheet.drawScaledSprite(
				"resources",
				center[2],
				X,
				Y + 90 * scale,
				scale
			);
		}
	}

	drawPoints(x, y, scale) {
		if (!this.points) {
			return;
		}
		if (this.points === "1") {
			spritesheet.drawScaledSprite(
				"points",
				4,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === "3") {
			spritesheet.drawScaledSprite(
				"points",
				5,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === "5") {
			spritesheet.drawScaledSprite(
				"points",
				6,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === OBJECT.PARCHMENT) {
			spritesheet.drawScaledSprite(
				"points",
				0,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === OBJECT.FEATHER) {
			spritesheet.drawScaledSprite(
				"points",
				1,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === OBJECT.INKWELL) {
			spritesheet.drawScaledSprite(
				"points",
				2,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		} else if (this.points === "2") {
			spritesheet.drawScaledSprite(
				"points",
				3,
				x + ((210 - 70) * scale) / 2,
				y,
				scale
			);
		}
	}

	drawCost(x, y, scale) {
		if (!this.cost) {
			return;
		}
		// draw resources
		fill(196, 196, 100);
		stroke(0);
		strokeWeight(1);
		const nb = this.cost.length;
		let X = x + (210 * scale - nb * 15) / 2;
		let Y = y + 140 * scale - 20;
		rect(X, Y, nb * 15 + 1, 20);
		X += 8;
		Y += 10;
		this.cost.forEach((resource) => {
			if (resource === COLOR.ORANGE) {
				fill(233, 76, 22);
			}
			if (resource === COLOR.GREEN) {
				fill(45, 88, 35);
			}
			if (resource === COLOR.PURPLE) {
				fill(124, 38, 83);
			}
			if (resource === COLOR.BLUE) {
				fill(121, 199, 199);
			}
			ellipse(X, Y, 12);
			X += 15;
		});
		// draw golden border
		this.drawGoldenBorder(x, y, scale);
	}

	drawGoldenBorder(x, y, scale = 1) {
		noFill();
		stroke(250, 250, 0);
		strokeWeight(4);
		rect(x, y, 210 * scale, 140 * scale, 5);
	}

	draw(x, y, scale = 1) {
		if (this.rectoVerso === CARD.RECTO) {
			this.drawRecto(x, y, scale);
		} else {
			this.drawVerso(x, y, scale);
		}
	}

	drawRecto(x, y, scale = 1) {
		this.drawBackground(x, y, scale);
		this.drawCorners(this.corners, x, y, scale);
		this.drawCenter(this.center, x, y, scale);
		this.drawPoints(x, y, scale);
		this.drawCost(x, y, scale);
	}

	drawVerso(x, y, scale = 1) {
		this.drawBackground(x, y, scale);
		this.drawCorners(this.verso.corners, x, y, scale);
		this.drawCenter(this.verso.center, x, y, scale);
		if (this.cost) {
			this.drawGoldenBorder(x, y, scale);
		}
	}
}
