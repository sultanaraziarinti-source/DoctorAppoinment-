import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { ampm, dateKey, hm } from "../../doctor";
import { useClinic } from "../../clinic";
import { Appointment, useStore } from "../../store";
import { C } from "../../theme";
import { Page, ui } from "./ui";
import type { AdminStackParams } from "./AdminStack";

// Simple list of booked patients: serial, name and slot time.
// Tapping a name opens the medicine & test form (pre-filled if a prescription already exists).
export default function PatientsScreen({ navigation }: NativeStackScreenProps<AdminStackParams, "Patients">) {
  const { t, lang, n } = useI18n();
  const { online, doctorAppointments, prescriptions, refresh } = useClinic();
  const local = useStore().appointments;
  // Demo mode has no server, so the doctor sees the bookings made on this device
  const all = online ? doctorAppointments : local;
  const [todayKey] = useState(() => dateKey(new Date()));
  const byTime = (a: Appointment, b: Appointment) => a.start.localeCompare(b.start);
  const today = all.filter(a => a.date === todayKey).sort(byTime);
  const upcoming = all.filter(a => a.date > todayKey).sort(byTime);
  const earlier = all.filter(a => a.date < todayKey).sort((a, b) => byTime(b, a));

  // New bookings come in all day: reload the list every time this page is opened
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const time = (a: Appointment, withDate: boolean) => {
    const d = new Date(a.start);
    const date = withDate ? `${t.daysShort[d.getDay()]} ${n(d.getDate())} · ` : "";
    return `${date}${n(hm(d))} – ${n(hm(new Date(a.end)))} ${ampm(d, lang)}`;
  };

  const row = (a: Appointment, withDate = false) => {
    const rx = prescriptions.find(p => p.appointmentId === a.id);
    return (
      <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={`${a.name}, ${time(a, withDate)}`}
        onPress={() => navigation.navigate("Write", rx ? { id: rx.id } : { appointmentId: a.id })}
        style={({ pressed }) => [s.row, pressed && { backgroundColor: C.blueLt }]}>
        <View style={s.serial}><Text style={s.serialText}>{n(a.serial)}</Text></View>
        <Text style={s.name} numberOfLines={1}>{a.name}{rx ? "  📄" : ""}</Text>
        <Text style={s.time}>{time(a, withDate)}</Text>
        <Text style={s.arrow}>›</Text>
      </Pressable>
    );
  };

  const section = (title: string, list: Appointment[], withDate: boolean) => list.length > 0 && (
    <>
      <Text style={[ui.title, { marginTop: 8 }]}>{title}</Text>
      <View style={[ui.card, s.list]}>{list.map(a => row(a, withDate))}</View>
    </>
  );

  return (
    <Page>
      {section(t.todayPatients, today, false)}
      {today.length === 0 && (
        <>
          <Text style={ui.title}>{t.todayPatients}</Text>
          <Text style={[ui.muted, { marginBottom: 16 }]}>{t.noPatients}</Text>
        </>
      )}
      {section(t.upcomingPatients, upcoming, true)}
      {section(t.earlierPatients, earlier, true)}
    </Page>
  );
}

const s = StyleSheet.create({
  list: { padding: 0, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  serial: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.blueLt, alignItems: "center", justifyContent: "center" },
  serialText: { color: C.blueDk, fontWeight: "900", fontSize: 15 },
  name: { flex: 1, fontSize: 16, fontWeight: "800", color: C.text },
  time: { fontSize: 14, fontWeight: "700", color: C.blue },
  arrow: { fontSize: 24, color: C.muted, marginLeft: 2 },
});
