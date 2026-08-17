# Motorbike

A single-page, data-driven gear catalogue for a motorcycle rider — helmet, jacket, gloves, pants, and general accessories — rendered entirely client-side from a JSON file. No build step, no framework, no backend. Live at [motorbike.jdge.cc](https://motorbike.jdge.cc).

<p align="center">
  <img src="images/icon.png" width="72" alt="Motorbike icon">
</p>

## How it works

The page is three static files (`index.html`, `script.js`, `styles.css`) plus one content file (`data.json`). On load, `script.js` fetches `data.json`, walks the array, and builds the entire page — every card, image, badge, and link — as DOM nodes. There is nothing to compile: edit `data.json`, refresh the browser, done.

```
index.html   → shell: header, containers, lightbox, tooltip
data.json    → all content (gear, brands, links, gallery items)
script.js    → fetches data.json and renders it into #content-container
styles.css   → card design, layout, colour system, responsive rules
images/      → product photos + logos (PNG), one PDF spec sheet
fonts/       → placeholder for a self-hosted font (currently unused, see below)
robots.txt   → crawler access rules
LICENSE      → MIT
```

## `data.json`

This is the entire content model for the site — everything you'd want to change lives here, not in the HTML or JS. It's a flat **array of entries**, rendered top to bottom in file order. Each entry is one of three shapes:

### 1. A gear item (the default / most common shape)

Represents one piece of kit. Two variants exist depending on whether the item has one brand or several:

**Single brand** (e.g. Jacket, Pants):
```json
{
  "image": "images/exhaust_jacket.png",
  "part": "Jacket",
  "brand": "Ixon",
  "brand_flag": "🇫🇷",
  "version": "Exhaust",
  "version_url": "https://...",
  "safety_rating": [
    { "text": "CE Level 2" },
    { "text": "Motocap 2★", "url": "https://..." }
  ],
  "from": "Motorcycle Stuff St Peters",
  "from_url": "https://...",
  "video_url": "https://..."
}
```

**Multiple brands under one part** (e.g. Helmet, Gloves — used to compare two products side by side):
```json
{
  "part": "Helmet",
  "brand": [
    { "name": "Shark", "brand_flag": "🇫🇷", "image": "...", "versions": [...], "safety_rating": [...], "from": "...", "video_url": "..." },
    { "name": "Scorpion Exo", "brand_flag": "🇰🇷", "image": "...", "versions": [...], "safety_rating": [...], "from": "...", "video_url": "..." }
  ]
}
```

`script.js` inspects whether `brand` is a string or an array and picks the right rendering path (`renderBrandArrayRows` vs. the single-brand branch in `renderCardRows`).

Recognised fields (all optional except `part`, and the renderer skips anything empty):

| Field | Purpose |
|---|---|
| `image` | Product photo (string or array); shown at the top of the card |
| `part` | The row label, e.g. "Jacket" |
| `brand` / `brand_flag` / `brand_url` | Brand name, emoji flag, and optional link |
| `version` / `version_url` (or `versions: [{name, url}]`) | Specific product name, as a pill — links straight to a `.pdf` open in the in-page PDF viewer instead of a new tab |
| `safety_rating` | Array of `{ text, url? }` — pill-style badges, e.g. CE ratings, SHARP stars, Motocap stars |
| `from` / `from_url` | Retailer name and link |
| `video_url` | One URL or an array — rendered as pill links, auto-labelled by hostname (e.g. "YouTube") unless a `title`/`name` is given |
| `colours` / `colours_source_url` | Free text plus an optional "Source" button |
| *anything else* | Falls through to `renderGenericRow()` — any extra key/value pair is auto-formatted (underscores → spaces, Title Case) and rendered as a row, so the schema is extensible without touching `script.js` |

### 2. A shop gallery block

`"type": "shop_gallery"` — a grid of small clickable product thumbnails grouped into titled sections (Parts, Bike Care, Security, Style, Carrying, etc.), used for the miscellaneous accessories list at the end of the page. Supports an optional `note` per section and nested `note` groups with their own sub-grid and text (used for the first-aid kit contents breakdown).

### 3. A standalone video block

`"type": "standalone_video"` — a big 🎥 emoji link with a caption, used to break up the page (e.g. a full gear-review video) without being tied to a specific item.

**Why this structure:** every rendering function (`renderGenericRow`, `renderSafetyRow`, `renderVersionsRow`, `renderVideoRow`, `renderBrandArrayRows`, …) treats its input defensively — strings, single objects, and arrays are all normalised via `toArray()`/`isEmptyValue()` before rendering. In practice this means you rarely need to worry about exact shape when adding an entry: a single `safety_rating: "CE Level 2"` string and a `safety_rating: [{ "text": "CE Level 2" }]` array both render identically.

## `script.js`

Vanilla JS, no dependencies, ~840 lines, split into clear responsibilities:

- **`loadData()`** — fetches and parses `data.json`, kicks off rendering. Runs on `window.onload`.
- **Formatting helpers** — `formatLabel` (snake_case → LABEL CASE), `getVideoSiteName` (derives "YouTube" etc. from a URL's hostname), `getImageTooltipName` (derives a human-readable name from an image filename, e.g. `cleaner_chain.png` → "Cleaner Chain", used for gallery tooltips), `isPdf` (regex-checks a URL for a `.pdf` extension so PDF links can be routed into the lightbox instead of a new tab).
- **Row renderers** — one function per field type (`renderGenericRow`, `renderVersionsRow`, `renderSafetyRow`, `renderVideoRow`, `renderBrandArrayRows`), each returning an HTML string, all called from `renderCardRows(data)` which iterates a single entry's keys and dispatches to the right renderer, skipping fields already handled elsewhere (`brand_flag`, `version_url`, etc. are consumed alongside their parent key, not rendered again).
- **`renderAllData()`** — the main loop over `dataArray`; branches on `data.type` for gallery/video blocks, otherwise calls `renderImages()` + `renderCardRows()` and appends a `.data-card`.
- **Lightbox (`setupLightbox`)** — clicking any product image opens a full-screen image viewer; clicking a `.pdf-trigger` link instead opens the same overlay in "PDF mode," embedding the file via `<object>` (native browser PDF viewer) with an `<iframe>` fallback and an "Open in new tab" link. Closes on click-outside, the × button, or Escape.
- **Tooltips (`setupTooltips`)** — custom pill-shaped tooltip that follows the cursor (desktop `mouseenter`/`mousemove`) and also supports touch (`touchstart`/`touchmove`), showing the `data-tooltip` text set on each shop-gallery link.

There's no templating engine — HTML is built via template literals and injected with `innerHTML`. Since all `data.json` content is first-party (not user-submitted), this is an accepted, low-risk tradeoff for a static personal site rather than something hardened against injection.

## `styles.css`

A single stylesheet, mobile-first breakpoint at `768px`, built around one core visual idea: **rounded "badge cards" on a clean off-white background**, echoing a phone-app / spec-sheet aesthetic rather than a typical blog or shop layout.

**Styling choices, and why:**

- **Locked-viewport phone-card layout.** `body { height: 100vh; overflow: hidden }` plus a centered `.main-container` capped at `max-width: 768px` makes the whole site feel like a single scrollable "card" or app screen, not a scrolling document — `.content` is the only element that scrolls internally, with a slim teal custom scrollbar (`::-webkit-scrollbar`).
- **One accent colour, used everywhere.** `--primary: #01b8c6` (a teal/cyan) is the sole brand colour — header background, card borders, pill-link colour and hover states, tooltip background, scrollbar thumb. Keeping it to a single CSS variable makes a rebrand a one-line change.
- **Pill-shaped badges for everything link-like or tag-like** (`.version-tag`, `.safety-tag`, `.safety-item`): `border-radius: 9999px`, fixed `height: 34px`, subtle tinted background (`rgba(1, 184, 198, 0.1)`) that inverts to solid teal on hover with a slight `translateY(-1px)` lift — a consistent, tactile "chip" language reused for versions, safety ratings, and store links alike.
- **Thick-bordered rounded cards** (`.data-card`, `.shop-gallery-section`): a 3px teal border + large `border-radius: 24px` + soft drop shadow (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.4)`) gives each gear item real visual weight and separation, closer to a product spec sheet than a plain list.
- **Font: Inter**, loaded from Google Fonts (`@import` at the top of the stylesheet) rather than the `fonts/` directory — the `fonts/font.txt` file is a placeholder / leftover, not an active self-hosted font. Inter is used purely for its clean, neutral weight range (400/500/600) suited to dense label/value rows.
- **Label/value row pattern** (`.data-row`): every spec (Part, Brand, Version, Safety Rating, From…) is a flex row with the label left (uppercase, letter-spaced, muted grey `#64748b`) and the value right (bold, dark `#1f2937`), giving the page a consistent "spec sheet" rhythm. On mobile this collapses to a stacked column (`flex-direction: column`) since side-by-side no longer fits.
- **Purpose-built PDF lightbox mode** (`#lightbox.pdf-mode`): reuses the existing image lightbox overlay but swaps in an A4-proportioned (`aspect-ratio: 1/1.414`) `<object>`/`<iframe>` panel sized for readable documents, going full-viewport with a floating close button and "open in new tab" pill on mobile.
- **Emoji-driven iconography** — flags (`.flag`, sized up to 42px) and the 🎥 video-link glyph are used instead of an icon font/SVG sprite, keeping the whole site dependency-free.

## Adding or editing gear

1. Drop a product image into `images/` (PNG; a `.pdf` is also supported for spec sheets/size charts).
2. Add an entry to `data.json` following the shapes above — copy the closest existing entry as a template.
3. Refresh the page. No build step, no restart needed (it's a static fetch).

## Deployment

Fully static — the repo can be served as-is from any static host or CDN (e.g. Cloudflare Pages, per the comment at the top of `script.js` referencing `motorbike-5x6.pages.dev` / `motorbike.jdge.cc`). `robots.txt` explicitly allows all major crawlers.

## License

MIT — see [LICENSE](LICENSE).
