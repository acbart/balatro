export class AudioEngine {
  private readonly context = new AudioContext();

  playCard(): void {
    this.playTone(500, 0.03, 'triangle', 0.02);
  }

  playChipTick(intensity: number): void {
    this.playTone(180 + Math.min(intensity, 20) * 22, 0.06, 'square', 0.035);
  }

  playAmbient(level: number): void {
    this.playTone(70 + level * 6, 0.5, 'sine', 0.01);
  }

  private playTone(freq: number, duration: number, type: OscillatorType, gainLevel: number): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = gainLevel;
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }
}
