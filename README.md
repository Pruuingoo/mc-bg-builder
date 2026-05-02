# MC BG Pack Builder

**Replace your Minecraft Bedrock or Java main menu background with any image — no sign-up, runs entirely in your browser.**

Built with **Next.js 14 + TypeScript**. Generates a ready-to-install `.mcpack` (Bedrock) or `.zip` (Java) resource pack from any image in seconds.

> Inspired by the UI injection technique used in [HorizonUI](https://discord.gg/horizonui) by Hans.

---

## Stack

- **Next.js 14** (App Router, static export)
- **TypeScript** — fully typed throughout
- **CSS Modules** — scoped styles, no CSS-in-JS
- **JSZip** — in-browser ZIP/mcpack generation
- Zero runtime dependencies beyond Next.js

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        ← Root layout + metadata
│   ├── page.tsx          ← Main builder UI
│   ├── page.module.css   ← Page styles
│   └── globals.css       ← CSS variables + resets
├── components/
│   ├── DropZone.tsx      ← Drag & drop image input
│   ├── DropZone.module.css
│   ├── Icons.tsx         ← SVG icon components
│   ├── LogBox.tsx        ← Build log display
│   └── LogBox.module.css
└── lib/
    ├── types.ts          ← Shared TypeScript types
    ├── builder.ts        ← Pack generation logic (Bedrock + Java)
    ├── useTheme.ts       ← Dark/light theme hook
    ├── useDropzone.ts    ← Drag & drop hook
    └── defaultIcon.ts    ← Default pack icon (base64)
```

---

## Deploy to Vercel

### Option A — GitHub (recommended)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Vercel auto-detects Next.js — just click **Deploy**

### Option B — Vercel CLI
```bash
npm install -g vercel
npm install
vercel
```

### Option C — Any static host
```bash
npm install
npm run build   # outputs to /out
```
Then deploy the `out/` folder to GitHub Pages, Netlify, Cloudflare Pages, etc.

---

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## How It Works

### Bedrock Edition
The engine renders the panorama cubemap underneath all UI layers. This pack overrides `ui/start_screen.json` and `ui/progress_screen.json`, setting `$screen_bg_content` to a custom image panel that renders on top of the panorama — covering it completely. No cubemap splits needed.

### Java Edition
Java uses 6 PNG cubemap face images in `assets/minecraft/textures/gui/title/background/`. This pack fills all 6 faces with your image, making the panorama show your image on every face. On 1.19+ it also clears `panorama_overlay.png` to remove the vignette.

---

## FAQ

**Does my image get uploaded anywhere?**
No. Everything runs in the browser — image reading, PNG conversion, ZIP packaging. Nothing leaves your device.

**Will this conflict with other packs?**
Only if another pack overrides the same files (`ui/start_screen.json`, `ui/progress_screen.json` for Bedrock, or `textures/gui/title/background/` for Java).

**What resolution should my image be?**
Any resolution works. 1920×1080 or 2560×1440 recommended for best quality in-game.

---

## License

MIT — do whatever you want with it.

---

*Not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Studios.*
