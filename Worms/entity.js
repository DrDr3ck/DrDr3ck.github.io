class Entity {
	constructor(x, y, teamIndex) {
		this.x = x;
		this.y = y;
		this.team = teamIndex;
		this.velX = 0;
		this.velY = 0;
		this.accX = 0;
		this.accY = 0;
		this.stable = false;
		this.radius = 18;
		this.nBounceBeforeDeath = -1;
		this.bDead = false;
		this.explode = false;

		this.friction = 0.2;
	}

	draw(dx, dy) {
		ellipse(this.x - dx, this.y - dy, this.radius * 2, this.radius * 2);
	}

	update(elapsedTime) {
		if (this.stable) return;
		this.accY = 2.0; // gravity
		// update velocity
		this.velX += this.accX * elapsedTime;
		this.velY += this.accY * elapsedTime;
		// update position
		const fPotentialX = this.x + this.velX * elapsedTime;
		const fPotentialY = this.y + this.velY * elapsedTime;
		// reset acceleration
		this.accX = 0;
		this.accY = 0;
		this.stable = false;

		// collision with map
		const angle = atan2(this.velY, this.velX);
		let fResponseX = 0;
		let fResponseY = 0;
		let bCollision = false;

		for (let r = angle - PI / 2.0; r < angle + PI / 2.0; r += PI / 8.0) {
			// Calculate test point on circumference of circle
			let fTestPosX = this.radius * cos(r) + fPotentialX;
			let fTestPosY = this.radius * sin(r) + fPotentialY;

			// Constrain to test within map boundary
			if (fTestPosX >= world.width) fTestPosX = world.width - 1;
			if (fTestPosY >= world.height) fTestPosY = world.height - 1;
			if (fTestPosX < 0) fTestPosX = 0;
			if (fTestPosY < 0) fTestPosY = 0;

			// Test if any points on semicircle intersect with terrain
			if (world.map[Math.floor(fTestPosX)][Math.floor(fTestPosY)] !== 0) {
				// Accumulate collision points to give an escape response vector
				// Effectively, normal to the areas of contact
				fResponseX += fPotentialX - fTestPosX;
				fResponseY += fPotentialY - fTestPosY;
				bCollision = true;
			}
		}

		// Calculate magnitudes of response and velocity vectors
		const fMagVelocity = sqrt(this.velX * this.velX + this.velY * this.velY);
		const fMagResponse = sqrt(fResponseX * fResponseX + fResponseY * fResponseY);

		// Collision occurred
		if (bCollision) {
			// Force object to be stable, this stops the object penetrating the terrain
			if (fMagVelocity < 1) this.stable = true;

			// Calculate reflection vector of objects velocity vector, using response vector as normal
			const dot = this.velX * (fResponseX / fMagResponse) + this.velY * (fResponseY / fMagResponse);

			// Use friction coefficient to dampen response (approximating energy loss)
			this.velX = this.friction * (-2.0 * dot * (fResponseX / fMagResponse) + this.velX);
			this.velY = this.friction * (-2.0 * dot * (fResponseY / fMagResponse) + this.velY);

			//Some objects will "die" after several bounces
			if (this.nBounceBeforeDeath > 0) {
				// BOOM
				this.nBounceBeforeDeath--;
				this.bDead = this.nBounceBeforeDeath == 0;

				// If object died, work out what to do next
				if (this.bDead && this.explode) {
					boomSong.play();
					// Shockwave other entities in range
					entities.filter((entity) => entity !== this).forEach((entity) => {
						const dx = entity.x - this.x;
						const dy = entity.y - this.y;
						const dist = Math.max(0.0001, sqrt(dx * dx + dy * dy));

						if (dist < entity.radius * 2) {
							entity.velX = dx / dist * entity.radius;
							entity.velY = dy / dist * entity.radius;
							entity.stable = false;
							entity.life = Math.max(0, entity.life - 25);
						}
					});

					// create a hole
					const holeSize = 80;
					for (let i = 0; i < holeSize; i++) {
						for (let j = 0; j < holeSize; j++) {
							const dx = this.x - holeSize / 2 + i - this.x;
							const dy = this.y - holeSize / 2 + j - this.y;
							const dist = Math.max(0.0001, sqrt(dx * dx + dy * dy));
							if (dist < holeSize / 2) {
								const mapX = Math.min(world.width - 1, Math.max(0, floor(this.x - dx)));
								const mapY = Math.min(world.height - 1, Math.max(0, floor(this.y - dy)));
								world.map[mapX][mapY] = 0;
							}
						}
					}

					world.teams.forEach((team) => {
						team.forEach((bot) => {
							bot.stable = false;
						});
					});

					for (let i = 0; i < 20; i++) {
						entities.push(new Debris(this.x, this.y, this.team));
					}
				}
			}
		} else {
			// No collision so update objects position
			this.x = fPotentialX;
			this.y = fPotentialY;
		}

		// Turn off movement when tiny
		//if (fMagVelocity < 0.5) this.stable = true;
	}
}

class Bot extends Entity {
	constructor(x, y, radius, teamIndex) {
		super(x, y, teamIndex);
		this.radius = radius;
		this.shootAngle = 0;
		this.life = 100;
	}

	draw(dx, dy) {
		if (this.team === YELLOW) {
			fill(250, 250, 120);
		}
		if (this.team === RED) {
			fill(250, 120, 120);
		}
		if (this.life > 0) {
			super.draw(dx, dy);
			fill(50, 250, 50, 128);
			rect(this.x - dx - this.radius, this.y - dy + 5 + this.radius, this.radius * 2 * this.life / 100, 3);
		} else {
			// draw a grave ?
			fill(250, 250, 250);
			rect(this.x - 3 - dx, this.y - this.radius - dy, 6, this.radius * 2);
			rect(this.x - dx - this.radius + 5, this.y - 10 - dy, this.radius * 2 - 10, 5);
		}
	}
}

class Debris extends Entity {
	constructor(x, y, teamIndex) {
		super(x, y, teamIndex);
		this.velX = 10.0 * Math.cos(Math.random() * 2.0 * PI);
		this.velY = 10.0 * Math.sin(Math.random() * 2.0 * PI);
		this.radius = 2.0;
		this.friction = 0.8;
		this.nBounceBeforeDeath = 5; // After 5 bounces, dispose
	}

	draw(dx, dy) {
		fill(120, 250, 120);
		super.draw(dx, dy);
	}
}

class Missile extends Entity {
	constructor(x, y, vx, vy, teamIndex) {
		super(x, y, teamIndex);
		this.radius = 3;
		this.velX = vx;
		this.velY = vy;
		this.friction = 0.5;
		this.nBounceBeforeDeath = 1;
		this.explode = true;
	}

	draw(dx, dy) {
		fill(200, 200, 200);
		super.draw(dx, dy);
	}
}
