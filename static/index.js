"use strict";

const KeyManager = new Keys();
KeyManager.onShift = function(shiftDown) {
    $(".button").toggleClass("shiftdown", shiftDown);
}

class Sample {
    constructor(e) {
        this.e = e;
        this.setSound("generated", this.generate());
        KeyManager.bindKey(e, null, {
            down: this.play.bind(this),
            shiftDown: this.startRecord.bind(this),
            shiftUp: this.stopRecord.bind(this),
            mouseDown: this.play.bind(this),
            shiftMouseDown: this.startRecord.bind(this),
            shiftMouseUp: this.stopRecord.bind(this),
            ctrlMouseDown: this.regenerate.bind(this),
        });
    }
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
    play() {
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
    $(".sample").each(function() {
        new Sample(this)
    });
};
