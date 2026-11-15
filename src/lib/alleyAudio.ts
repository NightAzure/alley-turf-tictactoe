import type { Player } from "./gameLogic";

type SoundKey = "cat1" | "cat2" | "catWin" | "pigeonCoo" | "pigeonWin";

const AUDIO_SOURCES: Record<SoundKey, string> = {
  cat1: "/audio/cat-meow.wav",
  cat2: "/audio/cat-meow-2.ogg",
  catWin: "/audio/cat-win.ogg",
  pigeonCoo: "/audio/pigeon-coo.ogg",
  pigeonWin: "/audio/pigeon-win.ogg",
};

class AlleyAudioEngine {
  private ctx: AudioContext | null = null;
  private buffers = new Map<SoundKey, AudioBuffer>();
  private loadingPromise: Promise<void> | null = null;
  private muted = false;
  private catToggle = false;
  private activeSources = new Set<AudioBufferSourceNode>();

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopAllVoices();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  async preload(): Promise<void> {
    if (typeof window === "undefined") return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = Promise.all(
      (Object.entries(AUDIO_SOURCES) as [SoundKey, string][]).map(
        async ([key, url]) => {
          if (this.buffers.has(key)) return;
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const arrayBuf = await res.arrayBuffer();
            const decoded = await ctx.decodeAudioData(arrayBuf);
            this.buffers.set(key, decoded);
          } catch {
            // Browser might not decode a specific codec (e.g. Ogg on Safari);
            // fallback synthesis & HTMLAudio will handle gracefully.
          }
        }
      )
    ).then(() => undefined);

    return this.loadingPromise;
  }

  private stopAllVoices() {
    for (const src of this.activeSources) {
      try {
        src.stop();
      } catch {
        // Ignore already-stopped nodes
      }
    }
    this.activeSources.clear();
  }

  private playBufferSlice(
    key: SoundKey,
    {
      offset = 0,
      duration,
      volume = 0.85,
      playbackRate = 1,
      fadeOut = 0.16,
    }: {
      offset?: number;
      duration?: number;
      volume?: number;
      playbackRate?: number;
      fadeOut?: number;
    } = {}
  ): boolean {
    const ctx = this.getContext();
    const buf = this.buffers.get(key);
    if (!ctx || !buf) return false;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = playbackRate;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const safeOffset = Math.min(offset, Math.max(0, buf.duration - 0.1));
    const maxAvail = Math.max(0.1, buf.duration - safeOffset);
    const playDur = duration ? Math.min(duration, maxAvail) : maxAvail;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.025);
    const fadeStart = Math.max(now + 0.03, now + playDur - fadeOut);
    gain.gain.setValueAtTime(volume, fadeStart);
    gain.gain.exponentialRampToValueAtTime(0.001, now + playDur);

    src.connect(gain);
    gain.connect(ctx.destination);

    this.activeSources.add(src);
    src.onended = () => {
      this.activeSources.delete(src);
    };

    src.start(now, safeOffset, playDur + 0.02);
    return true;
  }

  private playFallbackElement(key: SoundKey, volume = 0.75) {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(AUDIO_SOURCES[key]);
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    } catch {
      // Ignore autoplay errors
    }
  }

  /** Subtle cardboard sticker-slap thump (0ms tactile layer). */
  private playStickerSlap(pitch = 140) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.075);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Synthesized meow fallback if audio buffers aren't decoded yet. */
  private playSynthMeow() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.11);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.42);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.value = 2.4;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  /** Synthesized pigeon coo fallback if audio buffers aren't decoded yet. */
  private playSynthCoo() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [0, 0.2].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = "sine";
      const base = idx === 0 ? 310 : 280;
      osc.frequency.setValueAtTime(base, now + delay);
      osc.frequency.exponentialRampToValueAtTime(base * 0.85, now + delay + 0.18);

      lfo.frequency.value = 22;
      lfoGain.gain.value = 14;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      lfo.start(now + delay);
      osc.start(now + delay);
      lfo.stop(now + delay + 0.2);
      osc.stop(now + delay + 0.2);
    });
  }

  async playMove(player: Player): Promise<void> {
    if (this.muted) return;
    await this.preload();

    this.playStickerSlap(player === "cat" ? 155 : 185);

    if (player === "cat") {
      this.catToggle = !this.catToggle;
      const key: SoundKey = this.catToggle ? "cat1" : "cat2";
      const rate = 0.96 + Math.random() * 0.1;
      const played = this.playBufferSlice(key, {
        duration: 1.0,
        volume: 0.78,
        playbackRate: rate,
        fadeOut: 0.15,
      });
      if (!played) {
        const playedAlt = this.playBufferSlice("cat1", {
          duration: 1.0,
          volume: 0.78,
        });
        if (!playedAlt) {
          this.playSynthMeow();
        }
      }
    } else {
      const rate = 0.98 + Math.random() * 0.08;
      const played = this.playBufferSlice("pigeonCoo", {
        offset: 0.05,
        duration: 1.35,
        volume: 0.85,
        playbackRate: rate,
        fadeOut: 0.22,
      });
      if (!played) {
        const playedAlt = this.playBufferSlice("pigeonWin", {
          offset: 0.0,
          duration: 1.35,
          volume: 0.85,
          fadeOut: 0.22,
        });
        if (!playedAlt) {
          this.playSynthCoo();
        }
      }
    }
  }

  async playWin(winner: Player): Promise<void> {
    if (this.muted) return;
    await this.preload();

    // Cheerful comic 3-note fanfare chord underneath
    const ctx = this.getContext();
    if (ctx) {
      const now = ctx.currentTime;
      const notes =
        winner === "cat" ? [523.25, 659.25, 783.99] : [440, 554.37, 659.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.14, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    }

    if (winner === "cat") {
      const played =
        this.playBufferSlice("catWin", {
          duration: 2.2,
          volume: 0.85,
          fadeOut: 0.25,
        }) || this.playBufferSlice("cat1", { duration: 1.4, volume: 0.85 });
      if (!played) this.playFallbackElement("cat1", 0.8);
    } else {
      const played =
        this.playBufferSlice("pigeonWin", {
          duration: 2.4,
          volume: 0.9,
          fadeOut: 0.3,
        }) ||
        this.playBufferSlice("pigeonCoo", {
          duration: 2.4,
          volume: 0.9,
          fadeOut: 0.3,
        });
      if (!played) this.playFallbackElement("pigeonCoo", 0.8);
    }
  }

  async playDraw(): Promise<void> {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Playful comic descending "wah-wah" draw cadence
    [392, 349.23, 311.13].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.27);
    });
  }

  playNewGame(): void {
    if (this.muted) return;
    this.stopAllVoices();
    const ctx = this.getContext();
    if (!ctx) return;

    // Crisp peel-sticker / paper-rip zip sound
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.13);
    filter.Q.value = 1.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start(now);
  }
}

export const alleyAudio = new AlleyAudioEngine();
