const COLOR_MAP: Record<string, string> = {
  белый: "#ffffff",
  белая: "#ffffff",
  черный: "#111111",
  чёрный: "#111111",
  черная: "#111111",
  чёрная: "#111111",
  серый: "#9e9e9e",
  серая: "#9e9e9e",
  графит: "#4a4a4a",
  графитовый: "#4a4a4a",
  графитовая: "#4a4a4a",
  синий: "#1e4d8c",
  синяя: "#1e4d8c",
  голубой: "#6eb5ff",
  голубая: "#6eb5ff",
  красный: "#c62828",
  красная: "#c62828",
  бордовый: "#7b1e3a",
  бордовая: "#7b1e3a",
  зеленый: "#2e7d32",
  зелёный: "#2e7d32",
  зеленая: "#2e7d32",
  зелёная: "#2e7d32",
  хаки: "#6b7c3a",
  бежевый: "#d4c4a8",
  бежевая: "#d4c4a8",
  молочный: "#f5f0e6",
  молочная: "#f5f0e6",
  розовый: "#f48fb1",
  розовая: "#f48fb1",
  желтый: "#f5c518",
  жёлтый: "#f5c518",
  желтая: "#f5c518",
  жёлтая: "#f5c518",
  оранжевый: "#ef6c00",
  оранжевая: "#ef6c00",
  фиолетовый: "#6a1b9a",
  фиолетовая: "#6a1b9a",
  коричневый: "#5d4037",
  коричневая: "#5d4037",
};

export const resolveColorHex = (color?: string): string | null => {
  if (!color) return null;
  return COLOR_MAP[color.trim().toLowerCase()] ?? null;
};

export const isLightHex = (hex: string): boolean => {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
};
