import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { DOCTOR, SCHEDULE, WEEK_ORDER, clinicSnapshot } from "../../doctor";
import { useClinic } from "../../clinic";
import { C } from "../../theme";
import { Button, Field, Page, ui } from "./ui";

type Bi = { bn: string; en: string };

// Edit everything patients see about the doctor: name, specialty, experience, fee, qualification,
// chamber, biography and weekly schedule
export default function InfoScreen() {
  const { t } = useI18n();
  const { saveInfo } = useClinic();
  const [d, setD] = useState(() => clinicSnapshot());
  const [msg, setMsg] = useState("");

  const doc = d.doctor;
  const setDoc = (k: keyof typeof DOCTOR, v: unknown) => setD(x => ({ ...x, doctor: { ...x.doctor, [k]: v } }));
  const bi = (k: "name" | "specialty" | "designation" | "chamber" | "bio", label: string, multiline = false) => (
    <View style={s.pair}>
      <Field label={`${label} · ${t.inBangla}`} value={(doc[k] as Bi).bn} multiline={multiline}
        onChangeText={v => setDoc(k, { ...(doc[k] as Bi), bn: v })} />
      <Field label={`${label} · ${t.inEnglish}`} value={(doc[k] as Bi).en} multiline={multiline}
        onChangeText={v => setDoc(k, { ...(doc[k] as Bi), en: v })} />
    </View>
  );

  const save = async () => {
    const schedule = d.schedule.map(x => (x && /^\d{1,2}:\d{2}$/.test(x.trim()) ? x.trim().padStart(5, "0") : null));
    const err = await saveInfo({ ...d, schedule });
    setMsg(err ?? t.saved);
  };

  return (
    <Page>
      <Text style={ui.title}>✏️ {t.updateInfo}</Text>
      {msg ? <Text style={msg === t.saved ? ui.ok : ui.error}>{msg}</Text> : null}

      <View style={ui.card}>
        {bi("name", t.doctorName)}
        {bi("specialty", t.specialty)}
        {bi("designation", t.designation)}
        <Field label={t.qualification} value={doc.degrees} onChangeText={v => setDoc("degrees", v)} />
        <View style={s.pair}>
          <Field label={t.experienceYears} value={String(doc.experience)} keyboardType="number-pad"
            onChangeText={v => setDoc("experience", Number(v.replace(/\D/g, "")) || 0)} />
          <Field label={t.feeTaka} value={String(d.fee)} keyboardType="number-pad"
            onChangeText={v => setD(x => ({ ...x, fee: Number(v.replace(/\D/g, "")) || 0 }))} />
        </View>
        {bi("chamber", t.chamber)}
        {bi("bio", t.biography, true)}
        <Field label={t.photoUrl} value={doc.photo} autoCapitalize="none" onChangeText={v => setDoc("photo", v)} />
      </View>

      <View style={ui.card}>
        <Text style={[ui.label, { fontSize: 16 }]}>🗓️ {t.availability}</Text>
        {WEEK_ORDER.map(w => {
          const val = d.schedule[w];
          const open = val !== null;
          return (
            <View key={w} style={s.dayRow}>
              <Text style={s.dayName}>{t.days[w]}</Text>
              <Pressable onPress={() => setD(x => ({ ...x, schedule: x.schedule.map((y, j) => j === w ? (open ? null : SCHEDULE[w] ?? "17:00") : y) }))}
                style={[s.toggle, !open && s.toggleOff]} accessibilityRole="switch" accessibilityState={{ checked: open }}>
                <Text style={[s.toggleText, !open && { color: C.red }]}>{open ? "✓" : t.closedDay}</Text>
              </Pressable>
              {open && (
                <Field label="" value={val ?? ""} placeholder="17:00" style={{ paddingVertical: 8 }}
                  onChangeText={v => setD(x => ({ ...x, schedule: x.schedule.map((y, j) => j === w ? v : y) }))} />
              )}
            </View>
          );
        })}
        <Text style={ui.muted}>{t.startTime}</Text>
      </View>

      <Button title={t.save} onPress={save} />
    </Page>
  );
}

const s = StyleSheet.create({
  pair: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  dayRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  dayName: { width: 110, fontSize: 15, fontWeight: "700", color: C.text, paddingBottom: 24 },
  toggle: { borderWidth: 1.5, borderColor: C.green, backgroundColor: C.greenLt, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 12 },
  toggleOff: { borderColor: C.red, backgroundColor: "#FEF2F2" },
  toggleText: { fontWeight: "800", color: C.greenDk },
});
