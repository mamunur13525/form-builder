import type { IFormTheme } from "../types/common";

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
  backgroundImage: null,
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
    backgroundImage: theme?.backgroundImage ?? null,
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
