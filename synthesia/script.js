/* =====================
   定数・状態
===================== */
const BLACK_KEYS = [1, 3, 6, 8, 10]; // 黒鍵の音の並び（C#=1, D#=3, F#=6, G#=8, A#=10）
const VIEW_AHEAD = 3.0;  // 先読み秒数
const MAX_POLY = 28;     // 同時発音制限

let midi = null;
let playing = false;
let activeNotes = 0;
let lastDraw = 0;

// 【劇的改善】配列の全ループを回避するためのインデックス管理
let currentPlayIndex = 0; 

/* =====================
   WebGL 初期化
===================== */
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGLがサポートされていません。ブラウザの設定を確認してください。");
}

const vsSource = `
  attribute vec2 aPosition;
  attribute vec4 aColor;
  varying vec4 vColor;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
  }
`;

const fsSource = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(program);
gl.useProgram(program);

const positionBuffer = gl.createBuffer();
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);

const colorBuffer = gl.createBuffer();
const aColor = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(aColor);

let vertices = [];
let colors = [];

function addRect(x1, y1, x2, y2, r, g, b) {
  const vx1 = (x1 / canvas.width) * 2 - 1;
  const vy1 = (y1 / canvas.height) * -2 + 1;
  const vx2 = (x2 / canvas.width) * 2 - 1;
  const vy2 = (y2 / canvas.height) * -2 + 1;

  vertices.push(
    vx1, vy1,  vx2, vy1,  vx1, vy2,
    vx1, vy2,  vx2, vy1,  vx2, vy2
  );

  for (let i = 0; i < 6; i++) {
    colors.push(r, g, b, 1.0);
  }
}

/* =====================
   Tone.js 初期化 & MIDI 読み込み
===================== */
Tone.context.latencyHint = "balanced";

const synth = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 32,
  options: {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.7, release: 0.15 }
  }
}).toDestination();

// すべてのトラックのノートを時間順に1つの配列にフラット化する変数
let allNotes = [];

document.getElementById("midi").addEventListener("change", async e => {
  const file = e.target.files[0]; 
  if (!file) return;

  const buf = await file.arrayBuffer();
  midi = new Midi(buf);

  // 【高速化】全トラックの音符を1つの配列にまとめ、演奏時間順にガチガチにソートする
  allNotes = [];
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      allNotes.push(n);
    });
  });
  allNotes.sort((a, b) => a.time - b.time);

  stopPlayback();

  gl.clearColor(0.07, 0.07, 0.07, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
});

/* =====================
   再生・停止ロジック（全面書き換え）
===================== */
document.getElementById("play").onclick = async () => {
  if (allNotes.length === 0 || playing) return;

  await Tone.start();

  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.seconds = 0;
  
  activeNotes = 0;
  currentPlayIndex = 0; // 再生位置を先頭リセット
  playing = true;

  // 【音切れ対策の要】一括登録（schedule）を完全に廃止。
  // 10ミリ秒ごとに「今鳴るべき音」だけをミリ秒単位で切り出して発音させる超軽量ループ
  Tone.Transport.scheduleRepeat((time) => {
    const now = Tone.Transport.seconds;

    // 現在の時間以降のノートを、ソート済み配列から順番にチェック
    while (currentPlayIndex < allNotes.length) {
      const n = allNotes[currentPlayIndex];

      // まだ発音タイミングに達していない音符が来たらループを抜ける（これ以上の無駄な探索をストップ）
      if (n.time > now + 0.02) break; 

      // すでに通り過ぎた古い音符はスキップして次へ
      if (n.time < now - 0.01) {
        currentPlayIndex++;
        continue;
      }

      // 同時発音数制限を超えていなければ発音
      if (activeNotes < MAX_POLY) {
        activeNotes++;
        const velocity = Math.min(n.velocity, 0.9);
        
        synth.triggerAttackRelease(
          n.name,
          n.duration,
          time + (n.time - now), // 正確な時間差を補正
          velocity
        );

        setTimeout(() => activeNotes--, n.duration * 1000);
      }

      currentPlayIndex++;
    }
  }, 0.01); // 10ms周期で動かす

  Tone.Transport.start("+0.05");
  requestAnimationFrame(draw);
};

function stopPlayback() {
  playing = false;
  Tone.Transport.stop();
  Tone.Transport.cancel();
  synth.releaseAll();
}

document.getElementById("stop").onclick = stopPlayback;

/* =====================
   描画ループ（描画の探索もバイナリサーチ風に最適化）
===================== */
function draw(t = 0) {
  if (!playing) return;

  if (t - lastDraw < 33) {
    requestAnimationFrame(draw);
    return;
  }
  lastDraw = t;

  const now = Tone.Transport.seconds;

  vertices = [];
  colors = [];

  drawRollAndKeys(now);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.07, 0.07, 0.07, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STREAM_DRAW);
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

  requestAnimationFrame(draw);
}

/* =====================
   ピアノロール＆鍵盤 統合描画
===================== */
function drawRollAndKeys(now) {
  const keyW = canvas.width / 88;
  const keysH = 100; 
  const rollH = canvas.height - keysH; 
  const blackW = keyW * 0.7;
  const blackH = keysH * 0.6;

  const activeMidiNotes = new Set();

  // 【描画の高速化】何万個もの音符をすべてループするのをやめる
  // 「現在の再生位置」の少し前から探索を開始し、画面内のものだけを瞬時に見つける
  let startLookIndex = Math.max(0, currentPlayIndex - 100);

  for (let i = startLookIndex; i < allNotes.length; i++) {
    const n = allNotes[i];

    // 先読み時間（画面最上部）を超えたら、それ以降の音符はまだ画面に映らないのでループを即終了
    if (n.time > now + VIEW_AHEAD) break; 

    // すでに画面最下部（過去）に消え去った音符はスキップ
    if (n.time + n.duration < now) continue;

    const active = now >= n.time && now <= n.time + n.duration;
    if (active) activeMidiNotes.add(n.midi);

    const x = (n.midi - 21) * keyW;
    const y2 = rollH - ((n.time - now) / VIEW_AHEAD) * rollH;
    const y1 = rollH - ((n.time + n.duration - now) / VIEW_AHEAD) * rollH;

    if (active) {
      addRect(x, y1, x + keyW - 1, y2, 1.0, 0.31, 0.64);
    } else {
      addRect(x, y1, x + keyW - 1, y2, 0.31, 0.64, 1.0);
    }
  }

  // 2. 白鍵の描画
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (BLACK_KEYS.includes(midiNum % 12)) continue;

    const x = i * keyW;
    const isActive = activeMidiNotes.has(midiNum);

    if (isActive) {
      addRect(x, rollH, x + keyW - 1, canvas.height, 1.0, 0.31, 0.64);
    } else {
      addRect(x, rollH, x + keyW - 1, canvas.height, 0.9, 0.9, 0.9);
    }
  }

  // 3. 黒鍵の描画
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (!BLACK_KEYS.includes(midiNum % 12)) continue;

    const x = i * keyW - blackW / 2;
    const isActive = activeMidiNotes.has(midiNum);

    if (isActive) {
      addRect(x, rollH, x + blackW, rollH + blackH, 1.0, 0.4, 0.7);
    } else {
      addRect(x, rollH, x + blackW, rollH + blackH, 0.15, 0.15, 0.15);
    }
  }
}
