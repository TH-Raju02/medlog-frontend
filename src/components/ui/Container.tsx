import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { layout } from "../../theme/tokens";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
}

export function Container({ children, style, maxWidth = layout.maxContentWidth }: Props) {
  const { gutter } = useResponsive();
  return (
    <View
      style={[
        { width: "100%", maxWidth: maxWidth + gutter * 2, alignSelf: "center", paddingHorizontal: gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
