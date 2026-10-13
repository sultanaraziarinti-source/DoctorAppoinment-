import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useWide } from "../../useWide";
import { C } from "../../theme";

// Small shared building blocks for the doctor/admin screens

export function Page({ children }: { children: ReactNode }) {
  const wide = useWide();
  return (
    <ScrollView style={ui.screen} contentContainerStyle={[ui.page, wide && ui.pageWide]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput placeholderTextColor="#94A3B8" {...props} style={[ui.input, props.multiline && { minHeight: 90, textAlignVertical: "top" }, props.style]} />
    </View>
  );
}

export function Button({ title, onPress, kind = "green", disabled }: { title: string; onPress: () => void; kind?: "green" | "blue" | "outline"; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [ui.btn, kind === "blue" && ui.btnBlue, kind === "outline" && ui.btnOutline, (pressed || disabled) && { opacity: 0.7 }]}>
      <Text style={[ui.btnText, kind === "outline" && { color: C.blue }]}>{title}</Text>
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  page: { padding: 16, paddingBottom: 32 },
  pageWide: { width: "100%", maxWidth: 900, alignSelf: "center", padding: 32 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  title: { fontSize: 20, fontWeight: "800", color: C.blueDk, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, color: C.text },
  muted: { fontSize: 13, color: C.muted },
  error: { backgroundColor: "#FDECEC", color: C.red, padding: 10, borderRadius: 10, marginBottom: 12 },
  ok: { backgroundColor: C.greenLt, color: C.greenDk, padding: 10, borderRadius: 10, marginBottom: 12, fontWeight: "700" },
  btn: { backgroundColor: C.green, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  btnBlue: { backgroundColor: C.blue },
  btnOutline: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.blue },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  remove: { color: C.red, fontWeight: "800", fontSize: 22, paddingHorizontal: 8, paddingBottom: 22 },
  add: { color: C.blue, fontWeight: "800", fontSize: 15, paddingVertical: 8 },
});
