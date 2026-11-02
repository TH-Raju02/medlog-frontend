import { useWindowDimensions } from "react-native";
import { breakpoints, layout } from "../theme/tokens";

export type DeviceClass = "phone" | "tablet" | "desktop";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const device: DeviceClass =
    width >= breakpoints.desktop ? "desktop" : width >= breakpoints.tablet ? "tablet" : "phone";
  const isPhone = device === "phone";
  const gutter = isPhone ? layout.gutter.phone : layout.gutter.tablet;

  return {
    width,
    height,
    device,
    isPhone,
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
    isLandscape: width > height,
    gutter,
    // Dashboard and wide forms switch to multi-column once there is room for it.
    isWide: width >= 900,
  };
}
