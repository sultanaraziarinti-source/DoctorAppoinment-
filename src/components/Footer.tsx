import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { useClinic } from "../clinic";
import { CONTACT, DOCTOR, hoursText, scheduleGroups, timeLabel } from "../doctor";
import { C } from "../theme";

export interface FooterLink { key: string; label: string; onPress: () => void; }

// Website footer (desktop browser): brand, working hours, more services, contact
export default function Footer({ links, onAdmin }: { links: FooterLink[]; onAdmin: () => void }) {
  const { t, lang, n } = useI18n();
  const { isDoctor } = useClinic();
  return (
    <View style={s.footer}>
      <View style={s.cols}>
        <View style={[s.col, { flex: 1.3 }]}>
          <View style={s.brand}>
            <Image source={require("../../assets/web-logo-mark.png")} style={s.logo} resizeMode="contain" />
            <Text style={s.title}><Text style={{ color: "#fff" }}>Doctor</Text><Text style={{ color: "#7EE08F" }}>Bondhu</Text></Text>
          </View>
          <Text style={s.text}>{t.footerAbout}</Text>
        </View>

        <View style={s.col}>
          <Text style={s.heading}>{t.workingHours}</Text>
          {scheduleGroups().map(g => {
            const days = g.from === g.to ? t.days[g.from] : `${t.days[g.from]} ${t.to} ${t.days[g.to]}`;
            const h = hoursText(g.from);
            return (
              h ? (
                <View key={g.from} style={{ marginBottom: 8 }}>
                  <Text style={s.text}>{days}</Text>
                  <Text style={s.strong}>{timeLabel(h.s, lang)} {t.to} {timeLabel(h.e, lang)}</Text>
                </View>
              ) : (
                // Closed days on one line, e.g. "Friday: Closed"
                <Text key={g.from} style={[s.text, { marginBottom: 8 }]}>
                  {days}: <Text style={[s.strong, { color: "#FCA5A5" }]}>{t.closed}</Text>
                </Text>
              )
            );
          })}
        </View>

        <View style={s.col}>
          <Text style={s.heading}>{t.moreServices}</Text>
          {links.map(l => (
            <Pressable key={l.key} onPress={l.onPress} accessibilityRole="link">
              <Text style={s.link}>›  {l.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.col}>
          <Text style={s.heading}>{t.contact}</Text>
          {CONTACT.phones.map(p => (
            <Pressable key={p} onPress={() => Linking.openURL(`tel:${p}`)} accessibilityRole="link">
              <Text style={s.link}>📞  {n(p)}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)} accessibilityRole="link">
            <Text style={s.link}>✉️  {CONTACT.email}</Text>
          </Pressable>
          <Text style={[s.text, { marginTop: 4 }]}>📍  {DOCTOR.chamber[lang]}</Text>
        </View>
      </View>

      <View style={s.bottom}>
        <Text style={s.copy}>© {n(new Date().getFullYear())} DoctorBondhu · {t.appTagline}</Text>
        <Pressable onPress={onAdmin} accessibilityRole="link" style={s.admin}>
          <Text style={s.adminText}>{isDoctor ? `👨‍⚕️ ${t.dashboard}` : `🔒 ${t.adminLogin}`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  footer: { backgroundColor: C.blueDk, marginTop: 56 },
  cols: { flexDirection: "row", flexWrap: "wrap", gap: 40, paddingHorizontal: "8%", paddingVertical: 48 },
  col: { flex: 1, minWidth: 200 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  logo: { width: 56, height: 44, backgroundColor: "#fff", borderRadius: 10 },
  title: { fontSize: 28, fontWeight: "900" },
  heading: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 16, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: C.green, alignSelf: "flex-start" },
  text: { color: "#CFE0FB", fontSize: 17, lineHeight: 27 },
  strong: { color: "#fff", fontSize: 17, fontWeight: "700" },
  link: { color: "#E7F0FE", fontSize: 17, lineHeight: 34 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", paddingVertical: 16, paddingHorizontal: "8%" },
  admin: { borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  adminText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  copy: { color: "#CFE0FB", fontSize: 16 },
});
