const startRoom = [ '#' ];
const squareRoom = [ '##', '##' ];
const corridorHRoom = [ '##' ];
const corridorVRoom = [ '#', '#' ];
const LRoom = [ '##', '# ' ];

const neighborDeltas = [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ 0, 1 ] ];

class TinyLevel {
	constructor() {
		const mapWidth = 20;
		const mapHeight = 20;
		this.map = [];
		for (let i = 0; i < mapHeight; i++) {
			this.map.push([]);
			for (let j = 0; j < mapWidth; j++) {
				this.map[i].push(' ');
			}
		}
		this.first = true;
	}

	getValue(row, col) {
		if (row < 0 || row >= this.map.length) {
			return 0;
		}
		if (col < 0 || col >= this.map[0].length) {
			return 0;
		}
		return this.map[row][col];
	}

	isFreeSpot(row, col) {
		if (row < 0 || row >= this.map.length) {
			return false;
		}
		if (col < 0 || col >= this.map[0].length) {
			return false;
		}
		return this.map[row][col] === ' ';
	}

	/**
     * Gets list of room indices next to given spots
     */
	getRoomIndices(spots) {
		const indices = [];
		const curRoomIndex = this.map[spots[0].i][spots[0].j];
		spots.forEach((spot) => {
			neighborDeltas.forEach((delta) => {
				const i = spot.i + delta[0];
				const j = spot.j + delta[1];
				const val = this.getValue(i, j);
				if (val !== 0 && val !== ' ' && val !== curRoomIndex && !indices.includes(val)) {
					indices.push(val);
				}
			});
		});
		return indices;
	}

	getSpotsOfIndex(index) {
		const spots = [];
		for (let r = 0; r < this.map.length; r++) {
			for (let c = 0; c < this.map[0].length; c++) {
				if (this.map[r][c] === index) {
					spots.push({ i: r, j: c });
				}
			}
		}
		return spots;
	}

	getFreeSpots() {
		const spots = [];
		for (let r = 0; r < this.map.length; r++) {
			for (let c = 0; c < this.map[0].length; c++) {
				// this is a room number
				if (!this.isFreeSpot(r, c)) {
					neighborDeltas.forEach((delta) => {
						if (this.isFreeSpot(r + delta[0], c + delta[1])) {
							spots.push({ i: r + delta[0], j: c + delta[1] });
						}
					});
				}
			}
		}
		return spots;
	}

	canStoreRoom(spot, room) {
		let check = true;
		room.forEach((str, i) => {
			const r = str.split('');
			r.forEach((c, j) => {
				if (!this.isFreeSpot(i + spot.i, j + spot.j)) {
					check = false;
				}
			});
		});
		return check;
	}

	storeRoom(spot, room, index) {
		room.forEach((str, i) => {
			const r = str.split('');
			r.forEach((c, j) => {
				if (c === '#') {
					this.map[i + spot.i][j + spot.j] = index;
				}
			});
		});
	}

	addRoom(room, index) {
		if (this.first) {
			// first room
			this.storeRoom({ i: 10, j: 10 }, room, index);
			this.first = false;
		} else {
			// get all free spot
			const spots = this.getFreeSpots();
			// randomize spots
			spots.sort((a, b) => 0.5 - Math.random());
			spots.every((spot) => {
				// check if current room can be put at current spot
				if (this.canStoreRoom(spot, room)) {
					// if yes, do it and returns false
					this.storeRoom(spot, room, index);
					return false;
				}
				// otherwise return true to test next element
				return true;
			});
		}
	}
}

class MazeGenerator {
	/**
     * Creates a level and returns a list of rooms in ascii format
     */
	static createLevel() {
		const level = new TinyLevel();
		const tinyRooms = [];
		tinyRooms.push(MazeGenerator.createTinyRoom(true));
		level.addRoom(tinyRooms[0], tinyRooms.length);
		while (tinyRooms.length !== 5) {
			const tinyRoom = MazeGenerator.createTinyRoom();
			tinyRooms.push(tinyRoom);
			level.addRoom(tinyRoom, tinyRooms.length);
		}
		console.log('Map:', level.map);

		const rooms = [];
		tinyRooms.forEach((room, i) => rooms.push(MazeGenerator.createRoomFromTinyRoom(room, i + 1, level)));
		return rooms;
	}

	static createTinyRoom(start = false) {
		if (start) {
			return startRoom;
		}
		const r = random();
		if (r > 0.5) {
			return squareRoom;
		}
		if (r > 0.3) {
			return corridorHRoom;
		}
		if (r > 0.1) {
			return corridorVRoom;
		}
		return LRoom;
	}

	static createRoomFromTinyRoom(tinyRoom, index, level) {
		let room = [];
		console.log('tinyRoom:', tinyRoom);
		if (tinyRoom.length === 1 && tinyRoom[0].length === 1) {
			// first room
			room = [ 'XXXXX', 'X   X', 'X   X', 'X   X', 'XXXXX' ];
		} else if (tinyRoom.length === 2 && tinyRoom[0].length === 1) {
			// corridorVRoom
			room.push('XXXXX');
			for (let i = 0; i < 9; i++) {
				room.push('X   X');
			}
			room.push('XXXXX');
		} else if (tinyRoom.length === 1 && tinyRoom[0].length === 2) {
			// corridorHRoom
			room.push('XXXXXXXXXXX');
			for (let i = 0; i < 3; i++) {
				room.push('X         X');
			}
			room.push('XXXXXXXXXXX');
		} else if ((tinyRoom.length === 2 && tinyRoom[0].includes(' ')) || tinyRoom[1].includes(' ')) {
			// L shape
			room.push('XXXXXXXXXXX');
			for (let i = 0; i < 4; i++) {
				room.push('X         X');
			}
			for (let i = 0; i < 5; i++) {
				room.push('X   XXXXXXX');
			}
			room.push('XXXXXXXXXXX');
		} else {
			// square
			room.push('XXXXXXXXXXX');
			for (let i = 0; i < 9; i++) {
				room.push('X         X');
			}
			room.push('XXXXXXXXXXX');
		}
		console.log('createRoom:', room);
		// add door access
		const spotsRoom = level.getSpotsOfIndex(index);
		const roomIndices = level.getRoomIndices(spotsRoom);
		const spotReference = spotsRoom[0];
		roomIndices.forEach((roomIndex) => {
			const spotsOtherRoom = level.getSpotsOfIndex(roomIndex);
			// find wall(s) between spotsRoom and spotsOtherRoom
			const walls = [];
			spotsRoom.forEach((spot) => {
				neighborDeltas.forEach((delta) => {
					const i = spot.i + delta[0];
					const j = spot.j + delta[1];
					const spotIndex = spotsOtherRoom.findIndex((curSpot) => curSpot.i === i && curSpot.j === j);
					if (spotIndex !== -1) {
						walls.push({
							from: { i: spot.i - spotReference.i, j: spot.j - spotReference.j },
							to: { i: i - spotReference.i, j: j - spotReference.j }
						});
					}
				});
			});
			console.log('walls(', index, ',', roomIndex, '):', walls);

			function getLastRow(column) {
				for( let i=room.length-1; i > 0; i-- ) {
					console.log(i-1);
					if( room[i-1].charAt(column) === " ") {
						return i;
					}
				}
				// should not happen
				return room.length - 1;
			}

			function getLastColumn(row) {
				return room[0].length - 1;
			}

			// add a door on room with its neighbor
			if (walls[0].from.i === 0 && walls[0].from.j === 0) {
				if (walls[0].to.i === 0 && walls[0].to.j === 1) {
					const lastColumn = getLastColumn(2);
					room[2] = room[2].replaceAt(lastColumn, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === 1 && walls[0].to.j === 0) {
					const lastRow = getLastRow(2);
					room[lastRow] = room[lastRow].replaceAt(2, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === -1 && walls[0].to.j === 0) {
					room[0] = room[0].replaceAt(2, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === 0 && walls[0].to.j === -1) {
					room[2] = room[2].replaceAt(0, ' '); // 1 or 2 or 3
				}
			}
			if (walls[0].from.i === 0 && walls[0].from.j === 1) {
				if (walls[0].to.i === 0 && walls[0].to.j === 2) {
					const lastColumn = getLastColumn(2);
					room[2] = room[2].replaceAt(lastColumn, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === -1 && walls[0].to.j === 1) {
					room[0] = room[0].replaceAt(8, ' '); // 7 or 8 or 9
				} else if (walls[0].to.i === 1 && walls[0].to.j === 1) {
					const lastRow = getLastRow(8);
					room[lastRow] = room[lastRow].replaceAt(8, ' '); // 7 8 9
				}
			}
			if (walls[0].from.i === 1 && walls[0].from.j === 0) {
				if (walls[0].to.i === 2 && walls[0].to.j === 0) {
					const lastRow = getLastRow(2);
					room[lastRow] = room[lastRow].replaceAt(2, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === 1 && walls[0].to.j === 1) {
					const lastColumn = getLastColumn(8);
					room[8] = room[8].replaceAt(lastColumn, ' '); // 1 or 2 or 3
				} else if (walls[0].to.i === 1 && walls[0].to.j === -1) {
					room[8] = room[8].replaceAt(0, ' '); // 1 or 2 or 3
				}
			}
			if (walls[0].from.i === 1 && walls[0].from.j === 1) {
				if (walls[0].to.i === 1 && walls[0].to.j === 2) {
					const lastColumn = getLastColumn(8);
					room[8] = room[8].replaceAt(lastColumn, ' '); // 7 or 8 or 9
				} else if (walls[0].to.i === 2 && walls[0].to.j === 1) {
					const lastRow = getLastRow(8);
					room[lastRow] = room[lastRow].replaceAt(8, ' '); // 7 or 8 or 9
				}
			}
		});
		return room;
	}
}

test();

function test() {
	//const rooms = MazeGenerator.createLevel();
	//console.log(rooms);
}
