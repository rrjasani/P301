# Design System — Rohan Jasani, Clinical Herbalist

Derived from the existing website homepage, marketing card, and business card. Colors are sampled visually from the screenshots and are close approximations — verify against source art before print production.

---

## 1. Brand Essence

**Positioning:** Evidence-based herbal medicine — natural, but clinical and credible.

**Visual character:** Sunlit and botanical. Golden yellows and leaf greens carry the "plant" idea; earthy browns and dark olive keep it grounded and professional rather than new-age. Photography is always real botanicals on white, never illustration or stock wellness imagery.

**Tone of voice:** Direct, plainspoken, second person. Leads with the reader's problem ("Do you lack energy?"), then offers help. Avoids hype, medical jargon, and exclamation-heavy claims. Short lines, generous line breaks.

---

## 2. Color Palette

### Primary

| Token | Hex | Use |
|---|---|---|
| `--gold` | `#F2CE00` | Signature brand color. Sidebar panels, testimonial band, card banner, callout blocks. |
| `--leaf-green` | `#6E9219` | Primary headings, links, "Herbal Medicine can help!" emphasis. |
| `--bark-brown` | `#4E3F28` | Body headings, name lockup, dark text on gold. |

### Secondary

| Token | Hex | Use |
|---|---|---|
| `--forest` | `#414D26` | Top navigation bar, footer, dark UI chrome. |
| `--rust` | `#C9531F` | Call-to-action buttons only ("Schedule Now", "Subscribe"). |
| `--moss` | `#4C7A1E` | Secondary buttons ("Tell Me More"). |
| `--sage` | `#7FA83C` | Checkmark icons, bullets, small accents. |
| `--amber` | `#D99B1C` | Logo emblem gradient highlight. |
| `--amber-deep` | `#8A6A10` | Logo emblem gradient shadow, emblem ring. |

### Neutrals

| Token | Hex | Use |
|---|---|---|
| `--white` | `#FFFFFF` | Page background, content cards, form fields. |
| `--off-white` | `#F7F6F1` | Alternate section background. |
| `--gray-body` | `#4A4A4A` | Body copy. |
| `--gray-muted` | `#9A9A93` | Captions, image credits, location lines. |
| `--gray-line` | `#DEDDD6` | Rules, field borders. |

### Usage Rules

- Gold is a **block** color, not a text color. Never set type in gold; set dark brown or forest type *on* gold.
- Rust is reserved for conversion actions. One rust button per view where possible.
- Green headings on white; brown headings when the section needs to feel more editorial than promotional.
- Maintain a roughly 60 / 25 / 15 split: white, gold, green+brown.
- Contrast: brown `#4E3F28` on gold `#F2CE00` passes AA. White on gold does **not** — never use it.

---

## 3. Typography

The identity uses a humanist / soft-geometric sans throughout — no serifs anywhere.

**Recommended stack**

```css
--font-display: "Museo Sans", "Ubuntu", "Source Sans 3", system-ui, sans-serif;
--font-body:    "Open Sans", "Source Sans 3", system-ui, sans-serif;
```

**Scale**

| Role | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page headline (H1) | 34–38px | 700 | `--leaf-green` | e.g. "Experience the Power of Herbs" |
| Section heading (H2) | 26–28px | 700 | `--bark-brown` | e.g. "What can Herbal Medicine help with?" |
| Panel heading (H3) | 17–18px | 700 | `--bark-brown` | Sidebar boxes, with small icon |
| Body | 15–16px / 1.75 | 400 | `--gray-body` | Loose leading; question lists sit on their own lines |
| Lead emphasis | 17px | 700 | `--leaf-green` | Single-line payoff statements |
| Nav | 13px | 700, uppercase, +0.06em | `#FFFFFF` | On `--forest` |
| Button label | 13–14px | 700, uppercase | `#FFFFFF` | |
| Caption | 11px, italic | 400 | `--gray-muted` | Photo credits ("St. John's Wort", "Herbs") |
| Pull quote | 15px, italic | 400 | `--bark-brown` | Centered, flanked by oversized quote marks |

**Mixed-weight headline treatment** (from the marketing card): within a single tagline, bold the meaningful words and keep connectors light — *"**support** your **health** the way **nature** intended."* Use sparingly, once per piece.

---

## 4. Logo & Emblem

- **Emblem:** a five-leaf sprig, dark green, centered in a circular amber-to-bronze radial gradient with a thin bronze ring. Works at small sizes down to ~28px.
- **Wordmark:** "Rohan Jasani" in brown, 700, with the descriptor above or below in a smaller size — "Herbalist" (site) or "Clinical Herbalist" (print), leaf green or brown.
- **Clear space:** minimum one emblem-radius on all sides.
- **Backgrounds:** emblem on white, gold, or a leaf-texture photo. Never on a busy mid-tone image without the ring.

---

## 5. Components

### Buttons

```
Primary   background --rust    | white uppercase label | 3px radius | ~12px 22px padding | optional leading icon
Secondary background --moss    | white uppercase label | same geometry
```

Icons sit left of the label at ~14px, same color as the label. No gradients, no drop shadows, no full pills.

### Sidebar Panels

Solid `--gold` block, ~22px internal padding, square corners. Heading in brown with a small brown icon, one or two short supporting lines, then either a CTA button or a form. Stacked with ~18px gutters.

### Forms

White fields with a `--gray-line` border, ~34px tall, square corners. Labels above the field in brown, 13px, required fields marked with a rust asterisk. Submit button uses the primary rust style.

### Testimonial Band

Full-bleed `--gold` strip. Centered italic quote in brown, flanked by large low-contrast quote glyphs. Attribution: name in `--rust` 700, city in `--gray-muted` 11px beneath. Prev/next chevrons centered above the quote.

### Benefit / Condition Lists

Two columns. Each item prefixed by a filled `--sage` circle with a white checkmark, 14px, 8px gap. Items are short noun phrases in sentence case, alphabetized.

### Navigation

`--forest` bar, full width, ~44px tall. Uppercase white links with ~18px horizontal padding; active item gets a darker background block. Search field right-aligned, white, rounded, with a magnifier glyph.

---

## 6. Layout

- Content width ~1100px, 12-column grid, 24px gutters.
- Main content ~2/3, sidebar ~1/3.
- Section rhythm: 56–72px vertical padding. Alternate white and full-bleed gold bands to break up long pages.
- Left-aligned text throughout; center alignment only inside the testimonial band.
- Print pieces (business card, marketing card) use a vertical split: type on the left, botanical or leaf-texture imagery on the right, with a gold footer bar carrying the name, title, and URL.

---

## 7. Imagery

- **Subject:** whole plants, cut herbs, tinctures in amber bottles.
- **Background:** pure white, silhouetted, with a soft natural shadow. No borders or frames.
- **Secondary texture:** backlit green leaf macro, used as a background field for print pieces and the emblem's habitat.
- **Captioning:** italic gray common name centered beneath the image.
- **Avoid:** people in spa settings, mortar-and-pestle clichés, heavy filters, flat vector illustration.

---

## 8. Content Patterns

**Problem-first hero:** a stack of short questions, one per line, each ending in a question mark, followed by a single green affirmative line.

**Condition list:** two alphabetized columns of checkmarked conditions, qualifiers in parentheses — "Infection (Chronic, Subclinical, Acute)".

**Value stack** (print): four to six lowercase phrases, one per line, no punctuation — "expert evidence-based herbal advice & guidance".

**Offer panels:** headline benefit, two short reassurances ("No risk! No obligation!"), then the action.

---

## 9. CSS Tokens

```css
:root {
  /* Primary */
  --gold:        #F2CE00;
  --leaf-green:  #6E9219;
  --bark-brown:  #4E3F28;

  /* Secondary */
  --forest:      #414D26;
  --rust:        #C9531F;
  --moss:        #4C7A1E;
  --sage:        #7FA83C;
  --amber:       #D99B1C;
  --amber-deep:  #8A6A10;

  /* Neutrals */
  --white:       #FFFFFF;
  --off-white:   #F7F6F1;
  --gray-body:   #4A4A4A;
  --gray-muted:  #9A9A93;
  --gray-line:   #DEDDD6;

  /* Type */
  --font-display: "Museo Sans", "Ubuntu", "Source Sans 3", system-ui, sans-serif;
  --font-body:    "Open Sans", "Source Sans 3", system-ui, sans-serif;

  /* Space */
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px; --space-xl: 40px; --space-2xl: 64px;

  /* Shape */
  --radius-sm: 3px;
  --radius-panel: 0px;
  --border: 1px solid var(--gray-line);
}
```

---

## 10. Do / Don't

| Do | Don't |
|---|---|
| Set dark brown type on gold panels | Set white or green type on gold |
| Keep one rust CTA per screen | Use rust for headings or links |
| Silhouette botanicals on white | Place plants on colored or textured fills |
| Keep corners square or barely rounded | Use pills, large radii, or drop shadows |
| Write short, second-person, problem-first lines | Write dense paragraphs or clinical jargon |
| Use the emblem at consistent scale with clear space | Recolor or outline-only the emblem |
