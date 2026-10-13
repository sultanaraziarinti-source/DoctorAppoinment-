import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { DOCTOR } from "../../doctor";
import { useClinic } from "../../clinic";
import { useWide } from "../../useWide";
import { C } from "../../theme";
import { Button, Page, ui } from "./ui";
import type { AdminStackParams } from "./AdminStack";

// Doctor's home after login: one tile per task
export default function DashboardScreen({ navigation }: NativeStackScreenProps<AdminStackParams, "Dashboard">) {
  const { t, lang } = useI18n();
  const { signOut } = useClinic();
  const wide = useWide();
  const tiles: { icon: string; title: string; desc: string; go: () => void; color: string }[] = [
    { icon: "👥", title: t.todayPatients, desc: t.todayPatientsDesc, go: () => navigation.navigate("Patients"), color: C.green },
    { icon: "📅", title: t.calendar, desc: t.calendarDesc, go: () => navigation.navigate("Calendar"), color: C.blue },
    { icon: "📞", title: t.updatePhone, desc: t.phoneDesc, go: () => navigation.navigate("Phone"), color: C.green },
    { icon: "✏️", title: t.updateInfo, desc: t.infoDesc, go: () => navigation.navigate("Info"), color: C.blue },
  ];

  return (
    <Page>
      <Text style={ui.muted}>{t.welcome}</Text>
      <Text style={[ui.title, { fontSize: 24 }]}>{DOCTOR.name[lang]}</Text>
      <View style={s.grid}>
        {tiles.map(x => (
          <Pressable key={x.title} onPress={x.go} accessibilityRole="button"
            style={({ pressed }) => [s.tile, wide && s.tileWide, { borderTopColor: x.color }, pressed && { opacity: 0.85 }]}>
            <Text style={s.icon}>{x.icon}</Text>
            <Text style={s.tileTitle}>{x.title}</Text>
            <Text style={ui.muted}>{x.desc}</Text>
          </Pressable>
        ))}
      </View>
      <Button title={t.logout} onPress={signOut} kind="outline" />
    </Page>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  tile: { width: "47%", flexGrow: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderTopWidth: 4 },
  tileWide: { width: "30%" },
  icon: { fontSize: 30 },
  tileTitle: { fontSize: 17, fontWeight: "800", color: C.text, marginTop: 8, marginBottom: 2 },
});
