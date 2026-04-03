export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  // @ts-ignore
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
};

let ctx: AudioContext | null = null;

export const playSpinClick = (muted: boolean) => {
  if (muted) return;
  if (!ctx) ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

export const playWinSound = (muted: boolean) => {
  if (muted) return;
  if (!ctx) ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') ctx.resume();

  const playNote = (freq: number, startTime: number) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx!.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  };

  const now = ctx.currentTime;
  playNote(440, now);        // A4
  playNote(554.37, now + 0.1); // C#5
  playNote(659.25, now + 0.2); // E5
  playNote(880, now + 0.3);    // A5
};

export const playLoseSound = (muted: boolean) => {
  if (muted) return;
  if (!ctx) ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};
