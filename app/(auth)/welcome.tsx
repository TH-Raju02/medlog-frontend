import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "../../src/components/shared/Logo";
import { useResponsive } from "../../src/hooks/useResponsive";
import { gradients } from "../../src/theme/tokens";

const SPLASH_MS = 1800;

/** Figma "Welcome" frame: the brand mark alone on the onboarding gradient, then Login. */
export default function WelcomeScreen() {
  const router = useRouter();
  const { isPhone, width, height } = useResponsive();
  // Tablets keep the Figma splash proportions (768x1024 frame); phones use ~60% of the width.
  const logoScale = isPhone ? width / 500 : Math.min(width / 768, height / 1024);
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => router.replace("/(auth)/login"), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [appear, router]);

  const scale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <LinearGradient colors={[...gradients.auth]} locations={[...gradients.authStops]} style={styles.fill}>
      <Pressable
        style={styles.center}
        onPress={() => router.replace("/(auth)/login")}
        accessibilityRole="button"
        accessibilityLabel="MedLog. Tap to continue to sign in"
      >
        <Animated.View style={{ opacity: appear, transform: [{ scale }] }}>
          <Logo variant="stacked" scale={logoScale} />
        </Animated.View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
