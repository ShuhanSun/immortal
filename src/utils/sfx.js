const SFX = {
  ctx: null,
  init: () => {
    if (!SFX.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) SFX.ctx = new AudioContext();
    }
  },
  play: (type) => {
    if (!SFX.ctx) SFX.init();
    if (!SFX.ctx) return;
    if (SFX.ctx.state === 'suspended') SFX.ctx.resume();

    const t = SFX.ctx.currentTime;
    const osc = SFX.ctx.createOscillator();
    const gain = SFX.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(SFX.ctx.destination);

    switch (type) {
      case 'click': 
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'breath_in': 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(150, t + 4);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 2); 
        gain.gain.linearRampToValueAtTime(0.02, t + 4); 
        osc.start(t);
        osc.stop(t + 4);
        break;
      case 'breath_out': 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(80, t + 4);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0, t + 4); 
        osc.start(t);
        osc.stop(t + 4);
        break;
      case 'level_up': 
        const playChord = (freq, delay) => {
           const o = SFX.ctx.createOscillator();
           const g = SFX.ctx.createGain();
           o.connect(g);
           g.connect(SFX.ctx.destination);
           o.type = 'sine';
           o.frequency.value = freq;
           g.gain.setValueAtTime(0, t + delay);
           g.gain.linearRampToValueAtTime(0.1, t + delay + 0.1);
           g.gain.exponentialRampToValueAtTime(0.001, t + delay + 2);
           o.start(t + delay);
           o.stop(t + delay + 2);
        };
        playChord(440, 0); playChord(554, 0.1); playChord(659, 0.2); playChord(880, 0.3); 
        break;
      case 'attack': 
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'hit': 
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'fly': 
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.5);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      case 'scan': 
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'drip':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'error': 
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      case 'magic':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.3);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      case 'explosion':
        const noiseBuffer = SFX.ctx.createBuffer(1, SFX.ctx.sampleRate * 0.5, SFX.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        const noise = SFX.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = SFX.ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(SFX.ctx.destination);
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        noise.start(t);
        break;
      default: break;
    }
  }
};

export default SFX;