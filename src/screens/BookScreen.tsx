import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { slotsFor, timeLabel } from "../doctor";
import { useStore } from "../store";
import { usePatient } from "../patient";
import { notifyBooking } from "../notifications";
import { C } from "../theme";
import { Button, Field, Page, ui } from "./admin/ui";
import type { HomeStackParams } from "../navigation";

const parseDay = (key: string) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); };
// Accepts Bangla digits too, e.g. ০১৭১১...
const toLatin = (s: string) => s.replace(/[০-৯]/g, d => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

export default function BookScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Book">) {
  const { t, lang, n } = useI18n();
  const { addAppointment, bookedSerials, reports } = useStore();
  const day = parseDay(route.params.date);
  const slot = slotsFor(day)[route.params.serial - 1];
  const { patient } = usePatient();
  const [name, setName] = useState(patient?.name ?? "");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const ageNum = Number(toLatin(age));
    const phoneNum = toLatin(phone).replace(/[\s-]/g, "");
    if (!name.trim() || !(ageNum > 0 && ageNum < 120)) return setError(t.fillAll);
    if (!/^01[3-9]\d{8}$/.test(phoneNum)) return setError(t.badPhone);
    if (bookedSerials(day).has(route.params.serial) || slot.start <= new Date()) return setError(t.booked);
    setBusy(true);
    let appt;
    try {
      appt = await addAppointment({
        serial: route.params.serial, date: route.params.date, start: slot.start.toISOString(), end: slot.end.toISOString(),
        name: name.trim(), age: ageNum, phone: phoneNum, type: "chamber",
      });
    } catch {
      setBusy(false);
      return setError(t.booked); // someone else took this slot just now
    }
    await notifyBooking(appt, reports, t, lang).catch(() => {});
    setBusy(false);
    navigation.replace("Confirmed", { id: appt.id });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Same card look as the Admin Login page */}
      <Page>
        <View style={[ui.card, s.card]}>
          <Image source={require("../../assets/web-logo-mark.png")} style={s.logo} resizeMode="contain" />
          <Text style={[ui.title, s.title]}>{t.patientInfo}</Text>
          <View style={s.slot}>
            <Text style={s.slotText}>
              {t.serial} {n(route.params.serial)} · {timeLabel(slot.start, lang)} – {timeLabel(slot.end, lang)}
            </Text>
            <Text style={s.slotDate}>{t.days[day.getDay()]}, {n(day.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }))}</Text>
          </View>
          {error ? <Text style={ui.error}>{error}</Text> : null}
          <Field label={t.name} value={name} onChangeText={setName} autoComplete="name" />
          <Field label={t.age} value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />
          <Field label={t.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="01XXXXXXXXX" maxLength={14} autoComplete="tel" onSubmitEditing={submit} />
          <Button title={t.submit} onPress={submit} kind="blue" disabled={busy || !name || !age || !phone} />
        </View>
      </Page>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  card: { padding: 24, maxWidth: 440, width: "100%", alignSelf: "center" },
  logo: { width: 90, height: 70, alignSelf: "center" },
  title: { textAlign: "center", marginTop: 10, marginBottom: 10 },
  slot: { alignSelf: "center", alignItems: "center", backgroundColor: C.blueLt, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  slotText: { color: C.blueDk, fontWeight: "800", fontSize: 15, textAlign: "center" },
  slotDate: { color: C.blue, fontSize: 13, marginTop: 2 },
});
