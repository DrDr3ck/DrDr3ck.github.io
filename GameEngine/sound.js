class sndMgr {
	constructor() {
		this.sounds = {};
	}

	addSound(name, sound, volume=1) {
		sound.setVolume(volume);
		this.sounds[name] = sound;
	}

	playSound(name, rate=1) {
		const sound = this.sounds[name];
		if (sound) {
            sound.rate(rate);
            sound.play();
        }
    }
    
    stopSound(name) {
		const sound = this.sounds[name];
		if (sound) sound.stop();
	}
}
