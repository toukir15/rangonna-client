export type ColorThemeId = "saffron";

export type ColorTheme = {
  id: ColorThemeId;
  name: string;
  description: string;
  ivory: string;
  pearl: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  ink: string;
  muted: string;
  glow: string;
  swatches: [string, string, string];
};

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "saffron",
    name: "Burgundy",
    description: "Deep burgundy accents",
    ivory: "#FDF3F3",
    pearl: "#f5f1ea",
    primary: "#7f1d1d",
    primaryLight: "#b54a4a",
    primaryDark: "#5c1515",
    secondary: "#7f1d1d",
    secondaryLight: "#b54a4a",
    ink: "#1c1208",
    muted: "#7a6550",
    glow: "127, 29, 29",
    swatches: ["#faf7f2", "#7f1d1d", "#5c1515"],
  },
];

export const DEFAULT_COLOR_THEME: ColorThemeId = "saffron";


export function getColorTheme(id: string): ColorTheme {
  return (
    COLOR_THEMES.find((t) => t.id === id) ??
    COLOR_THEMES.find((t) => t.id === DEFAULT_COLOR_THEME)!
  );
}
