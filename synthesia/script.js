/* =====================
   定数・状態
===================== */
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEYS = [1, 3, 6, 8, 10];

const SCALE_Y = 120;      // ピアノロール縦スケール
const VIEW_AHEAD = 3.0;  // 先読み秒数
const MAX_POLY = 28;     // 同時発音制限

let midi = null;
let playing = false;
let activeNotes = 0;
let lastDraw = 0;

/* =====================
   Canvas
===================== */
const roll = document.getElementById("roll");
const keys = document.getElementById("keys");
const rctx = roll.getContext("2d");
const kctx = keys.getContext("2d");

/* =====================
   Tone.js 初期化
===================== */
Tone.context.latencyHint = "balanced";

const synth = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 32,
  options: {
    oscillator: {
      type: "triangle"
    },
    envelope: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.7,
      release: 0.15
    }
  }
}).toDestination();

/* =====================
   MIDI 読み込み
===================== */
document.getElementById("midi").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const buf = await file.arrayBuffer();
  midi = new Midi(buf);

  Tone.Transport.stop();
  Tone.Transport.cancel();
  playing = false;

  rctx.clearRect(0, 0, roll.width, roll.height);
  kctx.clearRect(0, 0, keys.width, keys.height);
});

/* =====================
   再生
===================== */
document.getElementById("play").onclick = async () => {
  if (!midi || playing) return;

  await Tone.start();

  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.seconds = 0;
  activeNotes = 0;

  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      Tone.Transport.schedule(time => {
        if (activeNotes >= MAX_POLY) return;

        activeNotes++;
        const velocity = Math.min(n.velocity, 0.9);

        synth.triggerAttackRelease(
          n.name,
          n.duration,
          time,
          velocity
        );

        setTimeout(() => activeNotes--, n.duration * 1000);
      }, n.time);
    });
  });

  playing = true;
  Tone.Transport.start("+0.1");
  requestAnimationFrame(draw);
};

/* =====================
   停止
===================== */
document.getElementById("stop").onclick = () => {
  playing = false;
  Tone.Transport.stop();
  Tone.Transport.cancel();
  synth.releaseAll();
};

/* =====================
   描画ループ（FPS制限）
===================== */
function draw(t = 0) {
  if (!playing) return;

  if (t - lastDraw < 33) {
    requestAnimationFrame(draw);
    return;
  }
  lastDraw = t;

  const now = Tone.Transport.seconds;

  rctx.clearRect(0, 0, roll.width, roll.height);
  kctx.clearRect(0, 0, keys.width, keys.height);

  drawRoll(now);
  drawKeys(now);

  requestAnimationFrame(draw);
}

/* =====================
   ピアノロール描画
===================== */
function drawRoll(now) {
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      if (n.time > now + VIEW_AHEAD || n.time + n.duration < now) return;

      const x = (n.midi - 21) * (roll.width / 88);
      const y = roll.height - (n.time - now) * SCALE_Y;
      const h = n.duration * SCALE_Y;

      const active = now >= n.time && now <= n.time + n.duration;
      rctx.fillStyle = active ? "#ff4fa3" : "#4fa3ff";

      rctx.fillRect(x, y - h, (roll.width / 88) - 1, h);
    });
  });
}

/* =====================
   鍵盤描画（黒鍵対応）
===================== */
function drawKeys(now) {
  const keyW = keys.width / 88;
  const blackW = keyW * 0.7;
  const blackH = keys.height * 0.6;

  // 白鍵
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (BLACK_KEYS.includes(midiNum % 12)) continue;

    kctx.fillStyle = "#fff";
    kctx.fillRect(i * keyW, 0, keyW, keys.height);
    kctx.strokeStyle = "#ccc";
    kctx.strokeRect(i * keyW, 0, keyW, keys.height);
  }

  // 黒鍵
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (!BLACK_KEYS.includes(midiNum % 12)) continue;

    kctx.fillStyle = "#333";
    kctx.fillRect(i * keyW - blackW / 2, 0, blackW, blackH);
  }

  // ハイライト
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      if (now < n.time || now > n.time + n.duration) return;

      const i = n.midi - 21;
      const isBlack = BLACK_KEYS.includes(n.midi % 12);

      kctx.fillStyle = "#ff4fa3";
      if (isBlack) {
        const x = i * keyW - blackW / 2;
        kctx.fillRect(x, 0, blackW, blackH);
      } else {
        kctx.fillRect(i * keyW, 0, keyW, keys.height);
      }
    });
  });
}
