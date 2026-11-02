import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { EmptyState } from "../src/components/ui/EmptyState";
import { colors, spacing } from "../src/theme/tokens";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <EmptyState
          icon="compass"
          title="This screen does not exist."
          description="The link may be outdated."
          actionLabel="Go home"
          onAction={() => router.replace("/")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
