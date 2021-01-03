class SoundMgr {
	constructor() {
		this.sounds = {};
		this.masterVolume = 1;
		this.soundToLoad = 0;
		this.totalLoadedSounds = 0;
	}

	mute(value) {
		if (value) {
			masterVolume(0);
		} else {
			masterVolume(this.masterVolume);
		}
	}

	addSound(name, filename, volume = 1) {
		this.sounds[name] = loadSound(filename, (sound) => {
			sound.setVolume(volume);
			this.totalLoadedSounds++;
		});
		this.soundToLoad++;
	}

	getSound(name) {
		return this.sounds[name];
	}

	playSound(name, rate = 1, loop=false) {
		if (getMasterVolume() === 0) {
			return;
		}
		const sound = this.sounds[name];
		if (sound) {
			sound.rate(rate);
			if( loop ) {
				sound.loop();
			} else {
				sound.play();
			}
		}
	}

	stopSound(name) {
		const sound = this.sounds[name];
		if (sound) sound.stop();
	}
}
