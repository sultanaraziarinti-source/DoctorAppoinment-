import { Image, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { DOCTOR, consultation, timeLabel } from "../doctor";
import { useStore } from "../store";
import { C } from "../theme";
import { Button, Page, ui } from "./admin/ui";
import type { HomeStackParams } from "../navigation";

// Booking confirmation, in the same card style as the Admin Login and booking form
export default function ConfirmedScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Confirmed">) {
  const { t, lang, n } = useI18n();
  const a = useStore().appointments.find(x => x.id === route.params.id);
  if (!a) return null;
  const start = new Date(a.start), end = new Date(a.end);
  const c = consultation(a.type);

  return (
    <Page>
      <View style={[ui.card, s.card]}>
        <Image source={require("../../assets/web-logo-mark.png")} style={s.logo} resizeMode="contain" />
        <Text style={[ui.title, s.title]}>✅ {t.confirmed}</Text>

        <View style={s.serial}>
          <Text style={s.serialLabel}>{t.serial}</Text>
          <Text style={s.serialNum}>{n(a.serial)}</Text>
        </View>

        <Item label={t.date} value={`${t.days[start.getDay()]}, ${n(start.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" }))}`} />
        <Item label={t.time} value={`${timeLabel(start, lang)} – ${timeLabel(end, lang)}`} />
        <Item label={t.name} value={a.name} />
        <View style={s.pair}>
          <Item label={t.age} value={n(a.age)} />
          <Item label={t.phone} value={n(a.phone)} />
        </View>
        {c && <Item label={t.fee} value={`${t.taka} ${n(c.fee)}`} />}

        <Text style={s.doctor}>{DOCTOR.name[lang]}</Text>
        <Button title={t.backHome} onPress={() => navigation.popToTop()} kind="blue" />
      </View>
    </Page>
  );
}

// Label above a rounded box — looks like the login page's input fields, but read-only
function Item({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={ui.label}>{label}</Text>
      <View style={[ui.input, s.value]}><Text style={s.valueText}>{value}</Text></View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 24, maxWidth: 440, width: "100%", alignSelf: "center" },
  logo: { width: 90, height: 70, alignSelf: "center" },
  title: { textAlign: "center", marginTop: 10, marginBottom: 12 },
  serial: { alignSelf: "center", alignItems: "center", backgroundColor: C.blueLt, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 8, marginBottom: 18 },
  serialLabel: { color: C.blue, fontWeight: "700", fontSize: 14 },
  serialNum: { color: C.blueDk, fontSize: 38, fontWeight: "900" },
  pair: { flexDirection: "row", gap: 10 },
  value: { backgroundColor: "#F8FAFC" },
  valueText: { fontSize: 16, color: C.text, fontWeight: "600" },
  doctor: { textAlign: "center", color: C.blue, fontWeight: "700", marginTop: 4, marginBottom: 6 },
});
