# Editorial Theme — Design System Rules

How UI in this project must look and be built. Read this before writing any
component, page, or style. Source of truth: `src/index.css`.

## 1. The one rule that breaks everything

The theme is **scoped to the `.editorial` class**, not to `:root`.

`src/index.css` defines the shadcn tokens twice: neutral grayscale defaults in
`:root`/`.dark`, and the warm editorial palette inside `.editorial`, which
**re-points the same token names**. A component inside the scope inherits the
editorial look with no rewriting. A component outside it silently renders in
default gray, and any `var(--editorial-*)` it uses resolves to nothing.

```tsx
// Page shells opt in at the root element.
<div className="editorial mx-auto w-full max-w-[1600px] px-8 pt-12 pb-16">
```

**Portalled surfaces escape the DOM subtree and must opt in again.** This applies
to every dialog, sheet, drawer, popover, select dropdown, tooltip, and toast.
Forgetting this is the single most common theme bug in this codebase.

```tsx
<SelectContent className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)]">
<PopoverContent className="editorial ..."> 
<SheetContent className="editorial ...">
```

## 2. Palette

Warm, paper-like, low contrast. Coral is the only accent. Never pure black,
never pure white, never a saturated primary.

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--editorial-canvas` | `#f8f3ec` | Deepest surface: page canvas, inset tracks, preview backdrops |
| `--muted` | `#f6f0e9` | Sunken fills, slider tracks |
| `--editorial-surface` | `#fdfbf8` | Panel/sidebar background |
| `--background` / `--card` | `#fffdfb` | Raised cards, active segmented items |
| `--popover` / `--secondary` | `#fff9f2` | Overlays, input fills |

Depth order, low to high: `canvas` → `surface` → `card`. An "active" or
"selected" item is usually one step **lighter** than its track, plus a shadow.

### Text — never pure black
| Token | Value | Use |
|---|---|---|
| `--foreground` | `#2e2825` | Headings, primary text, active labels |
| `--editorial-body` | `#665f5b` | Body copy, field labels |
| `--editorial-subtle` | `#a49a95` | Hints, captions, inactive tabs, eyebrows |
| `--editorial-disabled` | `#ccc5be` | Disabled text |

### Coral accent — use sparingly
| Token | Value | Use |
|---|---|---|
| `--primary` | `#ee7d69` | Primary buttons, focus ring, selected icon |
| `--editorial-primary-hover` | `#e56b56` | Hover |
| `--editorial-primary-pressed` | `#d95e49` | Active/pressed |
| `--editorial-primary-light` | `#ffe5de` | Hover wash |
| `--editorial-primary-selected` | `#ffe9e5` | Selected wash (= `--accent`) |
| `--editorial-primary-ring` | `#f4b3a8` | Hover borders, focus ring |

At most **one** coral element per control group. A segmented control colours
only the selected icon, not the whole tile.

### Borders and status
`--border` `#e8ddd4` (structural) · `--editorial-border-light` `#f2ece6`
(internal dividers, hairlines on raised items) · `--input` `#ddd3cb` (control
outlines) · `--ring` = coral.

`--destructive` `#c05b45` · `--editorial-success` `#7cbf95` ·
`--editorial-blue` `#74a7ff` · `--editorial-purple` `#8971c5` (+ `-light`) ·
`--editorial-note` `#fff2bc`.

### Never do this
```tsx
// WRONG — ignores the theme entirely, stays gray/blue in editorial scope
className="bg-red-500 text-white border-gray-200 bg-secondary text-muted-foreground"

// RIGHT
className="bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--border)]"
```
Raw Tailwind palette colours (`red-500`, `gray-200`, `blue-600`, …) are banned in
app code. Use `var(--token)`. Bare shadcn utilities (`bg-card`, `text-foreground`)
are acceptable **inside** the scope since those tokens are re-pointed, but
explicit `var()` is preferred in feature code for clarity.

## 3. Typography

- Sans: `Inter Variable` (`--font-sans`), the default for everything.
- Display: `.font-display` → Cormorant Garamond serif. **Major headings only** —
  page titles, panel titles. Never body, never buttons, never labels.
- `.editorial-eyebrow` → 12px, 600, uppercase, `0.08em` tracking. Small label
  above a heading. Pair with `--editorial-subtle`.

```tsx
<p className="editorial-eyebrow text-[var(--editorial-subtle)]">Design</p>
<h3 className="font-display mt-1 text-2xl text-[var(--foreground)]">Theme settings</h3>
```

Scale in dense panels: label `text-sm font-medium`, hint `text-xs leading-5`,
tile label `text-[11px]`.

## 4. Radius

Generous and consistent. The look is soft, not sharp.

| Radius | Use |
|---|---|
| `rounded-[12px]` | Dropdown items, small tiles |
| `rounded-[14px]` | Inputs, selects, compact controls (44px tall) |
| `rounded-[16px]`–`[18px]` | Buttons, overlays, inset tracks |
| `rounded-[22px]`–`[24px]` | Cards, panels, image frames |
| `rounded-full` | Pills, large inputs (52px tall), tab tracks |

Two control heights: **44px** compact (drawers, side panels) and **52px** roomy
(main settings). Do not invent others.

## 5. Elevation and motion

Shadows are warm and soft, never dark or heavy.

- `.editorial-shadow` — `0 20px 60px rgba(110,80,60,.08)`, large cards
- `.editorial-shadow-md` — `0 12px 40px rgba(90,70,50,.06)`, panels, overlays
- `.editorial-shadow-sm` — subtle lift
- Selected item inside a track: `shadow-[0_2px_8px_rgba(24,20,18,.06)]`
- Coral button glow: ``

`.editorial-transition` — 250ms ease-out on colour, border, shadow, transform,
opacity. Put it on anything interactive.

`.editorial-vibrate` — 300ms shake to draw attention to an unresolved action.
Use rarely.

Signature interaction: **lift on hover, settle on press.**
```
hover:-translate-y-0.5   active:translate-y-0 active:scale-[.98]
```
Both are disabled under `prefers-reduced-motion`; keep it that way.

Icons: lucide only. `.editorial svg` sets `stroke-width: 1.75` — unfilled and
light. Standard sizes 16px (`h-4 w-4`) or 18px.

## 6. Reusable class constants

Do not retype long class strings. Import them.
`src/pages/FormBuilder/components/settings/primitives.tsx` exports:

- `PRIMARY_BUTTON_CLASS` — coral fill, glow, lift
- `SECONDARY_BUTTON_CLASS` — card fill, coral-ring hover
- `DESTRUCTIVE_BUTTON_CLASS` — tinted `--destructive`, never solid red

`PublishDialog.tsx` holds the 52px equivalents. If you need a new variant,
extend these rather than inlining a one-off.

## 7. Settings/form primitives

Before building a labeled control, check
`src/pages/FormBuilder/components/settings/primitives.tsx`. It already has:

`SettingsSection` · `ToggleRow` · `RequiredToggle` · `TextSetting` ·
`NumberSetting` · `InputSetting` · `SelectSetting` · `IconChoiceSetting` ·
`ColorSetting` · `RangeSetting` · `ConfirmPopover` · `CoverImageField`

All are **data-driven** — pass an options array, not repeated JSX. Follow that
pattern for anything new.

```tsx
<SelectSetting label="Font Source" value={v} options={FONT_SOURCE_OPTIONS} onChange={set} />
<IconChoiceSetting label="Content Alignment" value={v} options={ALIGNMENT_OPTIONS} onChange={set} />
```

### Choosing a control
- 2–5 visual options (alignment, size, radius) → `IconChoiceSetting`, an icon
  segmented control. Faster than a dropdown and shows all choices at once.
- Many options or long text → `SelectSetting`.
- Boolean → `ToggleRow`.

### Segmented control anatomy
Inset track + raised active item. Reuse this for tabs and choice groups:
```
track:  rounded-[16px] border border-[var(--editorial-border-light)]
        bg-[var(--editorial-canvas)] p-1.5
item:   transparent, text-[var(--editorial-subtle)]
active: bg-[var(--card)] + hairline border + soft shadow
        + text-[var(--foreground)] + coral icon
```

## 8. Component sourcing

1. Reuse a primitive from `settings/primitives.tsx`.
2. Else compose from `src/components/ui/*` (shadcn over **Base UI**, not Radix).
3. Only then write new markup.

Base UI API notes — it is **not** Radix, and the differences bite:

- `onValueChange` receives `(value, eventDetails)` and may pass `null`. Guard it.
- State styling uses bare attribute variants: `data-active:`, `data-checked:`,
  `data-open:`, `data-disabled:`, `data-unchecked:`. There is **no**
  `data-[state=active]` — that is Radix syntax and will silently never match.
- Triggers take `render={<Button/>}`, not `asChild`.
- Overlays expose `data-slot` hooks (`select-content`, `popover-content`,
  `sheet-content`, …), useful for outside-click guards.

`TabsList` has a `variant` prop. The `line` variant hard-codes
`data-active:bg-transparent`, which cancels a raised-card active state. For
segmented pill tabs, leave the variant at `default` and override the list
classes instead.

## 9. Checklist before you finish

- [ ] Root element or portalled surface carries `editorial`
- [ ] Zero raw Tailwind palette colours; all colour via `var(--token)`
- [ ] Text uses foreground/body/subtle, never `#000`
- [ ] Radius from the scale; control height 44px or 52px
- [ ] Interactive elements have `.editorial-transition`
- [ ] At most one coral element per group
- [ ] Serif limited to `.font-display` headings
- [ ] Existing primitive reused instead of duplicated markup
- [ ] Base UI state variants (`data-active:`), never Radix `data-[state=...]`
- [ ] `npx tsc -b` and `npx eslint <files>` pass
