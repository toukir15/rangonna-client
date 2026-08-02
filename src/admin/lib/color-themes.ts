export type ColorThemeId =
  | "ivory"
  | "mint"
  | "sage"
  | "emerald"
  | "blush"
  | "pearl"
  | "saffron"
  | "lavender"
  | "ocean"
  | "plum"
  | "mocha"
  | "ruby"
  | "sky"
  | "noir"
  | "coral"
  | "olive";

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
    id: "ivory",
    name: "Soft Ivory",
    description: "Classic gold & rose",
    ivory: "#f8f6f2",
    pearl: "#faf8f4",
    primary: "#c9a227",
    primaryLight: "#e8d48b",
    primaryDark: "#a4841f",
    secondary: "#b76e79",
    secondaryLight: "#d4a5ad",
    ink: "#0a0a0a",
    muted: "#6b6560",
    glow: "201, 162, 39",
    swatches: ["#f8f6f2", "#c9a227", "#b76e79"],
  },
  {
    id: "mint",
    name: "Pale Mint",
    description: "Fresh teal & coral",
    ivory: "#f2f7f3",
    pearl: "#ebf2ed",
    primary: "#2f6f5e",
    primaryLight: "#5a9a86",
    primaryDark: "#1f4f42",
    secondary: "#c4786a",
    secondaryLight: "#d9a297",
    ink: "#0a1210",
    muted: "#5c6b64",
    glow: "47, 111, 94",
    swatches: ["#f2f7f3", "#2f6f5e", "#c4786a"],
  },
  {
    id: "sage",
    name: "Soft Sage",
    description: "Herbal green & clay",
    ivory: "#eef3eb",
    pearl: "#e5ece2",
    primary: "#5a7348",
    primaryLight: "#8aa574",
    primaryDark: "#3f5232",
    secondary: "#b07a4e",
    secondaryLight: "#d0a882",
    ink: "#12140f",
    muted: "#646b5e",
    glow: "90, 115, 72",
    swatches: ["#eef3eb", "#5a7348", "#b07a4e"],
  },
  {
    id: "emerald",
    name: "Luxury Emerald",
    description: "Deep emerald & gold",
    ivory: "#eaf2ec",
    pearl: "#dfeae3",
    primary: "#0d5c4d",
    primaryLight: "#2a8a74",
    primaryDark: "#084036",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#0a1210",
    muted: "#5a6862",
    glow: "13, 92, 77",
    swatches: ["#eaf2ec", "#0d5c4d", "#c9a227"],
  },
  {
    id: "blush",
    name: "Luxury Blush",
    description: "Rose pink & crimson",
    ivory: "#fee6e5",
    pearl: "#f9dcda",
    primary: "#b21f24",
    primaryLight: "#d44a4e",
    primaryDark: "#8a1519",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#1a0f10",
    muted: "#7a6566",
    glow: "178, 31, 36",
    swatches: ["#fee6e5", "#b21f24", "#c9a227"],
  },
  {
    id: "pearl",
    name: "Warm Pearl",
    description: "Champagne & bronze",
    ivory: "#f5f0e8",
    pearl: "#efe8dc",
    primary: "#b8952e",
    primaryLight: "#d4b65a",
    primaryDark: "#8f731f",
    secondary: "#8b5e3c",
    secondaryLight: "#b8926e",
    ink: "#14110c",
    muted: "#6e675c",
    glow: "184, 149, 46",
    swatches: ["#f5f0e8", "#b8952e", "#8b5e3c"],
  },
  {
    id: "saffron",
    name: "Festive Saffron",
    description: "Marigold & burgundy",
    ivory: "#fff6e8",
    pearl: "#ffefd6",
    primary: "#d97706",
    primaryLight: "#f0a84a",
    primaryDark: "#b45309",
    secondary: "#7f1d1d",
    secondaryLight: "#b54a4a",
    ink: "#1c1208",
    muted: "#7a6550",
    glow: "217, 119, 6",
    swatches: ["#fff6e8", "#d97706", "#7f1d1d"],
  },
  {
    id: "lavender",
    name: "Soft Lavender",
    description: "Lilac & amethyst",
    ivory: "#f5f0f8",
    pearl: "#ebe3f2",
    primary: "#7c5cbf",
    primaryLight: "#a48ddd",
    primaryDark: "#5b3f96",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#14101a",
    muted: "#6b6475",
    glow: "124, 92, 191",
    swatches: ["#f5f0f8", "#7c5cbf", "#c9a227"],
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    description: "Sea blue & sand",
    ivory: "#eef5f7",
    pearl: "#e2eef2",
    primary: "#0e7490",
    primaryLight: "#22a0bc",
    primaryDark: "#0a556b",
    secondary: "#c4a484",
    secondaryLight: "#dbc0a6",
    ink: "#0b1418",
    muted: "#5a6b72",
    glow: "14, 116, 144",
    swatches: ["#eef5f7", "#0e7490", "#c4a484"],
  },
  {
    id: "plum",
    name: "Royal Plum",
    description: "Berry & antique gold",
    ivory: "#f7eef4",
    pearl: "#f0e2eb",
    primary: "#6b2d5c",
    primaryLight: "#9a4f86",
    primaryDark: "#4a1e3f",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#160f14",
    muted: "#6f5c68",
    glow: "107, 45, 92",
    swatches: ["#f7eef4", "#6b2d5c", "#c9a227"],
  },
  {
    id: "mocha",
    name: "Mocha Latte",
    description: "Coffee & cream",
    ivory: "#f6f1eb",
    pearl: "#efe6db",
    primary: "#6f4e37",
    primaryLight: "#95705a",
    primaryDark: "#4f3625",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#1a140f",
    muted: "#6e6258",
    glow: "111, 78, 55",
    swatches: ["#f6f1eb", "#6f4e37", "#c9a227"],
  },
  {
    id: "ruby",
    name: "Ruby Noir",
    description: "Deep ruby & gold",
    ivory: "#faf0f1",
    pearl: "#f3e2e4",
    primary: "#9b1b30",
    primaryLight: "#c44558",
    primaryDark: "#6e1221",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#180c0e",
    muted: "#726065",
    glow: "155, 27, 48",
    swatches: ["#faf0f1", "#9b1b30", "#c9a227"],
  },
  {
    id: "sky",
    name: "Morning Sky",
    description: "Soft blue & navy",
    ivory: "#eef4fb",
    pearl: "#e2ebf6",
    primary: "#3b6ea5",
    primaryLight: "#6b95c4",
    primaryDark: "#2a5080",
    secondary: "#d4a017",
    secondaryLight: "#e8c45a",
    ink: "#0e1520",
    muted: "#5d6a7a",
    glow: "59, 110, 165",
    swatches: ["#eef4fb", "#3b6ea5", "#d4a017"],
  },
  {
    id: "noir",
    name: "Noir Gold",
    description: "Charcoal & gold",
    ivory: "#f2f1ef",
    pearl: "#e8e6e2",
    primary: "#1f1f1f",
    primaryLight: "#4a4a4a",
    primaryDark: "#0d0d0d",
    secondary: "#c9a227",
    secondaryLight: "#e8d48b",
    ink: "#0a0a0a",
    muted: "#6b6b6b",
    glow: "31, 31, 31",
    swatches: ["#f2f1ef", "#1f1f1f", "#c9a227"],
  },
  {
    id: "coral",
    name: "Sunset Coral",
    description: "Coral & teal",
    ivory: "#fff1ec",
    pearl: "#ffe6de",
    primary: "#e07a5f",
    primaryLight: "#f0a48f",
    primaryDark: "#c45d42",
    secondary: "#3d7c7a",
    secondaryLight: "#6aa3a1",
    ink: "#1a100d",
    muted: "#7a655e",
    glow: "224, 122, 95",
    swatches: ["#fff1ec", "#e07a5f", "#3d7c7a"],
  },
  {
    id: "olive",
    name: "Olive Grove",
    description: "Olive & terracotta",
    ivory: "#f4f3eb",
    pearl: "#ebe9dc",
    primary: "#6b7040",
    primaryLight: "#93986a",
    primaryDark: "#4a4f2a",
    secondary: "#c26d4a",
    secondaryLight: "#d9987c",
    ink: "#14150f",
    muted: "#6a6b5e",
    glow: "107, 112, 64",
    swatches: ["#f4f3eb", "#6b7040", "#c26d4a"],
  },
];

export const DEFAULT_COLOR_THEME: ColorThemeId = "ivory";

export function getColorTheme(id: string): ColorTheme {
  return (
    COLOR_THEMES.find((t) => t.id === id) ??
    COLOR_THEMES.find((t) => t.id === DEFAULT_COLOR_THEME)!
  );
}
