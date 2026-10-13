import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { ampm, dateKey, hm, slotsFor } from "../../doctor";
import { useClinic } from "../../clinic";
import { Appointment, useStore } from "../../store";
import { C } from "../../theme";
import { Page, ui } from "./ui";
import type { AdminStackParams } from "./AdminStack";

// Today's list: all 20 serials in order. Tap a booked patient to write (or open) the prescription.
// Earlier bookings are listed below so old prescriptions can still be edited.
export default function PatientsScreen({ navigation }: NativeStackScreenProps<AdminStackParams, "Patients">) {
  const { t, lang, n } = useI18n();
  const { online, doctorAppointments, prescriptions } = useClinic();
  const local = useStore().appointments;
  // Demo mode has no server, so the doctor sees the bookings made on this device
  const all = online ? doctorAppointments : local;
  const [today] = useState(() => new Date());
  const todayKey = dateKey(today);
  const slots = slotsFor(today);
  const bySerial = new Map(all.filter(a => a.date === todayKey).map(a => [a.serial, a]));
  const earlier = all.filter(a => a.date < todayKey).sort((a, b) => b.start.localeCompare(a.start));

  const open = (a: Appointment) => {
    const rx = prescriptions.find(p => p.appointmentId === a.id);
    if (rx) navigation.navigate("Prescription", { id: rx.id });
    else navigation.navigate("Write", { appointmentId: a.id });
  };

  const row = (a: Appointment, label: string) => {
    const rx = prescriptions.some(p => p.appointmentId === a.id);
    return (
      <Pressable key={a.id} accessibilityRole="button" onPress={() => open(a)}
        style={({ pressed }) => [ui.card, s.row, pressed && { opacity: 0.85 }]}>
        <View style={s.serial}><Text style={s.serialText}>{n(a.serial)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{a.name} · {n(a.age)}</Text>
          <Text style={ui.muted}>{label} · {n(a.phone)}</Text>
        </View>
        <Text style={rx ? s.done : s.write}>{rx ? `📄 ${t.prescription}` : `✏️ ${t.writeRx}`}</Text>
      </Pressable>
    );
  };

  return (
    <Page>
      <Text style={ui.title}>{t.todayPatients}</Text>
      <Text style={[ui.muted, { marginTop: -8, marginBottom: 12 }]}>
        {t.days[today.getDay()]}, {n(today.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }))}
      </Text>

      {slots.length === 0 && <Text style={ui.muted}>{t.noChamberToday}</Text>}
      {slots.map(sl => {
        const a = bySerial.get(sl.index + 1);
        const time = `${n(hm(sl.start))}–${n(hm(sl.end))} ${ampm(sl.start, lang)}`;
        if (a) return row(a, time);
        return (
          <View key={sl.index} style={[ui.card, s.row, s.free]}>
            <View style={[s.serial, s.serialFree]}><Text style={[s.serialText, { color: C.muted }]}>{n(sl.index + 1)}</Text></View>
            <Text style={[ui.muted, { flex: 1 }]}>{time}</Text>
            <Text style={s.freeText}>{t.freeSlot}</Text>
          </View>
        );
      })}

      {earlier.length > 0 && (
        <>
          <Text style={[ui.title, { marginTop: 18 }]}>{t.earlierPatients}</Text>
          {earlier.map(a => {
            const start = new Date(a.start);
            return row(a, `${t.days[start.getDay()]}, ${n(start.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" }))} · ${n(hm(start))} ${ampm(start, lang)}`);
          })}
        </>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  free: { backgroundColor: "#F8FAFC", paddingVertical: 10, marginBottom: 8 },
  serial: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blueLt, alignItems: "center", justifyContent: "center" },
  serialFree: { width: 36, height: 36, backgroundColor: "#EEF2F7" },
  serialText: { color: C.blueDk, fontWeight: "900", fontSize: 17 },
  name: { fontSize: 16, fontWeight: "800", color: C.text },
  done: { color: C.greenDk, fontWeight: "800", fontSize: 13 },
  write: { color: C.blue, fontWeight: "800", fontSize: 13 },
  freeText: { color: C.muted, fontWeight: "700", fontSize: 13 },
});
