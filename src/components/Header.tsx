import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n";
import { CONTACT, DOCTOR, hoursText, scheduleGroups, timeLabel } from "../doctor";
import { useWide } from "../useWide";
import { C } from "../theme";

export interface NavLink { key: string; label: string; active: boolean; onPress: () => void; }

// Logo + language switch (বাংলা / English), shown on every tab.
// On a desktop browser it becomes a website header: blue info strip, then logo / menu / booking button.
export default function Header({ links = [], onBook }: { links?: NavLink[]; onBook?: () => void }) {
  const { t, lang, setLang, n } = useI18n();
  const insets = useSafeAreaInsets();
  const wide = useWide();

  const langButton = (
    <Pressable onPress={() => setLang(lang === "bn" ? "en" : "bn")} style={wide ? s.langWide : s.lang} accessibilityRole="button">
      <Text style={wide ? s.langTextWide : s.langText}>🌐 {t.language}</Text>
    </Pressable>
  );

  if (!wide) {
    return (
      <View style={[s.wrap, { paddingTop: insets.top + 4 }]}>
        <View style={s.brand} accessible accessibilityLabel="DoctorBondhu">
          <Image source={require("../../assets/logo-mark.png")} style={s.logo} resizeMode="contain" />
          <View>
            <Text style={s.title}><Text style={{ color: C.blue }}>Doctor</Text><Text style={{ color: C.green }}>Bondhu</Text></Text>
            <Text style={s.tagline}>{t.appTagline}</Text>
          </View>
        </View>
        {langButton}
      </View>
    );
  }

  // Opening hours for the info strip, e.g. "Saturday to Thursday: 5:00 PM to 10:00 PM"
  const hours = scheduleGroups().filter(g => hoursText(g.from)).map(g => {
    const h = hoursText(g.from)!;
    const days = g.from === g.to ? t.days[g.from] : `${t.days[g.from]} ${t.to} ${t.days[g.to]}`;
    return `${days}: ${timeLabel(h.s, lang)} ${t.to} ${timeLabel(h.e, lang)}`;
  }).join("  ·  ");

  return (
    <View>
      <View style={s.strip}>
        <View style={s.stripInfo}>
          <Text style={s.stripText}>📍  {DOCTOR.chamber[lang]}</Text>
          <Text style={s.stripText}>🕔  {hours}</Text>
          <Pressable onPress={() => Linking.openURL(`tel:${CONTACT.phones[0]}`)} accessibilityRole="link">
            <Text style={[s.stripText, { fontWeight: "700" }]}>📞  {n(CONTACT.phones[0])}</Text>
          </Pressable>
        </View>
        {langButton}
      </View>
      <View style={s.bar}>
        <View style={s.brand} accessible accessibilityLabel="DoctorBondhu">
          <Image source={require("../../assets/web-logo-mark.png")} style={s.logoWide} resizeMode="contain" />
          <View>
            <Text style={s.titleWide}><Text style={{ color: C.blue }}>Doctor</Text><Text style={{ color: C.green }}>Bondhu</Text></Text>
            <Text style={s.taglineWide}>{t.appTagline}</Text>
          </View>
        </View>
        <View style={s.menu}>
          {links.map(l => (
            <Pressable key={l.key} onPress={l.onPress} accessibilityRole="link" style={s.menuItem}>
              <Text style={[s.menuText, l.active && s.menuTextOn]}>{l.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onBook} accessibilityRole="button" style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}>
          <Text style={s.ctaText}>{t.makeAppointment}  📅</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 6, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: C.border },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  logo: { width: 38, height: 38, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: "900" },
  tagline: { fontSize: 11, color: C.muted },
  lang: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.blue },
  langText: { color: C.blue, fontWeight: "700", fontSize: 13 },

  // desktop
  strip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.blue, paddingHorizontal: "8%", paddingVertical: 10 },
  stripInfo: { flexDirection: "row", flexWrap: "wrap", columnGap: 36, rowGap: 4, flexShrink: 1 },
  stripText: { color: "#fff", fontSize: 17 },
  langWide: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: "#fff" },
  langTextWide: { color: C.blue, fontWeight: "700", fontSize: 16 },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: "8%", paddingVertical: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: C.border },
  logoWide: { width: 84, height: 66 },
  titleWide: { fontSize: 34, fontWeight: "900" },
  taglineWide: { fontSize: 17, color: C.muted, fontWeight: "600" },
  menu: { flexDirection: "row", gap: 8 },
  menuItem: { paddingHorizontal: 18, paddingVertical: 8 },
  menuText: { fontSize: 20, color: C.blue, fontWeight: "500" },
  menuTextOn: { color: C.green, fontWeight: "700" },
  cta: { backgroundColor: C.blue, borderRadius: 40, paddingHorizontal: 28, paddingVertical: 16 },
  ctaText: { color: "#fff", fontSize: 20, fontWeight: "800" },
});
