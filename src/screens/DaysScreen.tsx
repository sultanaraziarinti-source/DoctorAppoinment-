import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { dateKey, nextThreeDays, slotsFor, timeLabel } from "../doctor";
import { useStore } from "../store";
import { C, shadow } from "../theme";
import type { HomeStackParams } from "../navigation";

// Today + next 2 days, with how many slots are still free
export default function DaysScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Days">) {
  const { t, lang, n } = useI18n();
  const { bookedSerials } = useStore();
  const now = new Date();

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>{t.chooseDay}</Text>
      {nextThreeDays(now).map((day, i) => {
        const slots = slotsFor(day);
        const booked = bookedSerials(day);
        const free = slots.filter(sl => sl.start > now && !booked.has(sl.index + 1)).length;
        const open = slots.length > 0;
        const label = `${i === 0 ? `${t.today} · ` : ""}${t.days[day.getDay()]}`;
        const date = n(day.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }));
        return (
          <Pressable key={dateKey(day)} disabled={!open || free === 0}
            onPress={() => navigation.navigate("Slots", { date: dateKey(day), type: route.params?.type })}
            style={({ pressed }) => [s.card, shadow, !open && s.cardOff, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.day}>{label}</Text>
              <Text style={s.date}>{date}</Text>
              {open && <Text style={s.hours}>{timeLabel(slots[0].start, lang)} – {timeLabel(slots[slots.length - 1].end, lang)}</Text>}
            </View>
            {open
              ? <View style={[s.badge, free === 0 && { backgroundColor: "#FDECEC" }]}><Text style={[s.badgeText, free === 0 && { color: C.red }]}>{n(free)}{t.slotsLeft}</Text></View>
              : <Text style={s.closed}>{t.noSchedule}</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 20, fontWeight: "800", color: C.blueDk, marginBottom: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: C.blue },
  cardOff: { opacity: 0.55, borderLeftColor: C.border },
  day: { fontSize: 17, fontWeight: "800", color: C.text },
  date: { fontSize: 14, color: C.muted, marginTop: 2 },
  hours: { fontSize: 13, color: C.blue, marginTop: 4, fontWeight: "600" },
  badge: { backgroundColor: C.greenLt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: C.greenDk, fontWeight: "800", fontSize: 13 },
  closed: { color: C.red, fontWeight: "700", fontSize: 13, maxWidth: 120, textAlign: "right" },
});
