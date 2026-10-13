import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { ampm, hm, slotsFor } from "../doctor";
import { useStore } from "../store";
import { C } from "../theme";
import type { HomeStackParams } from "../navigation";

const parseDay = (key: string) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); };

// 20 slots of 15 minutes; booked and past slots can't be picked
export default function SlotsScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Slots">) {
  const { t, lang, n } = useI18n();
  const { bookedSerials } = useStore();
  const day = parseDay(route.params.date);
  const slots = slotsFor(day);
  const booked = bookedSerials(day);
  const now = new Date();

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>{t.chooseSlot}</Text>
      <Text style={s.sub}>{t.days[day.getDay()]}, {n(day.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }))}</Text>
      <View style={s.grid}>
        {slots.map(sl => {
          const serial = sl.index + 1;
          const taken = booked.has(serial);
          const past = sl.start <= now;
          const off = taken || past;
          return (
            <Pressable key={serial} disabled={off}
              onPress={() => navigation.navigate("Book", { date: route.params.date, serial, type: route.params.type })}
              style={({ pressed }) => [s.slot, off && s.slotOff, pressed && { backgroundColor: C.blueLt }]}
              accessibilityLabel={`${hm(sl.start)} - ${hm(sl.end)}`}>
              <Text style={[s.serial, off && s.textOff]}>#{n(serial)}</Text>
              <Text style={[s.time, off && s.textOff]}>{n(hm(sl.start))}–{n(hm(sl.end))}</Text>
              <Text style={[s.meta, taken && { color: C.red }]}>{taken ? t.booked : past ? t.past : ampm(sl.start, lang)}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 20, fontWeight: "800", color: C.blueDk },
  sub: { fontSize: 14, color: C.muted, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: { width: "31%", flexGrow: 1, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1.5, borderColor: C.blue },
  slotOff: { borderColor: C.border, backgroundColor: "#F1F5F9" },
  serial: { fontSize: 11, color: C.muted, fontWeight: "700" },
  time: { fontSize: 15, fontWeight: "800", color: C.blueDk, marginVertical: 2 },
  meta: { fontSize: 11, color: C.greenDk, fontWeight: "600" },
  textOff: { color: "#94A3B8" },
});
