class Minion extends Sprite {
	constructor(x, y, type) {
		super(x, y);
		this.addAnimation('idle', 'farm_minion', [ 0, 1 ], FPS, true);

		this.initialElapsedTime = 2000; // did an action every 2000 milliseconds
		this.currentElapsedTime = this.initialElapsedTime;
		this.range = 1; // from -1 to 1
		this.level = 1;
		this.type = type; // type of minion: planting carrot, tomate, ...
	}

	update(elapsedTime) {
		super.update(elapsedTime);
		this.currentElapsedTime -= elapsedTime;
		while (this.currentElapsedTime < 0) {
			this.execute();
			this.currentElapsedTime += this.initialElapsedTime;
		}
	}

	isFieldWild(chunk, colChunk, rowChunk) {
		return chunk.tiles[colChunk][rowChunk].foreground.index === 0;
	}

	isFieldPlowed(chunk, colChunk, rowChunk) {
		return chunk.tiles[colChunk][rowChunk].foreground.index === 1;
	}

	isFieldReadyToPlant(chunk, colChunk, rowChunk) {
		return (
			chunk.tiles[colChunk][rowChunk].foreground.index === 2 &&
			chunk.tiles[colChunk][rowChunk - 1].foreground.index < 9
		);
	}

	isPlantReadyToHarvest(chunk, colChunk, rowChunk) {
		return (
			chunk.tiles[colChunk][rowChunk].foreground.index === 2 &&
			[ 12, 16, 24 ].includes(chunk.tiles[colChunk][rowChunk - 1].foreground.index)
		);
	}

	execute() {
		const tilePosition = world.getTilePosition(this.position.x + this.width / 2, this.position.y + this.height / 2);
		console.log(tilePosition);
		const chunk = world.getChunk(tilePosition.column, tilePosition.row);
		const colChunk = world.getColumnPositionInChunk(chunk, tilePosition.column);
		const rowChunk = tilePosition.row + 1; // TODO: check of rowChunk value exists in the tiles

		// check if field is wild (not plowed, non labouré)
		for (let i = -this.range; i <= this.range; i++) {
			if (this.isFieldWild(chunk, colChunk + i, rowChunk)) {
				chunk.tiles[colChunk + i][rowChunk].changeForeground(1);
				chunk.tiles[colChunk + i][rowChunk - 1].changeForeground(8);
				return;
			}
		}
		for (let i = -this.range; i <= this.range; i++) {
			if (this.isFieldPlowed(chunk, colChunk + i, rowChunk)) {
				chunk.tiles[colChunk + i][rowChunk].changeForeground(2);
				chunk.tiles[colChunk + i][rowChunk - 1].changeForeground(8);
				return;
			}
		}

		// check if plowed field needs a seed
		for (let i = -this.range; i <= this.range; i++) {
			if (this.isFieldReadyToPlant(chunk, colChunk + i, rowChunk)) {
				chunk.addPlant(this.type, colChunk + i, rowChunk - 1);
				return;
			}
		}

		// check if a plant is ready to be harvested
		for (let i = -this.range; i <= this.range; i++) {
			if (this.isPlantReadyToHarvest(chunk, colChunk + i, rowChunk)) {
				chunk.tiles[colChunk + i][rowChunk].changeForeground(1);
				chunk.tiles[colChunk + i][rowChunk - 1].changeForeground(8);
				const type = chunk.getPlantType(colChunk + i, rowChunk - 1);
                chunk.removePlantAt(colChunk+i, rowChunk - 1);
				const countedItem = world.inventory.getCountedItem(type, 'vegetable');
				if (countedItem) {
					countedItem.count++;
				}
				return;
			}
		}
	}

	draw() {
		super.draw();
	}
}
