import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { DOCTOR, ampm, consultation, hm } from "../doctor";
import { useStore } from "../store";
import { C, shadow } from "../theme";
import type { HomeStackParams } from "../navigation";

export default function ConfirmedScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Confirmed">) {
  const { t, lang, n } = useI18n();
  const a = useStore().appointments.find(x => x.id === route.params.id);
  if (!a) return null;
  const start = new Date(a.start), end = new Date(a.end);
  const c = consultation(a.type);

  return (
    <View style={s.screen}>
      <View style={[s.card, shadow]}>
        <Text style={s.check}>✅</Text>
        <Text style={s.title}>{t.confirmed}</Text>
        <View style={s.serialBox}>
          <Text style={s.serialLabel}>{t.serial}</Text>
          <Text style={s.serial}>{n(a.serial)}</Text>
        </View>
        <Line label={t.date} value={`${t.days[start.getDay()]}, ${n(start.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" }))}`} />
        <Line label={t.time} value={`${n(hm(start))} – ${n(hm(end))} ${ampm(start, lang)}`} />
        {c && <Line label={t.consultType} value={`${c.icon} ${c.name[lang]}`} />}
        {c && <Line label={t.fee} value={`${t.taka}${n(c.fee)}`} />}
        <Line label={t.name} value={a.name} />
        <Line label={t.age} value={n(a.age)} />
        <Line label={t.phone} value={n(a.phone)} />
        <Text style={s.doctor}>{DOCTOR.name[lang]}</Text>
      </View>
      <Pressable onPress={() => navigation.popToTop()} style={s.btn}><Text style={s.btnText}>{t.backHome}</Text></Pressable>
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.line}>
      <Text style={s.lineLabel}>{label}</Text>
      <Text style={s.lineValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 16, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, alignItems: "stretch" },
  check: { fontSize: 46, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "800", color: C.greenDk, textAlign: "center", marginTop: 6 },
  serialBox: { alignSelf: "center", alignItems: "center", backgroundColor: C.blueLt, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 10, marginVertical: 16 },
  serialLabel: { color: C.blue, fontWeight: "700" },
  serial: { color: C.blueDk, fontSize: 40, fontWeight: "900" },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.border, gap: 12 },
  lineLabel: { color: C.muted, fontSize: 14 },
  lineValue: { color: C.text, fontSize: 15, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  doctor: { textAlign: "center", color: C.blue, fontWeight: "700", marginTop: 12 },
  btn: { marginTop: 18, backgroundColor: C.blue, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
