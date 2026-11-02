import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, layout, spacing } from "../../theme/tokens";
import { Container } from "./Container";

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: Array<"top" | "right" | "bottom" | "left">;
  maxWidth?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  header?: ReactNode;
}

export function Screen({
  children,
  scroll,
  style,
  edges,
  maxWidth = layout.maxContentWidth,
  refreshControl,
  header,
}: Props) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <Container maxWidth={maxWidth} style={style}>
        {children}
      </Container>
    </ScrollView>
  ) : (
    <Container maxWidth={maxWidth} style={[styles.fill, style]}>
      {children}
    </Container>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges ?? ["left", "right"]}>
      {header}
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.fill}>{body}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scrollContent: { paddingTop: spacing.xl, paddingBottom: spacing.xxxl * 2 },
});
