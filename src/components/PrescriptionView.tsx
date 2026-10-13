import { Image, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { CONTACT, DOCTOR } from "../doctor";
import type { Prescription } from "../clinic";
import { C } from "../theme";

// Printed-prescription look: doctor letterhead, patient line, ℞ medicines, advised tests, signature.
// Used by the doctor after submitting and by the patient in "Current Medicine".
export default function PrescriptionView({ rx }: { rx: Prescription }) {
  const { t, lang, n } = useI18n();
  const date = n(new Date(rx.updatedAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" }));
  return (
    <View style={s.paper}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.doctor}>{DOCTOR.name[lang]}</Text>
          <Text style={s.small}>{DOCTOR.degrees}</Text>
          <Text style={s.small}>{DOCTOR.specialty[lang]}</Text>
          <Text style={s.small}>{DOCTOR.chamber[lang]} · 📞 {n(CONTACT.phones[0])}</Text>
        </View>
        <Image source={require("../../assets/web-logo-mark.png")} style={s.logo} resizeMode="contain" />
      </View>

      <View style={s.patient}>
        <Text style={s.pText}>{t.name}: <Text style={s.pBold}>{rx.patientName}</Text></Text>
        <Text style={s.pText}>{t.age}: <Text style={s.pBold}>{n(rx.patientAge)}</Text></Text>
        <Text style={s.pText}>{t.rxDate}: <Text style={s.pBold}>{date}</Text></Text>
      </View>

      <View style={s.body}>
        <Text style={s.rx}>℞</Text>
        {rx.medicines.length === 0 && <Text style={s.empty}>{t.noItems}</Text>}
        {rx.medicines.map((m, i) => (
          <View key={i} style={s.med}>
            <Text style={s.medName}>{n(i + 1)}. {m.name}</Text>
            {m.dose ? <Text style={s.dose}>{m.dose}</Text> : null}
          </View>
        ))}

        <Text style={s.section}>🧪 {t.advisedTests}</Text>
        {rx.tests.length === 0 && <Text style={s.empty}>{t.noItems}</Text>}
        {rx.tests.map((x, i) => <Text key={i} style={s.test}>• {x}</Text>)}
      </View>

      <View style={s.sign}>
        <View style={s.signLine} />
        <Text style={s.small}>{DOCTOR.name[lang]}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  paper: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden", marginBottom: 14 },
  head: { flexDirection: "row", gap: 12, padding: 16, borderBottomWidth: 3, borderBottomColor: C.blue },
  doctor: { fontSize: 19, fontWeight: "900", color: C.blueDk },
  small: { fontSize: 12, color: C.muted, marginTop: 2 },
  logo: { width: 64, height: 50 },
  patient: { flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 4, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.blueLt },
  pText: { fontSize: 14, color: C.muted },
  pBold: { color: C.text, fontWeight: "700" },
  body: { padding: 16, minHeight: 220 },
  rx: { fontSize: 34, fontWeight: "900", color: C.blue, marginBottom: 6 },
  med: { marginBottom: 10, paddingLeft: 6 },
  medName: { fontSize: 16, fontWeight: "800", color: C.text },
  dose: { fontSize: 14, color: C.greenDk, fontWeight: "600", marginTop: 2, paddingLeft: 18 },
  section: { fontSize: 15, fontWeight: "800", color: C.blueDk, marginTop: 14, marginBottom: 6 },
  test: { fontSize: 15, color: C.text, paddingLeft: 6, lineHeight: 24 },
  empty: { fontSize: 14, color: C.muted, fontStyle: "italic", paddingLeft: 6 },
  sign: { alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16 },
  signLine: { width: 160, height: 1, backgroundColor: C.text, marginBottom: 4 },
});
