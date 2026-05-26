// src/constants/stickers.tsx
export interface IHeritageSticker {
  label: string;
  icon: string;
  style: string;
  bgColor?: string;    // For node backgrounds
  lineColor?: string;  // For tree edge colors
}
export const HERITAGE_STICKERS = {
  honduras: { label: "Honduras", icon: "✨🇭🇳", style: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  spain: { label: "Spain", icon: "🏰🇪🇸", style: "bg-amber-50 text-amber-700 border-amber-200" },
  portugal: { label: "Portugal", icon: "⛵🇵🇹", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  england: { label: "England", icon: "🦁🏴󠁧󠁢󠁥󠁮󠁧󠁿", style: "bg-rose-50 text-rose-700 border-rose-200" },
  scotland: { label: "Scotland", icon: "🦄🏴󠁧󠁢󠁳󠁣󠁴󠁿", style: "bg-sky-50 text-sky-700 border-sky-200" },
  wales: { label: "Wales", icon: "🐉🏴󠁧󠁢󠁷󠁬󠁳󠁿", style: "bg-green-50 text-green-700 border-green-200" },
  france: { label: "France", icon: "⚜️🇫🇷", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  nicaragua: { label: "Nicaragua", icon: "🌋🇳🇮", style: "bg-blue-50 text-blue-700 border-blue-200" },
  el_salvador: { label: "El Salvador", icon: "☕🇸🇻", style: "bg-teal-50 text-teal-700 border-teal-200" },
  germany: { label: "Germany", icon: "🦅🇩🇪", style: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ireland: { label: "Ireland", icon: "🍀🇮🇪", style: "bg-lime-50 text-lime-700 border-lime-200" },
  mexico: { label: "Mexico", icon: "🌺🇲🇽", style: "bg-orange-50 text-orange-700 border-orange-200" },
  unknown: { label: "Unknown", icon: "🌍❓", style: "bg-stone-50 text-stone-500 border-stone-200" },
};
export const getSticker = (heritage?: string): IHeritageSticker => {
  return HERITAGE_STICKERS[heritage ?? 'unknown'] ?? HERITAGE_STICKERS.unknown;
};