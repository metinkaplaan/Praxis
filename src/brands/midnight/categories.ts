import type { BilingualCopy } from "../../lib/types.js";

export interface Category {
  id: string;
  /** Theme description fed into caption/image prompts. */
  theme: BilingualCopy;
  /** Feed-safe visual hint — Instagram content must stay within platform rules. */
  visualHint: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "red",
    theme: {
      en: "passion and bold desire between partners",
      tr: "partnerler arasında tutku ve cesur arzu",
    },
    visualHint:
      "deep red tones, candlelight, silhouettes, suggestive but fully feed-safe; " +
      "high-contrast backlit silhouette against a doorway or window works well here",
  },
  {
    id: "black",
    theme: {
      en: "mystery, power play and elegant intensity",
      tr: "gizem, güç oyunu ve zarif yoğunluk",
    },
    visualHint:
      "black on black, satin textures, dramatic shadows, minimal; " +
      "sharp side-lighting carving a couple's silhouette out of darkness, or an elegant " +
      "formalwear embrace against grand architecture (archways, marble, columns)",
  },
  {
    id: "purple",
    theme: {
      en: "fantasy and imagination shared as a couple",
      tr: "çift olarak paylaşılan fantezi ve hayal gücü",
    },
    visualHint:
      "violet neon glow, dreamlike haze, night sky; " +
      "an opulent, slightly theatrical interior (velvet, gilded mirrors, chandeliers) reads as " +
      "shared fantasy without needing anything explicit",
  },
  {
    id: "blue",
    theme: {
      en: "slowing down — anticipation, timing and teasing patience",
      tr: "yavaşlamak — beklenti, zamanlama ve sabırla oynamak",
    },
    visualHint:
      "cool blue midnight palette, hourglass or clock motifs, calm tension; " +
      "a single figure in a vulnerable, unhurried pose (soft dramatic light, eyes closed, " +
      "head tilted back) captures the 'anticipation' half of this theme well",
  },
  {
    id: "gold",
    theme: {
      en: "playful game night energy for two",
      tr: "iki kişilik oyun gecesi enerjisi",
    },
    visualHint:
      "warm gold accents on black, board-game and dice motifs, luxurious; " +
      "a playful power-tension prop moment (pool table, cards, a shared game) with warm " +
      "dramatic lighting sells the 'game night' energy better than props alone",
  },
  {
    id: "rose",
    theme: {
      en: "romance, tenderness and reconnection",
      tr: "romantizm, şefkat ve yeniden bağ kurmak",
    },
    visualHint:
      "soft rose tones, petals, gentle warm light, intimate but wholesome; " +
      "a close, tender gesture (forehead touch, hand on face) in soft warm light reads as " +
      "reconnection rather than posed romance",
  },
  {
    id: "turquoise",
    theme: {
      en: "sun-soaked getaway intimacy — freedom and playful anticipation on vacation",
      tr: "güneşli bir kaçamağın yakınlığı — tatilde özgürlük ve oyunbaz beklenti",
    },
    visualHint:
      "turquoise ocean tones, golden sunlight, tropical beach setting (palms, sand, surfboards); " +
      "a bikini-clad figure in a candid vacation moment (looking out at the water, walking along " +
      "the shore, adjusting hair) reads as free and alluring without needing a posed shot",
  },
];

export const INTENSITIES = [
  { id: "hafif", label: { en: "Soft", tr: "Hafif" } satisfies BilingualCopy },
  { id: "orta", label: { en: "Medium", tr: "Orta" } satisfies BilingualCopy },
  { id: "tam-gaz", label: { en: "Full Throttle", tr: "Tam Gaz" } satisfies BilingualCopy },
] as const;
