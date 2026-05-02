import JSZip from "jszip";
import type { BuildOptions, BedrockVersion, JavaVersion } from "./types";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function toPng(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = dataUrl;
  });
}

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function getBedrockMinEngine(ver: BedrockVersion): [number, number, number] {
  switch (ver) {
    case "1.20+":      return [1, 20, 0];
    case "1.18-1.19":  return [1, 18, 0];
    case "1.16-1.17":  return [1, 16, 0];
    case "1.13-1.15":  return [1, 13, 0];
    default:           return [1, 8, 0];
  }
}

function getJavaPackInfo(ver: JavaVersion): { fmt: number; min: number; max: number; path: string } {
  switch (ver) {
    case "1.21+":
      return { fmt: 46, min: 34, max: 9999, path: "assets/minecraft/textures/gui/title/background/" };
    case "1.20":
      return { fmt: 22, min: 22, max: 34, path: "assets/minecraft/textures/gui/title/background/" };
    case "1.19":
      return { fmt: 13, min: 13, max: 18, path: "assets/minecraft/textures/gui/title/background/" };
    case "1.13-1.18":
      return { fmt: 8, min: 4, max: 12, path: "assets/minecraft/textures/gui/title/background/" };
    default:
      return { fmt: 1, min: 1, max: 3, path: "assets/minecraft/textures/gui/title/" };
  }
}

export type ProgressCallback = (msg: string, type?: "ok" | "active" | "warn" | "err" | "info") => void;

export async function buildPack(
  opts: BuildOptions,
  defaultIconB64: string,
  onProgress: ProgressCallback
): Promise<{ blob: Blob; ext: string }> {

  onProgress("Reading background image...", "active");
  const bgPng = await toPng(opts.bgDataUrl);
  const bgBuf = await bgPng.arrayBuffer();
  onProgress(`Background → PNG (${(bgBuf.byteLength / 1024).toFixed(0)} KB)`, "ok");

  onProgress("Processing pack icon...", "active");
  let iconBuf: ArrayBuffer;
  if (opts.iconDataUrl) {
    const ip = await toPng(opts.iconDataUrl);
    iconBuf = await ip.arrayBuffer();
    onProgress("Custom icon → PNG", "ok");
  } else {
    iconBuf = b64ToArrayBuffer(defaultIconB64);
    onProgress("Using default pack icon", "ok");
  }

  const zip = new JSZip();
  onProgress("Building pack files...", "active");

  let ext: string;
  if (opts.edition === "bedrock") {
    await buildBedrock(zip, opts, bgBuf, iconBuf, onProgress);
    ext = ".mcpack";
  } else {
    await buildJava(zip, opts, bgBuf, iconBuf, onProgress);
    ext = ".zip";
  }

  onProgress("Compressing...", "active");
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  onProgress(`Done — ${(blob.size / 1024).toFixed(1)} KB`, "ok");
  return { blob, ext };
}

async function buildBedrock(
  zip: JSZip,
  opts: BuildOptions,
  bgBuf: ArrayBuffer,
  iconBuf: ArrayBuffer,
  onProgress: ProgressCallback
): Promise<void> {
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        format_version: 2,
        header: {
          name: opts.packName,
          description: opts.packDesc,
          uuid: generateUUID(),
          version: [1, 0, 0],
          min_engine_version: getBedrockMinEngine(opts.bedrockVersion),
        },
        modules: [{ type: "resources", uuid: generateUUID(), version: [1, 0, 0] }],
      },
      null,
      2
    )
  );
  onProgress("manifest.json", "ok");

  zip.file("pack_icon.png", iconBuf);
  onProgress("pack_icon.png", "ok");

  zip.file("textures/ui/custom_menu_bg.png", bgBuf);
  onProgress("textures/ui/custom_menu_bg.png", "ok");

  zip.file("ui/_ui_defs.json", JSON.stringify({ ui_defs: ["ui/custom_bg.json"] }, null, 2));
  onProgress("ui/_ui_defs.json", "ok");

  zip.file(
    "ui/custom_bg.json",
    JSON.stringify(
      {
        namespace: "custom_bg",
        bg_image: {
          type: "image",
          texture: "textures/ui/custom_menu_bg",
          fill: opts.fill,
          size: ["100%", "100%"],
          anchor_from: "center",
          anchor_to: "center",
          layer: 1,
        },
      },
      null,
      2
    )
  );
  onProgress("ui/custom_bg.json", "ok");

  // Main menu background
  zip.file(
    "ui/start_screen.json",
    JSON.stringify(
      {
        namespace: "start",
        "start_screen@common.base_screen": {
          $screen_bg_content: "custom_bg.bg_image",
          $screen_content: "start.start_screen_content",
        },
      },
      null,
      2
    )
  );
  onProgress("ui/start_screen.json", "ok");

  // World loading screen
  zip.file(
    "ui/progress_screen.json",
    JSON.stringify(
      {
        namespace: "progress",
        "progress_screen@common.base_screen": {
          $screen_bg_content: "custom_bg.bg_image",
          $screen_content: "progress.progress_screen_content",
        },
      },
      null,
      2
    )
  );
  onProgress("ui/progress_screen.json", "ok");
}

async function buildJava(
  zip: JSZip,
  opts: BuildOptions,
  bgBuf: ArrayBuffer,
  iconBuf: ArrayBuffer,
  onProgress: ProgressCallback
): Promise<void> {
  const { fmt, min, max, path: basePath } = getJavaPackInfo(opts.javaVersion);

  // Use supported_formats range (available since 1.20.2) so the pack works
  // across minor versions without showing the "made for older version" warning.
  const mcmeta =
    fmt >= 26
      ? { pack: { pack_format: fmt, supported_formats: { min_inclusive: min, max_inclusive: max }, description: opts.packDesc } }
      : { pack: { pack_format: fmt, description: opts.packDesc } };

  zip.file("pack.mcmeta", JSON.stringify(mcmeta, null, 2));
  onProgress(`pack.mcmeta (format ${fmt}, supported ${min}–${max})`, "ok");

  zip.file("pack.png", iconBuf);
  onProgress("pack.png", "ok");

  const faces = ["panorama_0", "panorama_1", "panorama_2", "panorama_3", "panorama_4", "panorama_5"] as const;
  for (const face of faces) {
    zip.file(`${basePath}${face}.png`, bgBuf);
  }
  onProgress(`6 panorama cube faces → ${basePath}`, "ok");

  // Clear the vignette overlay (added in 1.19 / format 13+)
  if (fmt >= 13) {
    const canvas = document.createElement("canvas");
    canvas.width = 1; canvas.height = 1;
    canvas.getContext("2d")!.clearRect(0, 0, 1, 1);
    const blank = await new Promise<Blob>((r) => canvas.toBlob(r as BlobCallback, "image/png"));
    zip.file(`${basePath}panorama_overlay.png`, await blank.arrayBuffer());
    onProgress("panorama_overlay.png cleared (removes vignette)", "ok");
  }
}
