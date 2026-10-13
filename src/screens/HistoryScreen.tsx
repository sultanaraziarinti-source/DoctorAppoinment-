import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useWide } from "../useWide";
import { webColumn } from "./webColumn";
import { useI18n } from "../i18n";
import { ampm, consultation, hm } from "../doctor";
import { useStore } from "../store";
import { C, shadow } from "../theme";

export default function HistoryScreen() {
  const { t, lang, n } = useI18n();
  const { appointments } = useStore();
  const list = [...appointments].sort((a, b) => b.start.localeCompare(a.start));
  const [now] = useState(() => Date.now());
  const wide = useWide();

  return (
    <FlatList style={s.screen} contentContainerStyle={webColumn(wide)} data={list} keyExtractor={a => a.id}
      ListEmptyComponent={<Text style={s.empty}>{t.noHistory}</Text>}
      renderItem={({ item: a }) => {
        const start = new Date(a.start), end = new Date(a.end);
        const upcoming = end.getTime() > now;
        const c = consultation(a.type);
        return (
          <View style={[s.card, shadow]}>
            <View style={s.serial}><Text style={s.serialText}>{n(a.serial)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.date}>{t.days[start.getDay()]}, {n(start.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }))}</Text>
              <Text style={s.time}>{n(hm(start))} – {n(hm(end))} {ampm(start, lang)}</Text>
              {c && <Text style={s.type}>{c.icon} {c.name[lang]}</Text>}
              <Text style={s.who}>{a.name} · {n(a.age)} · {n(a.phone)}</Text>
            </View>
            <Text style={[s.status, upcoming ? s.up : s.done]}>{upcoming ? t.upcoming : t.done}</Text>
          </View>
        );
      }} />
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  empty: { textAlign: "center", color: C.muted, marginTop: 60, fontSize: 15 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12 },
  serial: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.blueLt, alignItems: "center", justifyContent: "center" },
  serialText: { color: C.blueDk, fontWeight: "900", fontSize: 18 },
  date: { fontWeight: "800", color: C.text, fontSize: 15 },
  time: { color: C.blue, fontWeight: "700", marginTop: 2 },
  type: { color: C.greenDk, fontWeight: "700", fontSize: 13, marginTop: 2 },
  who: { color: C.muted, fontSize: 13, marginTop: 2 },
  status: { fontSize: 12, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: "hidden" },
  up: { backgroundColor: C.greenLt, color: C.greenDk },
  done: { backgroundColor: "#F1F5F9", color: C.muted },
});
