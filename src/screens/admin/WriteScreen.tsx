import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { PrescribedMedicine, useClinic } from "../../clinic";
import { useStore } from "../../store";
import { C } from "../../theme";
import { Button, Field, Page, ui } from "./ui";
import type { AdminStackParams } from "./AdminStack";

// Doctor writes medicines (name + dose) and tests on one page, then saves → prescription view.
// Opened again with an existing prescription id to edit it.
export default function WriteScreen({ route, navigation }: NativeStackScreenProps<AdminStackParams, "Write">) {
  const { t, n } = useI18n();
  const { online, doctorAppointments, prescriptions, savePrescription } = useClinic();
  const local = useStore().appointments;
  const existing = prescriptions.find(p => p.id === route.params.id);
  const appt = [...(online ? doctorAppointments : local)].find(a => a.id === (existing?.appointmentId ?? route.params.appointmentId));

  const [meds, setMeds] = useState<PrescribedMedicine[]>(existing?.medicines.length ? existing.medicines : [{ name: "", dose: "" }]);
  const [tests, setTests] = useState<string[]>(existing?.tests.length ? existing.tests : [""]);
  const [busy, setBusy] = useState(false);

  const patient = existing
    ? { name: existing.patientName, age: existing.patientAge, phone: existing.patientPhone }
    : appt && { name: appt.name, age: appt.age, phone: appt.phone };
  if (!patient) return null;

  const submit = async () => {
    setBusy(true);
    const rx = await savePrescription({
      id: existing?.id,
      appointmentId: existing?.appointmentId ?? appt!.id,
      patientName: patient.name, patientAge: patient.age, patientPhone: patient.phone,
      medicines: meds.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), dose: m.dose.trim() })),
      tests: tests.map(x => x.trim()).filter(Boolean),
    });
    setBusy(false);
    navigation.replace("Prescription", { id: rx.id });
  };

  return (
    <Page>
      <View style={[ui.card, { backgroundColor: C.blueLt, borderColor: C.blueLt }]}>
        <Text style={s.patient}>👤 {appt ? `${n(appt.serial)}. ` : ""}{patient.name}</Text>
        <Text style={ui.muted}>{t.age} {n(patient.age)} · {n(patient.phone)}</Text>
      </View>

      <View style={ui.card}>
        <Text style={s.section}>💊 {t.medicines}</Text>
        {meds.map((m, i) => (
          <View key={i} style={ui.row}>
            <Field label={`${n(i + 1)}. ${t.medName}`} value={m.name}
              onChangeText={v => setMeds(x => x.map((y, j) => j === i ? { ...y, name: v } : y))} />
            <Field label={t.medDose} value={m.dose}
              onChangeText={v => setMeds(x => x.map((y, j) => j === i ? { ...y, dose: v } : y))} />
            {meds.length > 1 && (
              <Pressable onPress={() => setMeds(x => x.filter((_, j) => j !== i))} accessibilityLabel={t.remove}>
                <Text style={ui.remove}>×</Text>
              </Pressable>
            )}
          </View>
        ))}
        <Pressable onPress={() => setMeds(x => [...x, { name: "", dose: "" }])}><Text style={ui.add}>{t.addRow}</Text></Pressable>
      </View>

      <View style={ui.card}>
        <Text style={s.section}>🧪 {t.tests}</Text>
        {tests.map((v, i) => (
          <View key={i} style={ui.row}>
            <Field label={`${n(i + 1)}. ${t.testName}`} value={v}
              onChangeText={x => setTests(arr => arr.map((y, j) => j === i ? x : y))} />
            {tests.length > 1 && (
              <Pressable onPress={() => setTests(x => x.filter((_, j) => j !== i))} accessibilityLabel={t.remove}>
                <Text style={ui.remove}>×</Text>
              </Pressable>
            )}
          </View>
        ))}
        <Pressable onPress={() => setTests(x => [...x, ""])}><Text style={ui.add}>{t.addRow}</Text></Pressable>
      </View>

      <Button title={t.saveRx} onPress={submit} disabled={busy} />
    </Page>
  );
}

const s = StyleSheet.create({
  patient: { fontSize: 18, fontWeight: "800", color: C.blueDk },
  section: { fontSize: 17, fontWeight: "800", color: C.blueDk, marginBottom: 10 },
});
