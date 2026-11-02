import { useLocalSearchParams } from "expo-router";
import { ReferencesBrowser } from "../../src/features/references/ReferencesBrowser";

export default function ReferenceFolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReferencesBrowser folderId={id} />;
}
