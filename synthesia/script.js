/* =====================
   定数・状態
===================== */
const BLACK_KEYS = [1, 3, 6, 8, 10]; // 修正：消えていた配列を復元
const VIEW_AHEAD = 3.0;  // 先読み秒数
const MAX_POLY = 28;     // 同時発音制限

let midi = null;
let playing = false;
let activeNotes = 0;
let lastDraw = 0;

/* =====================
   WebGL 初期化
===================== */
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGLがサポートされていません。ブラウザの設定を確認してください。");
}

// バーテックスシェーダー（頂点）
const vsSource = `
  attribute vec2 aPosition;
  attribute vec4 aColor;
  varying vec4 vColor;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
  }
`;

// フラグメントシェーダー（色）
const fsSource = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

// シェーダープログラムの作成ヘルパー
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link error:", gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// バッファのセットアップ
const positionBuffer = gl.createBuffer();
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);

const colorBuffer = gl.createBuffer();
const aColor = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(aColor);

// 描画用データ配列
let vertices = [];
let colors = [];

// 矩形（四角形）を頂点配列に追加するヘルパー
function addRect(x1, y1, x2, y2, r, g, b) {
  // WebGLのクリッピング空間 (-1 から 1) に座標変換
  const vx1 = (x1 / canvas.width) * 2 - 1;
  const vy1 = (y1 / canvas.height) * -2 + 1;
  const vx2 = (x2 / canvas.width) * 2 - 1;
  const vy2 = (y2 / canvas.height) * -2 + 1;

  // 2つの三角形（計6頂点）で1つの四角形を形成
  vertices.push(
    vx1, vy1,  vx2, vy1,  vx1, vy2,
    vx1, vy2,  vx2, vy1,  vx2, vy2
  );

  // 6頂点分の色情報(RGBA)を追加
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

document.getElementById("midi").addEventListener("change", async e => {
  const file = e.target.files[0]; // 修正：[0] が抜けていたバグを修正
  if (!file) return;

  const buf = await file.arrayBuffer();
  midi = new Midi(buf);

  Tone.Transport.stop();
  Tone.Transport.cancel();
  playing = false;

  // 画面を黒でクリア
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
});

/* =====================
   再生・停止
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
        synth.triggerAttackRelease(n.name, n.duration, time, Math.min(n.velocity, 0.9));
        setTimeout(() => activeNotes--, n.duration * 1000);
      }, n.time);
    });
  });

  playing = true;
  Tone.Transport.start("+0.1");
  requestAnimationFrame(draw);
};

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

  // 配列を毎フレームリセット
  vertices = [];
  colors = [];

  // レンダリング用ポリゴンデータの構築
  drawRollAndKeys(now);

  // WebGLバッファへ頂点データを高速転送して描画
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.07, 0.07, 0.07, 1.0); // 背景色（暗いグレー）
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
  const keysH = 100;                    // 鍵盤エリアの高さ
  const rollH = canvas.height - keysH;  // ノートが降るエリアの高さ
  const blackW = keyW * 0.7;
  const blackH = keysH * 0.6;

  // 現在発音中のMIDI番号を高速に判定するためのSet
  const activeMidiNotes = new Set();

  // 1. ピアノロール（ノート）の描画データ生成
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      // 画面外（先読み時間以上、またはすでに演奏終了）のノートはスキップ
      if (n.time > now + VIEW_AHEAD || n.time + n.duration < now) return;

      const active = now >= n.time && now <= n.time + n.duration;
      if (active) activeMidiNotes.add(n.midi);

      // 上から下に降る座標（y1=上端, y2=下端）
      const x = (n.midi - 21) * keyW;
      const y2 = rollH - ((n.time - now) / VIEW_AHEAD) * rollH;
      const y1 = rollH - ((n.time + n.duration - now) / VIEW_AHEAD) * rollH;

      if (active) {
        addRect(x, y1, x + keyW - 1, y2, 1.0, 0.31, 0.64); // 発音中：ピンク(#ff4fa3)
      } else {
        addRect(x, y1, x + keyW - 1, y2, 0.31, 0.64, 1.0); // 待機中：青(#4fa3ff)
      }
    });
  });

  // 2. 白鍵の描画データ生成
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (BLACK_KEYS.includes(midiNum % 12)) continue;

    const x = i * keyW;
    const isActive = activeMidiNotes.has(midiNum);

    if (isActive) {
      addRect(x, rollH, x + keyW - 1, canvas.height, 1.0, 0.31, 0.64); // アクティブ白鍵：ピンク
    } else {
      addRect(x, rollH, x + keyW - 1, canvas.height, 0.9, 0.9, 0.9); // 通常白鍵：白
    }
  }

  // 3. 黒鍵の描画データ生成（白鍵の上に上書き）
  for (let i = 0; i < 88; i++) {
    const midiNum = i + 21;
    if (!BLACK_KEYS.includes(midiNum % 12)) continue;

    const x = i * keyW - blackW / 2;
    const isActive = activeMidiNotes.has(midiNum);

    if (isActive) {
      addRect(x, rollH, x + blackW, rollH + blackH, 1.0, 0.4, 0.7); // アクティブ黒鍵：薄ピンク
    } else {
      addRect(x, rollH, x + blackW, rollH + blackH, 0.15, 0.15, 0.15); // 通常黒鍵：黒
    }
  }
}
