let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playNote(freq, duration = 0.5) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;

  const t = ac.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
  gain.gain.setValueAtTime(0.4, t + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

// 시퀀스 재생 (~100 BPM, 발성연습 템포)
// 각 음: 0.5초 발음 + 0.1초 쉼 = 0.6초 간격
export function playSequence(frequencies) {
  const ac = getCtx();
  const interval = 0.6;
  const noteDur = 0.5;

  frequencies.forEach((freq, i) => {
    const start = ac.currentTime + i * interval;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
    gain.gain.setValueAtTime(0.4, start + noteDur - 0.1);
    gain.gain.linearRampToValueAtTime(0, start + noteDur);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + noteDur);
  });

  return frequencies.length * interval;
}
