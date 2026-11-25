import type { CSSProperties } from "react";
import type {
  CoverImage,
  CoverImageEdits,
  CoverImageFocalPoint,
  CoverImageLayout,
  IFormTheme,
} from "../types/common";

export interface CoverImageFilterPreset {
  id: string;
  label: string;
  cssFilter: string;
}

export const COVER_IMAGE_FILTERS: readonly CoverImageFilterPreset[] = [
  { id: "original", label: "Original", cssFilter: "" },
  { id: "duotone", label: "Duotone", cssFilter: "grayscale(1) contrast(1.25) brightness(1.05)" },
  { id: "1977", label: "1977", cssFilter: "contrast(1.1) brightness(1.1) saturate(1.3) sepia(0.3)" },
  { id: "aden", label: "Aden", cssFilter: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)" },
  { id: "brannan", label: "Brannan", cssFilter: "sepia(0.5) contrast(1.4)" },
  { id: "brooklyn", label: "Brooklyn", cssFilter: "contrast(0.9) brightness(1.1) saturate(0.9)" },
  { id: "clarendon", label: "Clarendon", cssFilter: "contrast(1.2) saturate(1.35)" },
  { id: "earlybird", label: "Earlybird", cssFilter: "contrast(0.9) sepia(0.28)" },
  { id: "gingham", label: "Gingham", cssFilter: "brightness(1.05) hue-rotate(-10deg) contrast(0.95)" },
  { id: "inkwell", label: "Inkwell", cssFilter: "sepia(0.3) contrast(1.1) brightness(1.1) grayscale(1)" },
  { id: "lark", label: "Lark", cssFilter: "contrast(0.9) brightness(1.1) saturate(1.15)" },
  { id: "moon", label: "Moon", cssFilter: "grayscale(1) contrast(1.1) brightness(1.1)" },
];

export function resolveCoverImageLayout(
  coverImage?: CoverImage | null,
  isMobile?: boolean,
): CoverImageLayout {
  if (!coverImage) return "top";
  if (isMobile) {
    if (coverImage.mobileLayout) return coverImage.mobileLayout;
    if (coverImage.layout === "left" || coverImage.layout === "right") return "top";
  }
  return coverImage.layout ?? "top";
}

export function getCoverImageFilterCss(
  brightness?: number,
  edits?: CoverImageEdits | null,
): string | undefined {
  const parts: string[] = [];
  if (brightness !== undefined && brightness !== 0) {
    parts.push(`brightness(${(100 + brightness) / 100})`);
  }
  if (edits?.contrast !== undefined && edits.contrast !== 0) {
    parts.push(`contrast(${(100 + edits.contrast) / 100})`);
  }
  if (edits?.saturation !== undefined && edits.saturation !== 0) {
    parts.push(`saturate(${(100 + edits.saturation) / 100})`);
  }
  if (edits?.filter && edits.filter !== "original") {
    const preset = COVER_IMAGE_FILTERS.find((f) => f.id === edits.filter);
    if (preset?.cssFilter) parts.push(preset.cssFilter);
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function getCoverImageFilterStyle(brightness?: number): CSSProperties | undefined {
  const filter = getCoverImageFilterCss(brightness);
  return filter ? { filter } : undefined;
}

export function getCoverImageObjectPosition(
  focalPoint?: CoverImageFocalPoint | null,
): string | undefined {
  if (!focalPoint) return undefined;
  return `${focalPoint.x}% ${focalPoint.y}%`;
}

export function getCoverImageStyle(
  coverImage?: CoverImage | null,
): CSSProperties | undefined {
  if (!coverImage) return undefined;
  const edits = coverImage.edits;
  const filter = getCoverImageFilterCss(coverImage.brightness, edits);
  const objectPosition = getCoverImageObjectPosition(coverImage.focalPoint);

  const crop = edits?.crop;
  const hasCrop = Boolean(
    crop && (crop.x !== 0 || crop.y !== 0 || crop.width !== 100 || crop.height !== 100),
  );
  const cropScale =
    hasCrop && crop
      ? Math.max(100 / Math.max(1, crop.width), 100 / Math.max(1, crop.height))
      : 1;
  const cx = crop ? crop.x + crop.width / 2 : 50;
  const cy = crop ? crop.y + crop.height / 2 : 50;
  const tx = hasCrop ? 50 - cx : 0;
  const ty = hasCrop ? 50 - cy : 0;

  const zoomScale = (coverImage.zoom ?? 100) / 100;
  const totalScale = zoomScale * cropScale;
  const scaleX = totalScale * (edits?.flipH ? -1 : 1);
  const scaleY = totalScale * (edits?.flipV ? -1 : 1);
  const totalAngle = (edits?.rotate ?? 0) + (edits?.angle ?? 0);

  const transforms: string[] = [];
  if (scaleX !== 1 || scaleY !== 1) {
    transforms.push(`scale(${scaleX}, ${scaleY})`);
  }
  if (totalAngle !== 0) {
    transforms.push(`rotate(${totalAngle}deg)`);
  }
  if (tx !== 0 || ty !== 0) {
    transforms.push(`translate(${tx}%, ${ty}%)`);
  }

  if (!filter && !objectPosition && transforms.length === 0) return undefined;

  return {
    ...(filter ? { filter } : {}),
    ...(objectPosition ? { objectPosition } : {}),
    ...(transforms.length > 0
      ? {
          transformOrigin: hasCrop ? "50% 50%" : objectPosition ?? "50% 50%",
          transform: transforms.join(" "),
        }
      : {}),
  };
}

export const DEFAULT_FORM_THEME = {
  primaryColor: "#000000",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  questionColor: "#111111",
  answerColor: "#111111",
  buttonColor: "#000000",
  buttonTextColor: "#ffffff",
  alignment: "left" as const,
  fontSize: "medium" as const,
  roundCorners: "medium" as const,
  font: {
    family: "Inter",
    source: "google" as const,
  },
};

export function resolveFormTheme(theme?: IFormTheme | null) {
  return {
    primaryColor: theme?.primaryColor || DEFAULT_FORM_THEME.primaryColor,
    backgroundColor: theme?.backgroundColor || DEFAULT_FORM_THEME.backgroundColor,
    textColor: theme?.textColor || DEFAULT_FORM_THEME.textColor,
    questionColor: theme?.questionColor || DEFAULT_FORM_THEME.questionColor,
    answerColor: theme?.answerColor || DEFAULT_FORM_THEME.answerColor,
    buttonColor: theme?.buttonColor || DEFAULT_FORM_THEME.buttonColor,
    buttonTextColor: theme?.buttonTextColor || DEFAULT_FORM_THEME.buttonTextColor,
    alignment: theme?.alignment || DEFAULT_FORM_THEME.alignment,
    fontSize: theme?.fontSize || DEFAULT_FORM_THEME.fontSize,
    roundCorners: theme?.roundCorners || DEFAULT_FORM_THEME.roundCorners,
    font: {
      family: theme?.font?.family || DEFAULT_FORM_THEME.font.family,
      source: theme?.font?.source || DEFAULT_FORM_THEME.font.source,
      url: theme?.font?.url,
    },
  };
}

/** A theme with every page filled in, as returned by `resolveFormTheme`. */
export type ResolvedFormTheme = ReturnType<typeof resolveFormTheme>;

/** Dropdown menu border tinted with the form's answer colour. */
export function getDropdownMenuStyle(color?: string): React.CSSProperties | undefined {
  return color ? { borderColor: `color-mix(in oklab, ${color} 25%, transparent)` } : undefined;
}

/** Dropdown option row: answer colour text, tinted highlight when active. */
export function getDropdownItemStyle(
  color: string | undefined,
  active: boolean,
): React.CSSProperties | undefined {
  if (!color) return undefined;
  return {
    color,
    backgroundColor: active ? `color-mix(in oklab, ${color} 10%, transparent)` : undefined,
  };
}

export function getCornerRadiusClass(radius?: string): string {
  switch (radius) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-md";
    case "medium":
      return "rounded-xl";
    case "large":
      return "rounded-2xl";
    case "full":
      return "rounded-full";
    default:
      return "rounded-xl";
  }
}

export function getCornerRadiusCss(radius?: string): string {
  switch (radius) {
    case "none":
      return "0px";
    case "small":
      return "6px";
    case "medium":
      return "12px";
    case "large":
      return "16px";
    case "full":
      return "9999px";
    default:
      return "12px";
  }
}

export function getFontSizeClasses(size?: string) {
  switch (size) {
    case "small":
      return {
        question: "text-[clamp(1.125rem,0.95rem+0.8vw,1.375rem)]",
        helper: "text-[clamp(0.8125rem,0.725rem+0.4vw,0.9375rem)]",
        input: "text-[14px]",
        button: "text-[14px]",
      };
    case "large":
      return {
        question: "text-[clamp(1.75rem,1.35rem+1.8vw,2.5rem)]",
        helper: "text-[clamp(1.125rem,0.95rem+0.8vw,1.375rem)]",
        input: "text-[18px]",
        button: "text-[18px]",
      };
    case "medium":
    default:
      return {
        question: "text-[clamp(1.375rem,1.1rem+1.2vw,1.875rem)]",
        helper: "text-[clamp(0.9375rem,0.825rem+0.5vw,1.125rem)]",
        input: "text-[16px]",
        button: "text-[16px]",
      };
  }
}

/**
 * Question titles inside a page sit one step below the page title, in both the
 * builder and the fill view.
 */
export function getQuestionTitleClasses(size?: string) {
  switch (size) {
    case "small":
      return "text-[clamp(0.9375rem,0.85rem+0.4vw,1.0625rem)]";
    case "large":
      return "text-[clamp(1.1875rem,1rem+0.8vw,1.375rem)]";
    case "medium":
    default:
      return "text-[clamp(1.0625rem,0.925rem+0.6vw,1.25rem)]";
  }
}

export function loadThemeFont(font?: IFormTheme["font"]) {
  if (!font?.family) return;

  if (font.source === "google") {
    const fontId = `google-font-${font.family.replace(/\s+/g, "-").toLowerCase()}`;
    if (typeof document !== "undefined" && !document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  } else if (font.source === "custom" && font.url) {
    const fontId = `custom-font-${font.family.replace(/\s+/g, "-").toLowerCase()}`;
    if (typeof document !== "undefined" && !document.getElementById(fontId)) {
      const style = document.createElement("style");
      style.id = fontId;
      style.textContent = `
        @font-face {
          font-family: "${font.family}";
          src: url("${font.url}");
        }
      `;
      document.head.appendChild(style);
    }
  }
}
