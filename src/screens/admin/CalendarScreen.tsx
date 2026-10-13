import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { SCHEDULE, dateKey } from "../../doctor";
import { useClinic } from "../../clinic";
import { C } from "../../theme";
import { Page, ui } from "./ui";

// Month calendar: tap a day to mark it closed (or open again).
// Closed days disappear from the patients' Availability row, and patients get a push notification.
export default function CalendarScreen() {
  const { t, lang, n } = useI18n();
  const { closedDays, setClosed } = useClinic();
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [msg, setMsg] = useState("");

  const first = month.getDay();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const todayKey = dateKey(today);
  const shift = (k: number) => setMonth(m => new Date(m.getFullYear(), m.getMonth() + k, 1));

  const toggle = async (d: Date) => {
    const key = dateKey(d);
    const close = !closedDays.has(key);
    const err = await setClosed(key, close);
    setMsg(err ?? (close ? `${t.markedClosed}: ${n(d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }))}` : t.saved));
  };

  return (
    <Page>
      <Text style={ui.title}>📅 {t.calendar}</Text>
      <Text style={[ui.muted, { marginBottom: 12 }]}>{t.tapToClose}</Text>
      {msg ? <Text style={ui.ok}>{msg}</Text> : null}

      <View style={ui.card}>
        <View style={s.head}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} accessibilityLabel="previous month"><Text style={s.arrow}>‹</Text></Pressable>
          <Text style={s.month}>{n(month.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { month: "long", year: "numeric" }))}</Text>
          <Pressable onPress={() => shift(1)} hitSlop={10} accessibilityLabel="next month"><Text style={s.arrow}>›</Text></Pressable>
        </View>
        <View style={s.grid}>
          {t.daysShort.map(d => <Text key={d} style={s.dow}>{d}</Text>)}
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={s.cell} />;
            const key = dateKey(d);
            const past = key < todayKey;
            const weeklyOff = !SCHEDULE[d.getDay()];
            const closed = closedDays.has(key);
            return (
              <Pressable key={key} disabled={past || weeklyOff} onPress={() => toggle(d)} style={s.cell}
                accessibilityState={{ selected: closed, disabled: past || weeklyOff }}>
                <View style={[s.day, closed && s.closed, weeklyOff && s.off, key === todayKey && s.today, past && { opacity: 0.35 }]}>
                  <Text style={[s.num, (closed || weeklyOff) && { color: C.red }]}>{n(d.getDate())}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={s.legend}>
          <Text style={ui.muted}><Text style={{ color: C.red }}>■</Text> {t.closedDay}</Text>
          <Text style={ui.muted}><Text style={{ color: "#FECACA" }}>■</Text> {t.weeklyOff}</Text>
          <Text style={ui.muted}><Text style={{ color: C.blue }}>□</Text> {t.today}</Text>
        </View>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  arrow: { fontSize: 32, color: C.blue, paddingHorizontal: 10 },
  month: { fontSize: 18, fontWeight: "800", color: C.blueDk },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dow: { width: "14.28%", textAlign: "center", fontSize: 13, fontWeight: "700", color: C.muted, paddingVertical: 6 },
  cell: { width: "14.28%", aspectRatio: 1, padding: 3 },
  day: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.blueLt },
  closed: { backgroundColor: "#FECACA", borderWidth: 2, borderColor: C.red },
  off: { backgroundColor: "#FEF2F2" },
  today: { borderWidth: 2, borderColor: C.blue },
  num: { fontSize: 16, fontWeight: "700", color: C.text },
  legend: { flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" },
});
