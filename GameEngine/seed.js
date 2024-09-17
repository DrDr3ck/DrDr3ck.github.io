class Seed {
	constructor(fct) {
		if (Seed._instance) {
			return Seed._instance;
		}
		Seed._instance = this;
		Seed.fct = fct;
		Seed.seed = "101";
	}

	// style: {textSize: 32, label: "Name"}
	render(x, y, style) {
		textAlign(TOP, LEFT);
		if (style.textSize) {
			textSize(textSize);
		}
		if (style.color) {
			fill(style.color);
		}
		if (style.label) {
			text(`${style.label}: ${Seed.seed}`, x, y);
		} else {
			text(Seed.seed, x, y);
		}
	}

	// style: {textSize: 32, w: 200}
	getResetButton(x, y, style) {
		const resetSeedButton = new BButton(x, y, "Reset seed", this.resetSeed);
		if (style.textSize) {
			resetSeedButton.setTextSize(style.textSize);
		}
		if (style.width) {
			resetSeedButton.w = style.width;
		}
		this.resetSeed();
		return resetSeedButton;
	}

	resetSeed() {
		console.log("resetseed");
		if (Seed.fct) {
			Seed.seed = Seed.fct();
		} else {
			Seed.seed = "101";
		}
	}

	setGenerator(fct) {
		Seed.fct = fct;
	}
}
