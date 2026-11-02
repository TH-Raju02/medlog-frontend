import { Image } from "react-native";

// 3x exports of the Figma logo.
const FULL = { source: require("../../../assets/images/medlog-logo.png"), w: 553 / 3, h: 140 / 3 };
// Stacked lock-up (mark, "MedLog", grey tagline) exported from the Figma splash. At scale 1 it is the
// size drawn on the 768pt-wide Figma splash frame ("MedLog" is 304pt wide).
const STACKED = { source: require("../../../assets/images/medlog-splash.png"), w: 911 / 2.95, h: 1233 / 2.95 };

interface Props {
  variant?: "horizontal" | "stacked";
  scale?: number;
}

/** The MedLog brand mark. Render once per screen. */
export function Logo({ variant = "horizontal", scale = 1 }: Props) {
  if (variant === "stacked") {
    return (
      <Image
        source={STACKED.source}
        style={{ width: STACKED.w * scale, height: STACKED.h * scale }}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="MedLog, where rounds go digital"
      />
    );
  }
  return (
    <Image
      source={FULL.source}
      style={{ width: FULL.w * scale, height: FULL.h * scale }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="MedLog, where rounds go digital"
    />
  );
}