import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useI18n } from "../i18n";
import { useClinic } from "../clinic";
import { C } from "../theme";

// "User" tab on the phone: choose Patient (→ Home) or Doctor (→ login / dashboard)
export default function UserScreen({ navigation }: BottomTabScreenProps<Record<string, object | undefined>>) {
  const { t } = useI18n();
  const { isDoctor } = useClinic();
  const options = [
    { icon: "🧑", title: t.patient, desc: t.patientDesc, color: C.green, go: () => navigation.navigate("HomeTab", { screen: "Home" }) },
    { icon: "👨‍⚕️", title: t.doctor, desc: isDoctor ? t.dashboard : t.doctorDesc, color: C.blue, go: () => navigation.navigate("Admin") },
  ];
  return (
    <View style={s.screen}>
      <Text style={s.title}>{t.whoAreYou}</Text>
      {options.map(o => (
        <Pressable key={o.title} onPress={o.go} accessibilityRole="button"
          style={({ pressed }) => [s.card, { borderLeftColor: o.color }, pressed && { opacity: 0.85 }]}>
          <Text style={s.icon}>{o.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: o.color }]}>{o.title}</Text>
            <Text style={s.desc}>{o.desc}</Text>
          </View>
          <Text style={[s.arrow, { color: o.color }]}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: C.blueDk, textAlign: "center", marginBottom: 20 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 14, borderLeftWidth: 6, borderWidth: 1, borderColor: C.border },
  icon: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: "900" },
  desc: { fontSize: 14, color: C.muted, marginTop: 2 },
  arrow: { fontSize: 34, fontWeight: "300" },
});
