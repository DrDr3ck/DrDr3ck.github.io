class GuidedTour {
	constructor() {
		this.steps = [];
		this.curStep = 0;
	}

	nextStep() {
		if (this.curStep + 1 >= this.steps.length) {
			return;
		}
		if (this.steps[this.curStep].finalizeStep) {
			this.steps[this.curStep].finalizeStep();
		}
		this.curStep++;
		if (this.steps[this.curStep].initStep) {
			this.steps[this.curStep].initStep();
		}
	}

	prevStep() {
		if (this.curStep === 0) {
			return;
		}
		// TODO
		this.curStep--;
	}

	addStep(step) {
		this.steps.push(step);
	}

	draw() {
		this.steps[this.curStep].draw();
	}
}
