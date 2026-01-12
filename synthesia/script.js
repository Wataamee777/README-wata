const midiInput = document.getElementById("midiFile");
const roll = document.getElementById("roll");
const keys = document.getElementById("keys");

const rctx = roll.getContext("2d");
const kctx = keys.getContext("2d");

let midi = null;
let playing = false;

/* ===== Tone.js 安定化設定 ===== */
Tone.context.latencyHint = "playback";

/* ===== シンセ（ブチブチ完全対策）===== */
const synth = new Tone.PolySynth({
  maxPolyphony: 32,
  voice: Tone.Synth
}).toDestination();

/* ===== 定数 ===== */
const SCALE_X = 140;
const VIEW_AHEAD = 4;
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEYS = [1, 3, 6, 8, 10];

/* ===== MIDI 読み込み ===== */
midiInput.onchange = async e => {
  if (!e.target.files[0]) return;
  const buf = await e.target.files[0].arrayBuffer();
  midi = new Midi(buf);

  // scheduleフラグ初期化
  midi.tracks.forEach(t =>
    t.notes.forEach(n => (n._scheduled = false))
  );
};

/* ===== 再生 ===== */
document.getElementById("play").onclick = async () => {
  if (!midi || playing) return;

  await Tone.start();

  playing = true;
  const start = Tone.now() + 0.1; // 少し余裕を持たせる

  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      synth.triggerAttackRelease(
        n.name,
        n.duration,
        start + n.time,
        n.velocity
      );
    });
  });

  startTime = start;
  draw();
};

/* ===== 停止 ===== */
document.getElementById("stop").onclick = () => {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  synth.releaseAll();
  playing = false;

  midi?.tracks.forEach(t =>
    t.notes.forEach(n => (n._scheduled = false))
  );
};

/* ===== ノートの逐次スケジューリング（超重要）===== */
function scheduleNotes() {
  const SCHEDULE_AHEAD = 1;

  Tone.Transport.scheduleRepeat(() => {
    const now = Tone.Transport.seconds;

    midi.tracks.forEach(track => {
      track.notes.forEach(n => {
        if (
          !n._scheduled &&
          n.time >= now &&
          n.time < now + SCHEDULE_AHEAD
        ) {
          Tone.Transport.schedule(time => {
            synth.triggerAttackRelease(
              n.name,
              n.duration,
              time,
              n.velocity
            );
          }, n.time);
          n._scheduled = true;
        }
      });
    });
  }, 0.1);
}

/* ===== 描画（30fps制限）===== */
let lastDraw = 0;
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

/* ===== ピアノロール ===== */
function drawRoll(now) {
  const keyWidth = roll.width / 88;

  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      if (n.time > now + VIEW_AHEAD || n.time + n.duration < now) return;

      const x = (n.midi - 21) * keyWidth;
      const y = roll.height - (n.time - now) * SCALE_X;
      const h = n.duration * SCALE_X;

      rctx.fillStyle =
        now >= n.time && now <= n.time + n.duration
          ? "#ff4fa3"
          : "#4fa3ff";

      rctx.fillRect(x, y - h, keyWidth * 0.9, h);
    });
  });
}

/* ===== 鍵盤（Synthesia寄せ最終形）===== */
function drawKeys(now) {
  const keyWidth = keys.width / 88;
  const blackKeyWidth = keyWidth * 0.7;
  const blackKeyHeight = keys.height * 0.6;

  kctx.lineWidth = 1;

  // 白鍵
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (BLACK_KEYS.includes(midiNum % 12)) continue;

    kctx.fillStyle = "#fff";
    kctx.fillRect(i * keyWidth, 0, keyWidth, keys.height);

    kctx.strokeStyle = "#ccc";
    kctx.strokeRect(i * keyWidth, 0, keyWidth, keys.height);
  }

  // 黒鍵
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (!BLACK_KEYS.includes(midiNum % 12)) continue;

    const x = i * keyWidth - blackKeyWidth / 2;
    kctx.fillStyle = "#333";
    kctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
  }

  // 発音中ハイライト
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      if (now < n.time || now > n.time + n.duration) return;

      const i = n.midi - 21;
      const isBlack = BLACK_KEYS.includes(n.midi % 12);

      kctx.fillStyle = "#ff4fa3";

      if (isBlack) {
        const x = i * keyWidth - blackKeyWidth / 2;
        kctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
        kctx.strokeStyle = "#fff";
        kctx.strokeRect(x, 0, blackKeyWidth, blackKeyHeight);
      } else {
        kctx.fillRect(i * keyWidth, 0, keyWidth, keys.height);
        kctx.strokeStyle = "#fff";
        kctx.strokeRect(i * keyWidth, 0, keyWidth, keys.height);
      }
    });
  });
}
