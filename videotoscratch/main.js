const log = (t) => document.getElementById("log").textContent = t;

const { FFmpeg } = FFmpegWASM;
const ffmpeg = new FFmpeg({ log: false });

async function md5(buffer) {
  const hash = await crypto.subtle.digest("MD5", buffer);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

document.getElementById("run").onclick = async () => {
  const file = document.getElementById("video").files[0];
  if (!file) return alert("動画選んで");

  const fps = document.getElementById("fps").value;
  const w = document.getElementById("w").value;
  const h = document.getElementById("h").value;

  log("ffmpeg 読み込み中…");
  await ffmpeg.load({
    coreURL: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/ffmpeg-core.js"
  });

  log("動画アップロード中…");
  await ffmpeg.writeFile("input.mp4", new Uint8Array(await file.arrayBuffer()));

  log("フレーム変換中…");
  await ffmpeg.exec([
    "-i", "input.mp4",
    "-vf", `fps=${fps},scale=${w}:${h}`,
    "frame_%04d.png"
  ]);

  const list = (await ffmpeg.listDir("/"))
    .filter(f => f.name.startsWith("frame_"));

  if (list.length > 900) {
    alert("フレーム多すぎ（900以下推奨）");
    return;
  }

  const zip = new JSZip();
  const costumes = [];

  log("project.json 生成中…");

  for (const f of list) {
    const png = await ffmpeg.readFile(f.name);
    const hash = await md5(png.buffer);

    zip.file(`${hash}.png`, png.buffer);

    costumes.push({
      assetId: hash,
      name: f.name,
      md5ext: `${hash}.png`,
      dataFormat: "png",
      rotationCenterX: w / 2,
      rotationCenterY: h / 2
    });
  }

  // 再生ブロック（10fps）
  const blocks = {
    flag: {
      opcode: "event_whenflagclicked",
      next: "loop",
      parent: null,
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: true,
      x: 50,
      y: 50
    },
    loop: {
      opcode: "control_forever",
      next: null,
      parent: "flag",
      inputs: {
        SUBSTACK: [1, "next"]
      },
      fields: {},
      shadow: false,
      topLevel: false
    },
    next: {
      opcode: "looks_nextcostume",
      next: "wait",
      parent: "loop",
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: false
    },
    wait: {
      opcode: "control_wait",
      next: null,
      parent: "next",
      inputs: {
        DURATION: [1, "0.1"]
      },
      fields: {},
      shadow: false,
      topLevel: false
    }
  };

  const project = {
    version: 3,
    meta: {
      semver: "3.0.0",
      vm: "12.1.3",
      agent: navigator.userAgent
    },
    broadcasts: {},
    monitors: [],
    extensions: [],
    targets: [
      {
        isStage: true,
        name: "Stage",
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: {},
        comments: {},
        currentCostume: 0,
        costumes: [],
        sounds: [],
        volume: 100,
        layerOrder: 0,
        tempo: 60
      },
      {
        isStage: false,
        name: "video",
        variables: {},
        lists: {},
        broadcasts: {},
        blocks,
        comments: {},
        currentCostume: 0,
        costumes,
        sounds: [],
        volume: 100,
        layerOrder: 1,
        visible: true,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: "all around"
      }
    ]
  };

  zip.file("project.json", JSON.stringify(project, null, 2));

  log("sb3 書き出し中…");
  const blob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "video.sb3";
  a.click();

  log("完了！");
};
