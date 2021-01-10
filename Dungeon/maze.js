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
	getNeighborRoomIndices(spots) {
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

/**
 * Builds a path between two given tiles from a map of tiles
 */
class PathCalculator {
	constructor(tiles) {
		this.tiles = [];
		for (let r = 0; r < tiles.length; r++) {
			const row = [];
			for (let c = 0; c < tiles[0].length; c++) {
				if (tiles[r][c] === -1) {
					row.push(999);
				} else {
					row.push(-999);
				}
			}
			this.tiles.push(row);
		}
		this.neighbors = [ [ -1, 0 ], [ 0, -1 ], [ 0, 1 ], [ 1, 0 ], [ -1, -1 ], [ -1, 1 ], [ 1, 1 ], [ 1, -1 ] ];
	}

	exists(row, col) {
		if (row < 0 || col < 0) {
			return false;
		}
		if (row >= this.tiles.length || col >= this.tiles[0].length) {
			return false;
		}
		return true;
	}

	isFree(row, col) {
		if (this.exists(row, col)) {
			return this.tiles[row][col] > 0;
		}
		return false;
	}

	getSmallerTile(pathTile) {
		let pathPayCost = this.tiles[pathTile.Y][pathTile.X];
		for (let i = 0; i < this.neighbors.length; i++) {
			const row = pathTile.Y + this.neighbors[i][1];
			const col = pathTile.X + this.neighbors[i][0];
			if (this.exists(row, col)) {
				const curPayCost = this.tiles[row][col];
				if (curPayCost > 0 && curPayCost < pathPayCost) {
					return { X: col, Y: row };
				}
			}
		}
		return null;
	}

	findPath(tileFrom, tileTo) {
		function dist(x1, y1, x2, y2) {
			return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
		}
		const path = [];
		this.tiles[tileFrom.Y][tileFrom.X] = 1;
		let curWave = [];
		curWave.push(tileFrom);
		while (curWave.length > 0) {
			const nextWave = [];
			curWave.forEach((tile) => {
				const pathCost = this.tiles[tile.Y][tile.X];
				// add distance to neighbors
				for (let i = 0; i < this.neighbors.length; i++) {
					const row = tile.Y + this.neighbors[i][1];
					const col = tile.X + this.neighbors[i][0];
					if (this.isFree(row, col)) {
						const potentialCost = pathCost + dist(0, 0, this.neighbors[i][0], this.neighbors[i][1]);
						if (potentialCost < this.tiles[row][col]) {
							nextWave.push({ X: col, Y: row });
							this.tiles[row][col] = potentialCost;
						}
					}
					// todo: can stop if tileTo is reached
				}
			});
			curWave = nextWave;
		}
		if (this.tiles[tileTo.X][tileTo.Y] !== 0) {
			// get the path
			path.push(tileTo);
			let finish = false;
			// loop
			while (!finish) {
				// get cur payCost of last element of the path
				let pathTile = path[path.length - 1];
				// find smaller payCost in the neighbors
				const curTile = this.getSmallerTile(pathTile);
				// add this new tile and restart until tile is the tileFrom one
				path.push(curTile);
				if (curTile.X === tileFrom.X && curTile.Y === tileFrom.Y) {
					finish = true;
				}
			}
		}

		// path may be empty if no way to reach tileTo from tileFrom
		return path;
	}
}

class Level {
	constructor() {
		this.rooms = MazeGenerator.createLevel();
	}
}

class Room {
	constructor(id, asciiRoom) {
		this.id = id;
		this.ascii = asciiRoom;
		this.doors = [];
		this.enemies = { count: 1, entities: [] };
		if (asciiRoom.length === 11 && asciiRoom[0].length === 11) {
			this.enemies.count = Math.floor(random(2, 4));
		}
		this.objects = {
			potion: 0,
			key: 0,
			entities:[]
		};
	}

	addObjectOccurrence(name) {
		this.objects[name]++;
	}

	removeObjectOccurrence(name) {
		this.objects[name]--;
	}

	getObjectCount(name) {
		return this.objects[name];
	}

	/**
	 * Adds a door from fromTile of this current room
	 * to toTile of the neighbor room of id roomId
	 */
	addDoor(fromTile, toTile, roomId) {
		this.doors.push({ from: fromTile, to: toTile, id: roomId });
	}
}

class BSlotButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.item = null;
	}

	setItem(img) {
		this.item = img;
	}

	isAvailable() {
		return !this.item;
	}

	doDraw() {
		super.doDraw();
		if (this.item) {
			image(this.item, this.x + 8, this.y + 8, 48, 48);
		}
	}
}

class MazeGenerator {
	/**
     * Creates a level and returns a list of rooms in ascii format
     */
	static createLevel(maxRooms = 5) {
		const level = new TinyLevel();
		const tinyRooms = [];
		tinyRooms.push(MazeGenerator.createTinyRoom(true));
		level.addRoom(tinyRooms[0], tinyRooms.length);
		while (tinyRooms.length !== maxRooms) {
			const tinyRoom = MazeGenerator.createTinyRoom();
			tinyRooms.push(tinyRoom);
			level.addRoom(tinyRoom, tinyRooms.length);
		}
		console.log('Map:', level.map);

		const rooms = [];
		const doors = [];
		tinyRooms.forEach((room, i) => rooms.push(MazeGenerator.createRoomFromTinyRoom(room, i + 1, level, doors)));

		doors.forEach((door) => {
			rooms[door.fromRoom - 1].addDoor(door.fromTile, door.toTile, door.toRoom);
			rooms[door.toRoom - 1].addDoor(door.toTile, door.fromTile, door.fromRoom);
		});

		// add potions and keys
		rooms.forEach((room) => {
			if (random() > 0.2) {
				room.addObjectOccurrence('potion');
			}
			if (random() > 0.8) {
				room.addObjectOccurrence('key');
			}
		});

		console.log('rooms:', rooms);
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

	static createRoomFromTinyRoom(tinyRoom, roomIndex, level, doors) {
		let asciiRoom = [];
		if (tinyRoom.length === 1 && tinyRoom[0].length === 1) {
			// first room
			asciiRoom = [ 'XXXXX', 'X   X', 'X   X', 'X   X', 'XXXXX' ];
		} else if (tinyRoom.length === 2 && tinyRoom[0].length === 1) {
			// corridorVRoom
			asciiRoom.push('XXXXX');
			for (let i = 0; i < 9; i++) {
				asciiRoom.push('X   X');
			}
			asciiRoom.push('XXXXX');
		} else if (tinyRoom.length === 1 && tinyRoom[0].length === 2) {
			// corridorHRoom
			asciiRoom.push('XXXXXXXXXXX');
			for (let i = 0; i < 3; i++) {
				asciiRoom.push('X         X');
			}
			asciiRoom.push('XXXXXXXXXXX');
		} else if ((tinyRoom.length === 2 && tinyRoom[0].includes(' ')) || tinyRoom[1].includes(' ')) {
			// L shape
			asciiRoom.push('XXXXXXXXXXX');
			for (let i = 0; i < 4; i++) {
				asciiRoom.push('X         X');
			}
			for (let i = 0; i < 5; i++) {
				asciiRoom.push('X   XXXXXXX');
			}
			asciiRoom.push('XXXXXXXXXXX');
		} else {
			// square
			asciiRoom.push('XXXXXXXXXXX');
			for (let i = 0; i < 9; i++) {
				asciiRoom.push('X         X');
			}
			asciiRoom.push('XXXXXXXXXXX');
		}
		console.log('createRoom:', asciiRoom);
		// add door access
		const spotsRoom = level.getSpotsOfIndex(roomIndex);
		const neighborRoomIndices = level.getNeighborRoomIndices(spotsRoom);
		const spotReference = spotsRoom[0];
		neighborRoomIndices.forEach((neighborRoomIndex) => {
			const spotsOtherRooms = level.getSpotsOfIndex(neighborRoomIndex);
			// find wall(s) between spotsRoom and spotsOtherRoom
			const walls = [];
			spotsRoom.forEach((spot) => {
				neighborDeltas.forEach((delta) => {
					const i = spot.i + delta[0];
					const j = spot.j + delta[1];
					const spotIndex = spotsOtherRooms.findIndex((curSpot) => curSpot.i === i && curSpot.j === j);
					if (spotIndex !== -1) {
						walls.push({
							from: { i: spot.i - spotReference.i, j: spot.j - spotReference.j },
							to: { i: i - spotReference.i, j: j - spotReference.j }
						});
					}
				});
			});
			//console.log('walls(', roomIndex, ',', neighborRoomIndex, '):', walls);

			function getLastRow(column) {
				for (let i = asciiRoom.length - 1; i > 0; i--) {
					if (asciiRoom[i - 1].charAt(column) === ' ') {
						return i;
					}
				}
				// should not happen
				return asciiRoom.length - 1;
			}

			function getLastColumn(row) {
				return asciiRoom[0].length - 1;
			}

			const doorSymbol = neighborRoomIndex;

			function addDoor(row, col) {
				asciiRoom[row] = asciiRoom[row].replaceAt(col, doorSymbol); // 1 or 2 or 3
				const doorIndex = doors.findIndex(
					(door) => door.fromRoom === neighborRoomIndex && door.toRoom === roomIndex
				);
				if (doorIndex === -1) {
					doors.push({
						fromRoom: roomIndex,
						toRoom: neighborRoomIndex,
						fromTile: { i: row, j: col },
						toTile: { i: -1, j: -1 }
					});
				} else {
					doors[doorIndex].toTile = { i: row, j: col };
				}
			}

			// adds a door on room with its neighbor
			if (walls[0].from.i === 0 && walls[0].from.j === 0) {
				if (walls[0].to.i === 0 && walls[0].to.j === 1) {
					addDoor(2, getLastColumn(2));
				} else if (walls[0].to.i === 1 && walls[0].to.j === 0) {
					addDoor(getLastRow(2), 2);
				} else if (walls[0].to.i === -1 && walls[0].to.j === 0) {
					addDoor(0, 2);
				} else if (walls[0].to.i === 0 && walls[0].to.j === -1) {
					addDoor(2, 0);
				}
			}
			if (walls[0].from.i === 0 && walls[0].from.j === 1) {
				if (walls[0].to.i === 0 && walls[0].to.j === 2) {
					addDoor(2, getLastColumn(2));
				} else if (walls[0].to.i === -1 && walls[0].to.j === 1) {
					addDoor(0, 8);
				} else if (walls[0].to.i === 1 && walls[0].to.j === 1) {
					addDoor(getLastRow(8), 8);
				}
			}
			if (walls[0].from.i === 1 && walls[0].from.j === 0) {
				if (walls[0].to.i === 2 && walls[0].to.j === 0) {
					addDoor(getLastRow(2), 2);
				} else if (walls[0].to.i === 1 && walls[0].to.j === 1) {
					addDoor(8, getLastColumn(8));
				} else if (walls[0].to.i === 1 && walls[0].to.j === -1) {
					addDoor(8, 0);
				}
			}
			if (walls[0].from.i === 1 && walls[0].from.j === 1) {
				if (walls[0].to.i === 1 && walls[0].to.j === 2) {
					addDoor(8, getLastColumn(8));
				} else if (walls[0].to.i === 2 && walls[0].to.j === 1) {
					addDoor(getLastRow(8), 8);
				}
			}
		});
		const room = new Room(roomIndex, asciiRoom);
		return room;
	}
}

test();

function test() {
	//const rooms = MazeGenerator.createLevel();
	//console.log(rooms);
}
