import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n";
import { CONTACT } from "../doctor";
import { usePatient } from "../patient";
import { useWide } from "../useWide";
import { C } from "../theme";

// Accepts Bangla digits too, e.g. ০১৭১১...
const toLatin = (s: string) => s.replace(/[০-৯]/g, d => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

// First page for patients (website and phone): clinic photo with a blue tint, a welcome
// headline with "Call Now", and a frosted login card (name + mobile number).
export default function PatientLoginScreen({ onDoctor }: { onDoctor: () => void }) {
  const { t, lang, setLang, n } = useI18n();
  const { login } = usePatient();
  const wide = useWide();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const p = toLatin(phone).replace(/[\s-]/g, "");
    if (!name.trim()) return setError(t.fillAll);
    if (!/^01[3-9]\d{8}$/.test(p)) return setError(t.badPhone);
    login({ name: name.trim(), phone: p });
  };

  return (
    <ImageBackground source={require("../../assets/web-hero.jpg")} style={s.bg} resizeMode="cover">
      <View style={s.tint}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
            {/* Top: logo + language */}
            <View style={[s.top, wide && s.topWide]}>
              <View style={s.brand}>
                <Image source={require("../../assets/web-logo-mark.png")} style={s.logo} resizeMode="contain" />
                <Text style={s.brandText}>Doctor<Text style={{ color: "#B9F5C4" }}>Bondhu</Text></Text>
              </View>
              <Pressable onPress={() => setLang(lang === "bn" ? "en" : "bn")} style={s.lang} accessibilityRole="button">
                <Text style={s.langText}>🌐 {t.language}</Text>
              </Pressable>
            </View>

            <View style={[s.body, wide && s.bodyWide]}>
              {/* Left: headline */}
              <View style={[s.hero, wide && s.heroWide]}>
                <Text style={[s.eyebrow, wide && { fontSize: 26 }]}>{t.loginEyebrow}</Text>
                <Text style={[s.headline, wide && s.headlineWide]}>{t.loginHeadline}</Text>
                <Text style={[s.sub, wide && { fontSize: 21 }]}>{t.loginSub}</Text>
                <Pressable onPress={() => Linking.openURL(`tel:${CONTACT.phones[0]}`)} accessibilityRole="link"
                  style={({ pressed }) => [s.call, pressed && { opacity: 0.85 }]}>
                  <Text style={s.callText}>📞 {t.callNow}  ·  {n(CONTACT.phones[0])}</Text>
                </Pressable>
              </View>

              {/* Right: frosted login card */}
              <View style={[s.card, wide && s.cardWide]}>
                <Text style={s.cardTitle}>{t.loginTitle1}<Text style={{ fontWeight: "900" }}>{t.loginTitle2}</Text></Text>
                <Text style={s.cardNote}>{t.loginNote}</Text>
                {error ? <Text style={s.error}>{error}</Text> : null}
                <TextInput value={name} onChangeText={setName} placeholder={t.yourName} placeholderTextColor="#64748B"
                  style={s.input} autoComplete="name" />
                <TextInput value={phone} onChangeText={setPhone} placeholder={`${t.phone} (01XXXXXXXXX)`} placeholderTextColor="#64748B"
                  style={s.input} keyboardType="phone-pad" maxLength={14} autoComplete="tel" onSubmitEditing={submit} />
                <Pressable onPress={submit} accessibilityRole="button" style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}>
                  <Text style={s.btnText}>{t.login}</Text>
                </Pressable>
                <Pressable onPress={onDoctor} accessibilityRole="link" style={{ marginTop: 14 }}>
                  <Text style={s.doctorLink}>👨‍⚕️ {t.doctorLoginLink}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const glass = Platform.OS === "web" ? ({ backdropFilter: "blur(8px)" } as ViewStyle) : {};

const s = StyleSheet.create({
  bg: { flex: 1 },
  tint: { flex: 1, backgroundColor: "rgba(11,95,214,0.55)" },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  topWide: { paddingHorizontal: "6%", marginBottom: 0 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 52, height: 42, backgroundColor: "#fff", borderRadius: 10 },
  brandText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  lang: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  langText: { color: C.blue, fontWeight: "700", fontSize: 13 },
  body: { gap: 28 },
  bodyWide: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: "8%", gap: 48 },
  hero: {},
  heroWide: { flex: 1, maxWidth: 680 },
  eyebrow: { color: "#fff", fontSize: 18, fontWeight: "300" },
  headline: { color: "#fff", fontSize: 38, fontWeight: "900", lineHeight: 46, marginVertical: 8 },
  headlineWide: { fontSize: 72, lineHeight: 84 },
  sub: { color: "#fff", fontSize: 16 },
  call: { alignSelf: "flex-start", backgroundColor: C.green, borderWidth: 1, borderColor: "#fff", paddingHorizontal: 22, paddingVertical: 12, marginTop: 22 },
  callText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  card: { borderWidth: 2, borderColor: "#fff", borderRadius: 6, padding: 22, backgroundColor: "rgba(255,255,255,0.18)", ...glass },
  cardWide: { width: 440, padding: 28 },
  cardTitle: { color: "#fff", fontSize: 30, fontWeight: "400" },
  cardNote: { color: "#fff", fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 18 },
  error: { backgroundColor: "#FDECEC", color: C.red, padding: 10, borderRadius: 4, marginBottom: 10 },
  input: { backgroundColor: "#fff", borderRadius: 4, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: C.text, marginBottom: 10 },
  btn: { alignSelf: "flex-start", backgroundColor: C.blue, borderRadius: 4, paddingHorizontal: 30, paddingVertical: 12, marginTop: 6 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  doctorLink: { color: "#fff", fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});
