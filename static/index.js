"use strict";

const KeyManager = new Keys();
KeyManager.onShift = function(shiftDown) {
    $(".button").toggleClass("shiftdown", shiftDown);
}
function positiveMod(a, b) { return ((a%b)+b)%b; }

const g = {
    tracks: [],
    samples: {},
}

class Track {
    sequence = []
    position = 0
    trackLength = 0
    trackDelay = 0
    playStartTime = 0
    recordStartTime = 0
    loops = false // Does the track loop forever?
    playing = false
    recording = false
    constructor(e, key) {
        this.e = e;
        g.tracks.push(this);
        KeyManager.bindKey(e, key, {
            keyDown: this.togglePlay.bind(this),
            keyShiftDown: this.toggleRecord.bind(this),
            mouseDown: this.togglePlay.bind(this),
            mouseShiftDown: this.toggleRecord.bind(this),
        });
        $(this.e).toggleClass("empty", this.sequence.length == 0);
    }
    play() {
        if (this.playing) this.stop();
        if (this.sequence.length == 0) return; // Deal with zero-length loops
        this.playing = true;
        $(this.e).toggleClass("playing", true);

        this.position = 0;
        this.setProgress(0);
        this.scheduledTimeout = setTimeout(() => {
            this.playStartTime = Date.now();
            this.scheduleNextPlayTick();
        }, this.trackDelay);
    }
    stop() {
        this.playing = false;
        $(this.e).toggleClass("playing", false);

        clearTimeout(this.scheduledTimeout);
    }
    static stopAll() {
        g.tracks.forEach((track) => { track.stop() })
    }
    static playAll() {
        g.tracks.forEach((track) => { track.play() })
    }
    playOthers() {
        // Play all the tracks EXCEPT this one
        g.tracks.forEach((track) => { if (track != this) track.play() } )
    }
    playTick() {
        if (!this.playing) return;
        if (this.sequence[this.position].startTime <= this.trackLength) {
            this.sequence[this.position].sample.play();
        }
        this.position++;
        this.scheduleNextPlayTick();
    }
    scheduleNextPlayTick() {
        const elapsed = Date.now() - this.playStartTime;
        this.setProgress(elapsed);
        if (!this.loops && this.position >= this.sequence.length) {
            this.stop();
            return;
        }

        this.position = this.position % this.sequence.length;
        const nextTime = this.sequence[this.position].startTime;
        let waitTime = nextTime - elapsed
        if (this.loops) waitTime = positiveMod(waitTime, this.trackLength);
        waitTime = Math.max(waitTime, 0);
        this.scheduledTimeout = setTimeout(this.playTick.bind(this), waitTime);
    }
    togglePlay() {
        if (this.recording) this.recordEnd();
        if (this.playing) this.stop();
        else this.play();
    }
    toggleRecord() {
        if (this.recording) this.recordEnd()
        else this.recordStart();
    }
    recordStart() {
        if (this.recording) return;
        this.recording = true;
        $(this.e).toggleClass("recording", true);
        $(this.e).toggleClass("empty", true);

        this.recordStartTime = Date.now();
        this.sequence = []; // Clear track

        Track.stopAll();
        this.playOthers(); // Accompany by other tracks to make it clearer to record
    }
    recordEnd() {
        if (!this.recording) return;
        this.recording = false;
        $(this.e).toggleClass("recording", false);

        Track.stopAll();
        let trackDelay = 0;
        this.setTrackDelay(this.sequence.length == 0 ? 0 : this.sequence[0].startTime);
        this.setTrackLength(Date.now() - this.recordStartTime - this.trackDelay); // Doesn't take into account the length of the last play sample, because we don't know sample lengths
        for (let i=0; i<this.sequence.length; i++) this.sequence[i].startTime -= this.trackDelay;
        $(this.e).toggleClass("empty", this.sequence.length == 0);
    }
    recordSamplePlayed(sample) {
        if (!this.recording) return;
        this.sequence.push({
            startTime: Date.now() - this.recordStartTime,
            sample: sample,
        })
    }
    setTrackDelay(trackDelay) {
        this.trackDelay = trackDelay;
        this.s.trackDelay.val(trackDelay);
    }
    setTrackLength(trackLength) {
        this.trackLength = trackLength;
        this.s.trackLength.val(trackLength);
        this.s.progress.attr("max", trackLength);
    }
    setProgress(elapsed) {
        this.s.progress.val(elapsed % this.trackLength);
    }
    attachSettings(e) {
        e = $(e);
        this.s = {
            trackDelay: e.find(".setting-delay"),
            loops: e.find(".setting-loops"),
            trackLength: e.find(".setting-length"),
            progress: e.find(".setting-progress"),
        };
        e.find(".setting-label").text(`Track ${$(this.e).text()}`);
        this.s.trackDelay.on('input', () => {
            this.trackDelay = Number(this.s.trackDelay.val());
        });
        this.s.trackLength.on('input', () => {
            this.trackLength = Number(this.s.trackLength.val());
        });
        this.s.loops.on('input', () => {
            this.loops = this.s.loops[0].checked;
            $(this.e).toggleClass("loops", this.loops);
        });
    }
}

class Sample {
    constructor(e, key) {
        this.e = e;
        this.setSound("generated", this.generate());
        g.samples[this.id()] = this;
        KeyManager.bindKey(e, key, {
            keyDown: this.playHuman.bind(this),
            keyShiftDown: this.startRecord.bind(this),
            keyShiftUp: this.stopRecord.bind(this),
            mouseDown: this.playHuman.bind(this),
            mouseShiftDown: this.startRecord.bind(this),
            mouseShiftUp: this.stopRecord.bind(this),
            mouseCtrlDown: this.regenerate.bind(this),
        });
    }
    id() { return this.e.id }
    setSound(type, sound) {
        this.e.classList.remove("generated");
        this.e.classList.remove("recorded");
        this.e.classList.add(type);
        this.sound = sound;
    }
    generate() {
        let res = sfxr.generate("synth");
        return {
            data: res,
            type: "sfxr",
            play: function() { sfxr.play(res); }
        }
    }
    regenerate() {
        this.setSound("generated", this.generate());
        this.sound.play();
    }
    playHuman() {
        g.tracks.forEach((track) => {
            track.recordSamplePlayed(this);
        });
        this.play();
    }
    play(human) {
        this.sound.play();
    }
    async startRecord() {
        if (this.recording) return;
        this.recording = true;

        $(this.e).toggleClass("recording", true);
        // Do recording stuffs
        this.recorder = await recordAudio();
        this.recorder.start();
    }
    async stopRecord() {
        if (!this.recording) return;
        this.recording = false;

        $(this.e).toggleClass("recording", false);
        // Stop recording stuffs
        // Replace sample with recording
        this.setSound("recorded", await this.recorder.stop());
    }
}

window.onload = () => {
    // Sample buttons
    const sampleKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
                "a", "s", "d", "f", "g", "h", "j", "k", "l",
                "z", "x", "c", "v", "b", "n", "m"];
    $(".sample").each(function(i) {
        new Sample(this, sampleKeys[i])
    });

    // Track buttons
    const trackKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    $(".track").each(function(i) {
        new Track(this, trackKeys[i])
    });
    $(".track-settings").each(function(i) {
        g.tracks[i].attachSettings(this);
    });

    // Global "Go" button
    const go = $(".go")[0];
    let allPlaying = false;
    KeyManager.bindKey(go, "Go!", {
        mouseDown: () => {
            if (!allPlaying) Track.playAll();
            else Track.stopAll();
            allPlaying = !allPlaying;
        }
    });
};
