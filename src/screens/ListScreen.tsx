import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useI18n } from "../i18n";
import { useStore } from "../store";
import { useWide } from "../useWide";
import { webColumn } from "./webColumn";
import { Prescription, useClinic } from "../clinic";
import PrescriptionView from "../components/PrescriptionView";
import { C, shadow } from "../theme";

// "Test Reports": the patient adds their own reports.
// "Current Medicine": read-only — only what the doctor prescribed (no input form).
export default function ListScreen({ kind }: { kind: "reports" | "medicine" }) {
  const { t, lang, n } = useI18n();
  const store = useStore();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const isReports = kind === "reports";
  const wide = useWide();
  const { loadMyPrescriptions, prescriptions: doctorSaved } = useClinic();
  // Current Medicine: prescriptions the doctor wrote for this patient's bookings
  const [rxList, setRx] = useState<Prescription[]>([]);
  const myIds = store.appointments.map(x => x.id).join(",");
  useEffect(() => {
    if (isReports) return;
    loadMyPrescriptions(myIds ? myIds.split(",") : []).then(setRx).catch(() => {});
    // doctorSaved: refresh after the doctor saves on this same device (demo mode)
  }, [isReports, myIds, doctorSaved]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = isReports ? store.reports.map(r => ({ id: r.id, title: r.name, sub: r.result, date: r.date })) : [];

  const add = () => {
    if (!a.trim()) return;
    store.addReport({ name: a.trim(), result: b.trim() });
    setA(""); setB("");
  };

  return (
    <FlatList style={s.screen} contentContainerStyle={webColumn(wide)} data={items} keyExtractor={i => i.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<>
        {rxList.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.rxTitle}>📄 {t.prescribedByDoctor}</Text>
            {rxList.map(rx => <PrescriptionView key={rx.id} rx={rx} />)}
          </View>
        )}
        {isReports && <View style={[s.form, shadow]}>
          <Text style={s.formTitle}>🧪 {t.addReport}</Text>
          <TextInput value={a} onChangeText={setA} placeholder={t.reportName} style={s.input} placeholderTextColor="#94A3B8" />
          <TextInput value={b} onChangeText={setB} placeholder={t.reportResult} style={s.input} placeholderTextColor="#94A3B8" />
          <Pressable onPress={add} style={s.btn}><Text style={s.btnText}>{t.save}</Text></Pressable>
        </View>}
      </>}
      ListEmptyComponent={isReports || rxList.length === 0 ? <Text style={s.empty}>{isReports ? t.noReports : t.noRxYet}</Text> : null}
      renderItem={({ item }) => (
        <View style={[s.card, shadow]}>
          <Text style={s.icon}>🧪</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{item.title}</Text>
            {item.sub ? <Text style={s.sub}>{item.sub}</Text> : null}
            {item.date ? <Text style={s.date}>{n(new Date(item.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }))}</Text> : null}
          </View>
          <Pressable onPress={() => store.removeReport(item.id)} hitSlop={10}>
            <Text style={s.remove}>{t.remove}</Text>
          </Pressable>
        </View>
      )} />
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  rxTitle: { fontSize: 17, fontWeight: "800", color: C.blueDk, marginBottom: 10 },
  form: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 16, gap: 10 },
  formTitle: { fontSize: 16, fontWeight: "800", color: C.blueDk },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.text },
  btn: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  empty: { textAlign: "center", color: C.muted, marginTop: 30 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10 },
  icon: { fontSize: 24 },
  title: { fontSize: 16, fontWeight: "800", color: C.text },
  sub: { color: C.muted, marginTop: 2 },
  date: { color: C.blue, fontSize: 12, marginTop: 2 },
  remove: { color: C.red, fontWeight: "700", fontSize: 13 },
});
