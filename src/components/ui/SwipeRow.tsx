import { ReactNode, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius } from "../../theme/tokens";

const ACTION_WIDTH = 72;

interface Props {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/** "Swipe left to delete" row from the Reminders and Protocol & References designs. */
export function SwipeRow({ children, onDelete, deleteLabel, style, disabled }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const open = useRef(false);

  const settle = (toOpen: boolean) => {
    open.current = toOpen;
    Animated.spring(x, { toValue: toOpen ? -ACTION_WIDTH : 0, useNativeDriver: true, bounciness: 0 }).start();
  };

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        !disabled && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const base = open.current ? -ACTION_WIDTH : 0;
        x.setValue(Math.max(-ACTION_WIDTH * 1.4, Math.min(0, base + g.dx)));
      },
      onPanResponderRelease: (_e, g) => {
        const base = open.current ? -ACTION_WIDTH : 0;
        settle(base + g.dx < -ACTION_WIDTH / 2);
      },
      onPanResponderTerminate: () => settle(open.current),
    })
  ).current;

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityActions={disabled ? undefined : [{ name: "delete", label: deleteLabel }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "delete") onDelete();
      }}
    >
      {disabled ? null : (
        <Pressable
          onPress={() => {
            settle(false);
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          style={styles.action}
        >
          <Feather name="trash-2" size={16} color={colors.danger} />
        </Pressable>
      )}
      <Animated.View style={{ transform: [{ translateX: x }] }} {...responder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", borderRadius: radius.lg },
  action: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: colors.dangerSwipeBg,
    alignItems: "center",
    justifyContent: "center",
  },
});
