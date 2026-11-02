import { useCallback, useState } from "react";
import { Alert, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Screen } from "../../components/ui/Screen";
import { Header } from "../../components/ui/Header";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormModal } from "../../components/ui/FormModal";
import { Loader } from "../../components/ui/Loader";
import { SwipeRow } from "../../components/ui/SwipeRow";
import { TextField } from "../../components/ui/TextField";
import { referencesApi } from "../../services/api/medlogApi";
import { getErrorMessage } from "../../services/api/client";
import { useResponsive } from "../../hooks/useResponsive";
import { ReferenceItem } from "../../types/api";
import { formatDate } from "../../utils/format";
import { confirmAction } from "../../utils/dialogs";
import { colors, fonts, radius, shadows, spacing, typography } from "../../theme/tokens";

/** Figma "Protocol and References": PDFs and folders, swipe left to delete. */
export function ReferencesBrowser({ folderId }: { folderId?: string }) {
  const router = useRouter();
  const { isPhone } = useResponsive();
  const [items, setItems] = useState<ReferenceItem[]>([]);
  const [folder, setFolder] = useState<ReferenceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await referencesApi.list(folderId);
      setItems(data.data.items);
      setFolder(data.data.folder);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const open = async (item: ReferenceItem, download: boolean) => {
    try {
      setBusyId(item._id);
      const { data } = await referencesApi.link(item._id);
      const url = download ? data.data.downloadUrl : data.data.viewUrl;
      if (Platform.OS === "web") window.open(url, "_blank");
      else if (download) await Linking.openURL(url);
      else await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert("Could not open file", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: ReferenceItem) => {
    const what = item.kind === "folder" ? `the folder "${item.name}" and everything inside it` : `"${item.name}"`;
    if (!(await confirmAction("Delete", `Delete ${what}? This cannot be undone.`))) return;
    try {
      await referencesApi.remove(item._id);
      setItems((list) => list.filter((i) => i._id !== item._id));
    } catch (err) {
      Alert.alert("Could not delete", getErrorMessage(err));
    }
  };

  const header = (
    <Header
      title={folder?.name ?? "Protocol and References"}
      subtitle="Swipe to the left to delete"
      showBack
      right={
        <Button
          title={isPhone ? "Upload" : "Upload new file/Folder"}
          icon="plus"
          onPress={() => setUploadOpen(true)}
          style={styles.headerBtn}
        />
      }
    />
  );

  return (
    <Screen scroll header={header} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      {loading && items.length === 0 ? (
        <Loader />
      ) : error ? (
        <EmptyState icon="alert-circle" title="Could not load references" description={error} actionLabel="Retry" onAction={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No Protocols/Reference Yet"
          description="Upload PDF protocols or create folders to organise your references."
          actionLabel="Upload new file/Folder"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <SwipeRow key={item._id} onDelete={() => remove(item)} deleteLabel={`Delete ${item.name}`} style={styles.swipe}>
              {item.kind === "folder" ? (
                <Pressable
                  onPress={() => router.push(`/protocols/${item._id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open folder ${item.name}`}
                  style={styles.row}
                >
                  <FileIcon kind="folder" />
                  <Text style={[styles.name, styles.flex]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Feather name="chevron-right" size={18} color={colors.primary} />
                </Pressable>
              ) : (
                <View style={styles.row}>
                  <FileIcon kind="file" />
                  <View style={styles.flex}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.meta}>Uploaded : {formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => open(item, true)}
                      disabled={busyId === item._id}
                      accessibilityRole="button"
                      accessibilityLabel={`Download ${item.name}`}
                      style={[styles.iconBtn, styles.downloadBtn]}
                    >
                      <Feather name="download" size={13} color={colors.muted} />
                    </Pressable>
                    <Pressable
                      onPress={() => open(item, false)}
                      disabled={busyId === item._id}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.name}`}
                      style={[styles.iconBtn, styles.viewBtn]}
                    >
                      <Feather name="eye" size={13} color={colors.link} />
                    </Pressable>
                  </View>
                </View>
              )}
            </SwipeRow>
          ))}
        </View>
      )}

      <UploadModal
        visible={uploadOpen}
        parentId={folderId}
        onClose={() => setUploadOpen(false)}
        onDone={() => {
          setUploadOpen(false);
          load();
        }}
      />
    </Screen>
  );
}

function FileIcon({ kind }: { kind: "file" | "folder" }) {
  if (kind === "folder") {
    return (
      <View style={styles.icon}>
        <Feather name="folder" size={26} color={colors.folder} />
      </View>
    );
  }
  return (
    <View style={styles.icon}>
      <Feather name="file" size={26} color={colors.mutedLight} />
      <View style={styles.pdfTag}>
        <Text style={styles.pdfText}>PDF</Text>
      </View>
    </View>
  );
}

function UploadModal({
  visible,
  parentId,
  onClose,
  onDone,
}: {
  visible: boolean;
  parentId?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"file" | "folder">("file");
  const [name, setName] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setFile(null);
  };

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      setFile(asset);
      if (!name) setName(asset.name.replace(/\.pdf$/i, ""));
    }
  };

  const submit = async () => {
    try {
      setSaving(true);
      if (mode === "folder") {
        if (!name.trim()) {
          Alert.alert("Folder name", "Enter the name of your new folder.");
          return;
        }
        await referencesApi.createFolder(name.trim(), parentId);
      } else {
        if (!file) {
          Alert.alert("Choose a file", "Select a PDF to upload.");
          return;
        }
        const form = new FormData();
        if (file.file) form.append("file", file.file);
        else {
          form.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType ?? "application/pdf",
          } as unknown as Blob);
        }
        if (name.trim()) form.append("name", name.trim());
        if (parentId) form.append("parentId", parentId);
        await referencesApi.upload(form);
      }
      reset();
      onDone();
    } catch (err) {
      Alert.alert(mode === "folder" ? "Could not create folder" : "Upload failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Upload new file/Folder"
      subtitle="You can only upload PDF files."
      onClose={() => {
        reset();
        onClose();
      }}
      submitLabel="Upload"
      onSubmit={submit}
      submitting={saving}
    >
      <View style={styles.choices}>
        {(["file", "folder"] as const).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.choice, active && styles.choiceActive]}
            >
              <FileIcon kind={m} />
              <Text style={styles.choiceText}>{m === "file" ? "Upload new file" : "Create a folder"}</Text>
            </Pressable>
          );
        })}
      </View>
      {mode === "file" ? (
        <>
          <Pressable onPress={pick} accessibilityRole="button" style={styles.picker}>
            <Feather name="upload" size={14} color={colors.softActionText} />
            <Text style={styles.pickerText} numberOfLines={1}>
              {file ? file.name : "Choose a PDF from your device"}
            </Text>
          </Pressable>
          <TextField label="File name" placeholder="Name shown in the list" value={name} onChangeText={setName} />
        </>
      ) : (
        <TextField
          label="Folder name"
          placeholder="Enter the name of your new folder."
          value={name}
          onChangeText={setName}
        />
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  headerBtn: { minHeight: 38 },
  list: { gap: spacing.md },
  swipe: { ...shadows.card },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pdfTag: {
    position: "absolute",
    bottom: 4,
    left: 2,
    backgroundColor: colors.pdf,
    borderRadius: 2,
    paddingHorizontal: 3,
  },
  pdfText: { fontFamily: fonts.bold, fontSize: 7, color: colors.white },
  name: { fontFamily: fonts.semibold, fontSize: 14, color: colors.heading },
  meta: { ...typography.caption, marginTop: 4 },
  actions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: { width: 32, height: 32, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  downloadBtn: { backgroundColor: colors.iconButtonBg },
  viewBtn: { backgroundColor: colors.quickActionBg },
  choices: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  choice: {
    flex: 1,
    minHeight: 80,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.chipSelectedBg },
  choiceText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softActionBg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  pickerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.softActionText, flexShrink: 1 },
});
