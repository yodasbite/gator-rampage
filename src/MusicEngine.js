// ─────────────────────────────────────────────
//  MusicEngine — procedural chiptune music
//  Uses Web Audio API oscillators (no files).
//  Call Music.init() on first user gesture,
//  Music.play(levelIndex) to start a track,
//  Music.stop() to silence.
// ─────────────────────────────────────────────

class MusicEngine {

    constructor() {
        this.ctx        = null;
        this.masterGain = null;
        this._timerId   = null;
        this._step      = 0;
        this._melody    = [];
        this._bpm       = 132;   // march tempo
    }

    // Call once from a user-gesture handler (keydown / pointerdown)
    init() {
        if (this.ctx) { this.ctx.resume(); return; }
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.22;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('MusicEngine: Web Audio not available');
        }
    }

    // levelIndex 0-4 → school-themed melody
    play(levelIndex) {
        if (!this.ctx) return;
        this.ctx.resume();
        this.stop();

        // ── Melodies (MIDI note numbers, 0 = rest) ────────────────
        // Each array is 16 eighth-note steps that loop.
        // Inspired by each school's musical identity (original composition).
        const TRACKS = [
            // Level 1  Georgia — C major march, "Glory-Glory" energy
            [64,0,67,64, 65,0,69,65, 67,0,72,67, 72,71,69,67],

            // Level 2  Tennessee — G major, bluegrass snap
            [67,0,71,74, 72,0,74,72, 71,69,67,0, 64,67,69,71],

            // Level 3  Kentucky — F major, stately blue
            [65,0,69,72, 70,0,74,77, 72,0,70,69, 65,67,69,70],

            // Level 4  Texas — D major, big stadium stomp
            [62,0,66,69, 71,0,74,71, 69,66,0,66, 69,71,74,69],

            // Level 5  Alabama — G major, rolling tide power
            [67,0,71,74, 76,0,79,76, 74,71,0,71, 74,76,79,74],
        ];

        this._melody = TRACKS[levelIndex % TRACKS.length];
        this._step   = 0;

        const msPerStep = (60000 / this._bpm) / 2; // 8th notes
        this._timerId = setInterval(() => this._tick(), msPerStep);
    }

    stop() {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
    }

    // ── Internal helpers ──────────────────────

    _midiHz(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    _osc(freq, type, gainPeak, duration, startTime) {
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(gainPeak, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
    }

    _noise(gainPeak, duration, startTime) {
        const size = Math.ceil(this.ctx.sampleRate * duration);
        const buf  = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < size; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 4);
        }
        const src  = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        src.connect(gain);
        gain.connect(this.masterGain);
        src.buffer      = buf;
        gain.gain.value = gainPeak;
        src.start(startTime);
    }

    _tick() {
        if (!this.ctx) return;
        const now  = this.ctx.currentTime;
        const note = this._melody[this._step % this._melody.length];
        const beat = this._step % 8;   // position within a bar (8 eighth notes = 1 bar)
        this._step++;

        // ── Lead melody (square wave — chiptune) ──────────────
        if (note > 0) {
            this._osc(this._midiHz(note),      'square',   0.18, 0.12, now);
        }

        // ── Bass line (triangle, one octave down, quarter notes) ─
        if (beat % 2 === 0 && note > 0) {
            this._osc(this._midiHz(note - 12), 'triangle', 0.28, 0.20, now);
        }

        // ── Kick drum (sine thump, beats 1 & 3) ───────────────
        if (beat === 0 || beat === 4) {
            const kick = this.ctx.createOscillator();
            const kg   = this.ctx.createGain();
            kick.connect(kg); kg.connect(this.masterGain);
            kick.frequency.setValueAtTime(120, now);
            kick.frequency.exponentialRampToValueAtTime(40, now + 0.12);
            kg.gain.setValueAtTime(0.6, now);
            kg.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            kick.start(now); kick.stop(now + 0.20);
        }

        // ── Snare (noise burst, beats 2 & 4) ──────────────────
        if (beat === 2 || beat === 6) {
            this._noise(0.12, 0.08, now);
            // Add a pitched snare body
            this._osc(220, 'sine', 0.08, 0.06, now);
        }

        // ── Hi-hat (noise, every step at low gain) ────────────
        this._noise(0.03, 0.03, now);
    }
}

const Music = new MusicEngine();
