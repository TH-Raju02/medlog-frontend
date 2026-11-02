import { Alert, Platform } from "react-native";

/** Yes/no confirmation that also works on web, where Alert buttons are not supported. */
export const confirmAction = (title: string, message: string, confirmLabel = "Delete", destructive = true) =>
  new Promise<boolean>((resolve) => {
    if (Platform.OS === "web") {
      resolve(window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
    ]);
  });
