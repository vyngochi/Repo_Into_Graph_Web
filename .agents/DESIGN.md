# DESIGN.md — Website UI Design System

> Style: **Modern Development / Developer-First**
> Default mode: **Light First** (Light mode is primary, Dark mode is an optional extension)
> Inspired by: **Vite** (energy, vivid gradients, speed) + **Next.js** (minimalism, high contrast, sharp typography)

---

## 1. Design Philosophy

The interface aims for a **fast, clean, trustworthy** feel — similar to opening a modern technical docs site:

- **Clean first, decoration second**: white/very light gray backgrounds, generous whitespace, no excessive shadows or gradients.
- **Purposeful accents**: strong colors only appear on CTAs, badges, icons, and code highlights — never as large solid color blocks.
- **Typography-led**: text is the primary design element, not imagery.
- **Subtle motion**: fast hover/transitions (150–200ms), no heavy animations that distract.
- **Modular by design**: everything is token-based (spacing, radius, color) to scale like a real design system.

---

## 2. Color Palette

### 2.1 Brand Colors

| Name | Hex | Role |
|---|---|---|
| **Deep Blue** (primary) | `#0B3D91` | Primary — logo, links, main buttons, emphasized headings |
| **Deep Blue Hover** | `#092E6E` | Hover/active state for Primary |
| **Deep Green** (secondary) | `#0F5132` | Secondary — success badges, secondary buttons, "stable/build" icons |
| **Deep Green Hover** | `#0C3F27` | Hover/active state for Secondary |
| **Orange** (accent) | `#F97316` | Accent — standout CTAs, soft warnings, "new" tags/code highlights |
| **Orange Hover** | `#DD6410` | Hover/active state for Accent |

### 2.2 Background & Surface Colors (Light First)

| Name | Hex | Role |
|---|---|---|
| Background Base | `#FFFFFF` | Main page background |
| Background Subtle | `#F7F8FA` | Alternating sections, sidebar |
| Surface Card | `#FFFFFF` | Card background, border `#E5E7EB` |
| Surface Muted | `#F1F3F5` | Code block, input background |

### 2.3 Text & Border Colors

| Name | Hex | Role |
|---|---|---|
| Text Primary | `#0F172A` | Headings, main content |
| Text Secondary | `#475569` | Descriptions, captions |
| Text Muted | `#94A3B8` | Placeholders, metadata |
| Border Default | `#E2E8F0` | Card borders, dividers |
| Border Strong | `#CBD5E1` | Input border near focus state |

### 2.4 Semantic Colors

| Name | Hex | Role |
|---|---|---|
| Success | `#0F5132` (reuses Deep Green) | Success messages |
| Warning | `#F97316` (reuses Orange) | Warnings |
| Error | `#DC2626` | Errors |
| Info | `#0B3D91` (reuses Deep Blue) | Informational messages |

### 2.5 Accent Gradient (used sparingly, Vite-style)

```css
--gradient-hero: linear-gradient(135deg, #0B3D91 0%, #0F5132 55%, #F97316 100%);
--gradient-cta: linear-gradient(90deg, #0B3D91 0%, #0F5132 100%);
```
Only use for: hero section glow/border accents, special CTA buttons, logo mark. **Do not** use gradients for full-page backgrounds or body text.

---

## 3. Typography

**Fonts:**
- Headings & UI: `Inter` or `Geist Sans` (Next.js-style) — modern, sharp sans-serif.
- Code / mono: `JetBrains Mono` or `Geist Mono` — for snippets, terminal, version badges.

**Type Scale:**

| Level | Size / Line-height | Weight | Used for |
|---|---|---|---|
| Display | 56px / 1.1 | 700 | Hero title |
| H1 | 40px / 1.2 | 700 | Page title |
| H2 | 32px / 1.25 | 600 | Section title |
| H3 | 24px / 1.3 | 600 | Card/group title |
| Body Large | 18px / 1.6 | 400 | Intro paragraphs |
| Body | 16px / 1.6 | 400 | Main content |
| Small | 14px / 1.5 | 400 | Captions, labels |
| Code | 14px / 1.5 | 500 (mono) | Inline code, snippets |

---

## 4. Layout & Spacing

- **Grid**: 12-column, max-width container `1280px`, gutter `24px`.
- **Spacing scale (4px base)**: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
- **Radius**: `--radius-sm: 6px` (input, tag), `--radius-md: 10px` (card), `--radius-lg: 16px` (hero panel, modal).
- **Shadow (very subtle, Vercel/Next.js-style)**:
  ```css
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.12);
  ```

---

## 5. UI Components

### 5.1 Buttons
- **Primary**: `Deep Blue` background, white text, hover → `Deep Blue Hover`, `md` radius.
- **Secondary**: `Deep Green` border, `Deep Green` text, transparent background, hover → `#0F513110` background.
- **Accent/CTA**: `Orange` background, white text, used for the single highest-priority action (e.g. "Get Started", "Deploy Now").
- **Ghost**: no border, `Text Secondary` text, hover changes to `Text Primary`.

### 5.2 Card
- White background, 1px `Border Default`, `md` radius, `sm` shadow, hover → `md` shadow + slight `translateY(-2px)`.

### 5.3 Navbar
- White background, `backdrop-blur` on scroll, bottom `Border Default`, logo on the left (gradient mark), menu in the center, CTAs "Docs" (ghost) + "Get Started" (Primary) on the right.

### 5.4 Code Block
- `Surface Muted` background or dark `#0F172A` (the single intentional dark accent — Vite/Next.js docs style), muted line numbers, syntax highlighting using the 3 brand colors + light blue, light green, light orange for tokens.

### 5.5 Badge / Tag
- Pill shape, light-tint background of the matching color (e.g. `#0B3D9114` for info), bold text in the same hue.

### 5.6 Hero Section
- White background, large `Display` title, `Body Large` description in `Text Secondary`, 2 CTAs (Primary + Ghost), a soft gradient glow below (`--gradient-hero` at 8–12% opacity) as a decorative touch — reminiscent of the Vite homepage.

---

## 6. Iconography & Imagery
- Outline-style icons, `1.5–2px` stroke, similar to `Lucide Icons`.
- Imagery: prefer flat vector illustrations or UI screenshots with subtle borders + soft shadows; avoid heavy commercial-style stock photos.

---

## 7. Motion

- Default transition: `all 150ms ease-out`.
- Slight hover scale for standout cards: `transform: scale(1.02)`.
- Page transitions: fade + slight translateY (`8px`), duration `200–250ms`.

---

## 8. Dark Mode (extension, not default)

| Token | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#0B1120` |
| Surface | `#F7F8FA` | `#111827` |
| Text Primary | `#0F172A` | `#F1F5F9` |
| Deep Blue | `#0B3D91` | `#3B82F6` (brightened for sufficient contrast) |
| Deep Green | `#0F5132` | `#22C55E` |
| Orange | `#F97316` | `#FB923C` |

---

## 9. Combined Tokens (CSS Variables)

```css
:root {
  /* Brand */
  --color-primary: #0B3D91;
  --color-primary-hover: #092E6E;
  --color-secondary: #0F5132;
  --color-secondary-hover: #0C3F27;
  --color-accent: #F97316;
  --color-accent-hover: #DD6410;

  /* Surface */
  --bg-base: #FFFFFF;
  --bg-subtle: #F7F8FA;
  --surface-muted: #F1F3F5;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;

  /* Border & radius */
  --border-default: #E2E8F0;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Font */
  --font-sans: 'Inter', 'Geist Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Geist Mono', monospace;
}
```

---

## 10. Color Usage Guidelines (recommended ratio)

- **60%** — white/light gray backgrounds (Background, Surface)
- **30%** — neutral text and borders (Text Primary/Secondary, Border)
- **10%** — the 3 brand colors (Deep Blue, Deep Green, Orange), distributed by priority: Blue for branding/links, Green for positive states, Orange for the action that needs the most attention.

Golden rule: **each screen should have only one Orange CTA** to preserve a "single focal point" effect.
