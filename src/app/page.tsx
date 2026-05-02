"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTheme } from "@/lib/useTheme";
import { buildPack } from "@/lib/builder";
import type {
  Edition, FitMode, BedrockVersion, JavaVersion, LogLine,
} from "@/lib/types";
import { DropZone } from "@/components/DropZone";
import { LogBox } from "@/components/LogBox";
import {
  SunIcon, MoonIcon, WebIcon, DiscordIcon, GitHubIcon,
  ImageIcon, PaletteIcon, BuildIcon, DownloadIcon,
  BedrockIcon, JavaIcon,
} from "@/components/Icons";
import { DEFAULT_ICON_B64 } from "@/lib/defaultIcon";
import styles from "./page.module.css";

const BEDROCK_VERSIONS: BedrockVersion[] = [
  "1.20+", "1.18-1.19", "1.16-1.17", "1.13-1.15", "legacy",
];
const JAVA_VERSIONS: JavaVersion[] = ["1.21+", "1.20", "1.19", "1.13-1.18", "1.7-1.12"];

export default function Home() {
  const { theme, toggle } = useTheme();

  // form state
  const [edition, setEdition] = useState<Edition>("bedrock");
  const [bedrockVer, setBedrockVer] = useState<BedrockVersion>("1.20+");
  const [javaVer, setJavaVer] = useState<JavaVersion>("1.21+");
  const [packName, setPackName] = useState("Custom Menu Background");
  const [packDesc, setPackDesc] = useState("Custom Bedrock menu background");
  const [fit, setFit] = useState<FitMode>("fill");

  // images
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null);

  // build
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [building, setBuilding] = useState(false);
  const [builtBlob, setBuiltBlob] = useState<Blob | null>(null);
  const [builtExt, setBuiltExt] = useState(".mcpack");
  const logIdRef = useRef(0);
  const dlRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: LogLine["type"] = "info") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, msg, type }]);
  }, []);

  async function handleBuild() {
    if (!bgDataUrl) return;
    setBuiltBlob(null);
    setLogs([]);
    setBuilding(true);

    try {
      const { blob, ext } = await buildPack(
        {
          edition,
          bedrockVersion: bedrockVer,
          javaVersion: javaVer,
          packName: packName.trim() || "Custom Menu Background",
          packDesc: packDesc.trim() || "Custom menu background",
          fill: fit === "fill",
          bgDataUrl,
          iconDataUrl,
        },
        DEFAULT_ICON_B64,
        addLog
      );
      setBuiltBlob(blob);
      setBuiltExt(ext);
      setTimeout(() => {
        dlRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (e: unknown) {
      addLog("Error: " + (e instanceof Error ? e.message : String(e)), "err");
    } finally {
      setBuilding(false);
    }
  }

  function handleDownload() {
    if (!builtBlob) return;
    const name = (packName.trim() || "CustomMenuBG")
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .replace(/\s+/g, "_");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(builtBlob);
    a.download = name + builtExt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  const installSteps =
    edition === "bedrock"
      ? [
          <>Tap or double-click the <strong>.mcpack</strong> file — Minecraft imports it automatically.</>,
          <>Go to <strong>Settings → Global Resources</strong>.</>,
          <>Find your pack and tap <strong>Activate</strong>.</>,
          <>Return to the main menu — done.</>,
        ]
      : [
          <>Download the <strong>.zip</strong> file. Do <strong>NOT</strong> extract it.</>,
          <>Open Minecraft Java → <strong>Options → Resource Packs → Open Pack Folder</strong>.</>,
          <>Move the <strong>.zip</strong> into that folder.</>,
          <>Back in Minecraft, activate the pack and click <strong>Done</strong>.</>,
          <>Return to the main menu — done.</>,
        ];

  return (
    <div className={styles.page}>
      {/* BG blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>MC·BG·BUILDER</div>
        <div className={styles.navRight}>
          <button className={styles.themeBtn} onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon size={13} /> : <MoonIcon size={13} />}
            <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
          </button>
          <div className={styles.navBadge}>FREE · NO SIGN-UP</div>
        </div>
      </nav>

      {/* PROMO */}
      <div className={styles.promo}>
        <div className={styles.promoLeft}>
          <strong>Built by Pluii</strong>
          Join Nytharc — a Minecraft community &amp; Discord server
        </div>
        <div className={styles.promoLinks}>
          <a href="https://pruuingoo.site" target="_blank" rel="noopener" className={styles.promoLink}>
            <WebIcon size={12} /> pruuingoo.site
          </a>
          <a href="https://nytharc.pruuingoo.site" target="_blank" rel="noopener" className={styles.promoLink}>
            <DiscordIcon size={12} /> Discord
          </a>
        </div>
      </div>

      {/* CREDIT */}
      <div className={styles.credit}>
        <strong>Inspired by HorizonUI</strong> — The UI injection technique used by this tool was
        studied from{" "}
        <a href="https://discord.gg/horizonui" target="_blank" rel="noopener">
          HorizonUI
        </a>
        , a Bedrock resource pack by Hans. Check out their work for animated backgrounds and much
        more.
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Resource Pack Generator</div>
        <h1 className={styles.heroTitle}>
          REPLACE YOUR<br />
          MENU <span className={styles.accent}>BG</span>
        </h1>
        <p className={styles.heroDesc}>
          Upload any image and get a <strong>ready-to-install pack</strong> that replaces the
          Minecraft main menu background. Supports <strong>Bedrock</strong> and{" "}
          <strong>Java Edition</strong>. Runs 100% in your browser — nothing is uploaded anywhere.
        </p>
        <div className={styles.steps}>
          {["Pick edition", "Upload image", "Download pack"].map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* CARD: EDITION & VERSION */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>01 — Edition &amp; Version</div>
        <div className={styles.editionTabs}>
          {(["bedrock", "java"] as Edition[]).map((ed) => (
            <button
              key={ed}
              className={`${styles.edTab} ${edition === ed ? styles.edTabActive : ""}`}
              onClick={() => setEdition(ed)}
            >
              {ed === "bedrock" ? <BedrockIcon size={14} /> : <JavaIcon size={14} />}
              {ed === "bedrock" ? "Bedrock Edition" : "Java Edition"}
            </button>
          ))}
        </div>

        {edition === "bedrock" ? (
          <>
            <div className={styles.edNote}>
              Generates a <code>.mcpack</code> file. Works on Windows, Xbox, PlayStation, Switch,
              iOS &amp; Android.
            </div>
            <div className={styles.verLabel}>Bedrock Version</div>
            <div className={styles.versionRow}>
              {BEDROCK_VERSIONS.map((v) => (
                <button
                  key={v}
                  className={`${styles.verChip} ${bedrockVer === v ? styles.verChipActive : ""}`}
                  onClick={() => setBedrockVer(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.edNote} ${styles.edNoteJava}`}>
              <strong>Java:</strong> Generates a <code>.zip</code> resource pack. Drop the zip
              into your resourcepacks folder — do NOT extract it.
            </div>
            <div className={styles.verLabel}>Java Version</div>
            <div className={styles.versionRow}>
              {JAVA_VERSIONS.map((v) => (
                <button
                  key={v}
                  className={`${styles.verChip} ${javaVer === v ? styles.verChipActive : ""}`}
                  onClick={() => setJavaVer(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CARD: IMAGES */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>02 — Images</div>
        <div className={styles.dropRow}>
          <DropZone
            label="Background Image *"
            hint="PNG · JPG · WEBP"
            icon={<ImageIcon size={32} />}
            previewAspect="video"
            dataUrl={bgDataUrl}
            error={null}
            onFile={(_, u) => setBgDataUrl(u)}
            onClear={() => setBgDataUrl(null)}
          />
          <DropZone
            label="Pack Icon (optional)"
            hint="PNG · 128×128 recommended"
            icon={<PaletteIcon size={32} />}
            previewAspect="square"
            dataUrl={iconDataUrl}
            error={null}
            onFile={(_, u) => setIconDataUrl(u)}
            onClear={() => setIconDataUrl(null)}
          />
        </div>
      </div>

      {/* CARD: PACK INFO */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>03 — Pack Info</div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Pack Name</label>
          <input
            className={styles.input}
            type="text"
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            placeholder="My Custom Background"
            maxLength={64}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Description</label>
          <input
            className={styles.input}
            type="text"
            value={packDesc}
            onChange={(e) => setPackDesc(e.target.value)}
            placeholder="Replaces the main menu background"
            maxLength={128}
          />
        </div>
      </div>

      {/* CARD: DISPLAY OPTIONS */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>04 — Display Options</div>
        <div className={styles.optsGrid}>
          {(["fill", "fit"] as FitMode[]).map((mode) => (
            <label
              key={mode}
              className={`${styles.opt} ${fit === mode ? styles.optSelected : ""}`}
              onClick={() => setFit(mode)}
            >
              <div className={`${styles.optRadio} ${fit === mode ? styles.optRadioSelected : ""}`} />
              <div>
                <div className={styles.optTitle}>
                  {mode === "fill" ? "FILL / COVER" : "FIT / LETTERBOX"}
                </div>
                <div className={styles.optDesc}>
                  {mode === "fill"
                    ? "Fills the full screen. May crop edges on different aspect ratios. Recommended."
                    : "Full image always visible. Black bars may appear depending on aspect ratio."}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* BUILD BUTTON */}
      <button
        className={styles.buildBtn}
        onClick={handleBuild}
        disabled={!bgDataUrl || building}
      >
        <BuildIcon size={20} />
        {building ? "BUILDING..." : "BUILD PACK"}
      </button>

      {/* LOG */}
      {logs.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>Building</div>
          <LogBox lines={logs} />
        </div>
      )}

      {/* DOWNLOAD */}
      {builtBlob && (
        <div ref={dlRef} className={styles.dlWrap}>
          <button className={styles.dlBtn} onClick={handleDownload}>
            <DownloadIcon size={20} />
            DOWNLOAD {builtExt.toUpperCase()}
          </button>
          <div className={styles.installSteps}>
            <h3 className={styles.installTitle}>
              How to install — {edition === "bedrock" ? "Bedrock" : "Java"}
            </h3>
            <ol className={styles.installList}>
              {installSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className={styles.faq}>
        <div className={styles.faqTitle}>FAQ</div>
        {[
          {
            q: "Why isn't the background showing?",
            a: (
              <>
                Make sure the pack is <strong>activated</strong> in Settings → Global Resources
                (Bedrock) or the Resource Pack screen (Java). Also make sure no higher-priority pack
                overrides the same files.
              </>
            ),
          },
          {
            q: "How does the Bedrock method work?",
            a: (
              <>
                The engine renders the panorama cubemap underneath all UI layers. This pack overrides{" "}
                <code>ui/start_screen.json</code> and <code>ui/progress_screen.json</code>, setting{" "}
                <code>$screen_bg_content</code> to a custom image panel that draws on top of the
                panorama. Inspired by the technique used in{" "}
                <a
                  href="https://discord.gg/horizonui"
                  target="_blank"
                  rel="noopener"
                  style={{ color: "var(--amber)" }}
                >
                  HorizonUI
                </a>{" "}
                by Hans.
              </>
            ),
          },
          {
            q: "How does the Java method work?",
            a: (
              <>
                Java uses 6 PNG cubemap face images in{" "}
                <code>assets/minecraft/textures/gui/title/background/</code>. This pack fills all 6
                faces with your image. On 1.19+ it also clears{" "}
                <code>panorama_overlay.png</code> to remove the vignette.
              </>
            ),
          },
          {
            q: "Does my image get uploaded anywhere?",
            a: "No. Everything — image reading, conversion, ZIP packaging — runs locally in your browser. Nothing ever leaves your device.",
          },
          {
            q: "Will this conflict with other resource packs?",
            a: (
              <>
                Only if another active pack overrides the same files. Bedrock:{" "}
                <code>ui/start_screen.json</code> and <code>ui/progress_screen.json</code>. Java:{" "}
                <code>textures/gui/title/background/</code>. Most texture and skin packs don&apos;t touch
                these files.
              </>
            ),
          },
          {
            q: "What resolution image should I use?",
            a: "Any resolution works. 1920×1080 or 2560×1440 gives the sharpest results in-game.",
          },
        ].map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.faqQ}>{item.q}</div>
            <div className={styles.faqA}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>MC BG PACK BUILDER · FREE · OPEN SOURCE</div>
        <div className={styles.footerRight}>
          <a href="https://pruuingoo.site" target="_blank" rel="noopener">
            <WebIcon size={11} /> pruuingoo.site
          </a>
          <a href="https://nytharc.pruuingoo.site" target="_blank" rel="noopener">
            <DiscordIcon size={11} /> Discord
          </a>
          <a href="https://github.com" target="_blank" rel="noopener">
            <GitHubIcon size={11} /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
