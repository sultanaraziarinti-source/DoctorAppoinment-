import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../i18n";
import { CONSULTATIONS, DOCTOR, dateKey, hoursText, nextDays, scheduleGroups, slotsFor, timeLabel } from "../doctor";
import { useStore } from "../store";
import { useClinic } from "../clinic";
import Footer from "../components/Footer";
import Slider from "../components/Slider";
import { useWide } from "../useWide";
import { C } from "../theme";
import type { HomeStackParams } from "../navigation";

// Doctor details page: profile, fee, qualification (with bio, chamber and schedule),
// then pick a date, pick one of its time slots, and book.
// Desktop browser: big photo beside the name, then the details card and the booking card below.
export default function HomeScreen({ route, navigation }: NativeStackScreenProps<HomeStackParams, "Home">) {
  const { t, lang, n } = useI18n();
  const wide = useWide();
  const s = wide ? sWeb : sPhone;
  const page = useRef<ScrollView>(null);
  // Website: where the booking card sits, so "Make Appointment" can jump straight to it
  const bookingY = useRef(0);
  const webPageY = useRef(0);
  const bookRequest = route.params?.book;
  // Every time Home comes into view: "Make Appointment" jumps to the booking card,
  // any other way back (menu, tab, logo, back button, "Back to Home") starts at the top
  // (Re-runs when Home comes into view, and when a new "Make Appointment" request arrives while it's open.)
  useFocusEffect(useCallback(() => {
    if (!bookRequest) {
      page.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    const id = setTimeout(() => {
      page.current?.scrollTo({ y: Math.max(webPageY.current + bookingY.current - 24, 0), animated: true });
    }, 50); // let the page lay out before measuring the booking card
    return () => clearTimeout(id);
  }, [bookRequest]));
  // Leaving Home: forget any "Make Appointment" request, so the next visit starts at the top
  useFocusEffect(useCallback(() => () => navigation.setParams({ book: undefined }), [navigation]));
  const [days] = useState(() => nextDays(7));
  useClinic(); // re-render when the doctor updates info or closes a day
  const [chosen, setDay] = useState<Date | null>(null);
  // If the chosen day was closed by the doctor, fall back to the first open day
  const { bookedSerials } = useStore();
  const now = new Date();
  const hasFree = (d: Date) => slotsFor(d).some(sl => sl.start > now && !bookedSerials(d).has(sl.index + 1));
  // Default: the first day that still has a free slot (today's may all have passed)
  const day = chosen && slotsFor(chosen).length > 0 ? chosen : days.find(hasFree) ?? days.find(d => slotsFor(d).length > 0) ?? days[0];
  const [picked, setSerial] = useState<number | null>(null);
  const [showBio, setShowBio] = useState(false);
  // Website slider opens at the first free slot: its x position, measured once it's drawn
  const [focusX, setFocusX] = useState(0);
  const booked = bookedSerials(day);
  const slots = slotsFor(day);
  const firstFree = slots.findIndex(sl => sl.start > now && !booked.has(sl.index + 1));
  // Drop the choice once that slot gets booked (e.g. after coming back from a booking)
  const serial = picked && !booked.has(picked) ? picked : null;
  const pickDay = (d: Date) => { setDay(d); setSerial(null); setFocusX(0); };
  const fee = CONSULTATIONS.find(c => c.id === "chamber")!.fee;
  const month = n(day.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { month: "long", year: "numeric" }));

  const profile = (
    <View style={s.profile}>
      <Image source={{ uri: DOCTOR.photo }} style={s.photo} accessibilityLabel={DOCTOR.name[lang]} />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{DOCTOR.name[lang]}</Text>
        <Text style={s.sub}>{DOCTOR.specialty[lang]}</Text>
        <Text style={s.sub}>{DOCTOR.designation[lang]}</Text>
      </View>
    </View>
  );

  // Website: small pill label, then the name as a big heading (photo sits in its own column)
  const webProfile = (
    <View style={{ marginBottom: 28 }}>
      <View style={s.pill}><Text style={s.pillText}>{DOCTOR.specialty[lang]}</Text></View>
      <Text style={s.webName}>{DOCTOR.name[lang]}</Text>
      <Text style={s.webSub}>{DOCTOR.designation[lang]}</Text>
    </View>
  );

  const details = (
    <>
      {!wide && profile}

      <View style={[s.stats, wide && s.statsWide]}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>{t.experience}</Text>
          <View style={s.statBox}><Text style={s.statIcon}>🏅</Text><Text style={s.statText}>{n(DOCTOR.experience)}{t.years}</Text></View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>{t.consultFee}</Text>
          <View style={s.statBox}><Text style={s.statIcon}>💵</Text><Text style={[s.statText, { color: C.greenDk }]}>{t.taka} {n(fee)}</Text></View>
        </View>
      </View>

      <Text style={s.label}>{t.qualification}</Text>
      <Text style={s.body}>{DOCTOR.degrees}</Text>
      {showBio && (
        <View>
          <Text style={[s.body, { marginTop: 8 }]}>{DOCTOR.bio[lang]}</Text>
          <View style={s.divider} />
          <Text style={s.label}>📍 {t.chamber}</Text>
          <Text style={s.body}>{DOCTOR.chamber[lang]}</Text>
          <Text style={[s.label, { marginTop: 12 }]}>🗓️ {t.availability}</Text>
          {scheduleGroups().map(g => {
            const range = g.from === g.to ? t.days[g.from] : `${t.days[g.from]} ${t.to} ${t.days[g.to]}`;
            const h = hoursText(g.from);
            return h
              ? <Text key={g.from} style={s.body}>{range}, <Text style={s.time}>{timeLabel(h.s, lang)} {t.to} {timeLabel(h.e, lang)}</Text></Text>
              : <Text key={g.from} style={[s.body, s.closed]}>{range} {t.closed}</Text>;
          })}
        </View>
      )}
      <Pressable onPress={() => setShowBio(v => !v)} accessibilityRole="button">
        <Text style={s.link}>{showBio ? t.hideBio : t.readBio}</Text>
      </Pressable>
    </>
  );

  const slotButtons = slots.map(sl => {
    const no = sl.index + 1;
    const taken = booked.has(no);
    const past = sl.start <= now;
    const off = taken || past;
    const on = no === serial;
    return (
      <Pressable key={no} disabled={off} onPress={() => setSerial(no)}
        onLayout={sl.index === firstFree ? e => setFocusX(Math.max(0, e.nativeEvent.layout.x - 24)) : undefined}
        style={[s.slot, on && s.slotOn, off && s.slotOff]} accessibilityState={{ selected: on, disabled: off }}>
        <Text style={[s.slotText, on && { color: "#fff" }, off && s.slotTextOff]}>
          {timeLabel(sl.start, lang)} - {timeLabel(sl.end, lang)}
        </Text>
        {/* Booked (red), Passed (grey) or Available (green) */}
        <Text style={[s.slotTag, taken ? s.tagBooked : past ? s.tagPast : s.tagFree, on && { color: "#fff" }]}>
          {taken ? t.booked : past ? t.past : t.freeSlot}
        </Text>
      </Pressable>
    );
  });

  const booking = (
    <>
      <View style={s.availHead}>
        <Text style={s.section}>{t.availabilityDays}</Text>
        <View style={s.month}><Text style={s.monthText}>📅 {month}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 2 }}>
        {days.map(d => {
          const open = slotsFor(d).length > 0;
          const on = dateKey(d) === dateKey(day);
          return (
            <Pressable key={dateKey(d)} disabled={!open} onPress={() => pickDay(d)}
              style={[s.date, on && s.dateOn, !open && s.dateOff]} accessibilityState={{ selected: on, disabled: !open }}>
              <Text style={[s.dateNum, on && { color: "#fff" }, !open && { color: C.red }]}>{n(d.getDate())}</Text>
              <Text style={[s.dateDay, on && { color: "#fff" }, !open && { color: C.red }]}>{open ? t.daysShort[d.getDay()] : t.closed}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.divider} />

      {wide
        ? <Slider gap={12} resetKey={dateKey(day)} focusX={firstFree > 0 ? focusX : 0}>{slotButtons}</Slider>
        : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 2 }}>{slotButtons}</ScrollView>}
    </>
  );


  const button = (
    <Pressable disabled={!serial} onPress={() => serial && navigation.navigate("Book", { date: dateKey(day), serial })}
      style={({ pressed }) => [s.cta, wide && s.ctaWide, !serial && s.ctaOff, pressed && { opacity: 0.85 }]}
      accessibilityRole="button" accessibilityState={{ disabled: !serial }}>
      <Text style={s.ctaText}>{t.makeAppointment}</Text>
    </Pressable>
  );

  if (wide) {
    return (
      <ScrollView ref={page} style={s.screen}>
        <ImageBackground source={require("../../assets/web-hero.jpg")} style={s.hero} resizeMode="cover">
          {/* Frosted glass label near the bottom, like the reference site */}
          <View style={s.heroGlass}>
            <Text style={s.heroTitle}>{t.makeAppointment}</Text>
            <Text style={s.heroCrumb}>{DOCTOR.name[lang]}</Text>
          </View>
        </ImageBackground>
        <View style={s.webPage} onLayout={e => { webPageY.current = e.nativeEvent.layout.y; }}>
          <View style={s.webDoctor}>
            <Image source={{ uri: DOCTOR.photo }} style={s.webPhoto} accessibilityLabel={DOCTOR.name[lang]} />
            <View style={{ flex: 1, justifyContent: "center" }}>{webProfile}</View>
          </View>
          <View style={s.webCard}>{details}</View>
          <View style={s.webCard} onLayout={e => { bookingY.current = e.nativeEvent.layout.y; }}>
            {booking}
            <View style={s.webButton}>{button}</View>
          </View>
        </View>
        <Footer links={[
          { key: "book", label: t.makeAppointment, onPress: () => navigation.setParams({ book: Date.now() }) },
          { key: "history", label: t.history, onPress: () => navigation.getParent()?.navigate("History") },
          { key: "reports", label: t.reports, onPress: () => navigation.getParent()?.navigate("Reports") },
          { key: "medicine", label: t.medicine, onPress: () => navigation.getParent()?.navigate("Medicine") },
        ]} onAdmin={() => navigation.getParent()?.navigate("Admin")} />
      </ScrollView>
    );
  }

  return (
    <View style={s.screen}>
      {/* Only as tall as its content, so the button sits right under the slots; shrinks and scrolls on small screens */}
      <ScrollView ref={page} style={s.scroll} contentContainerStyle={s.page}>
        {details}
        <View style={s.divider} />
        {booking}
      </ScrollView>

      <View style={s.footer}>{button}</View>
    </View>
  );
}

const sPhone = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 0, flexShrink: 1 },
  page: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 26 },
  photo: { width: 80, height: 80, borderRadius: 8, backgroundColor: C.blueLt },
  name: { fontSize: 18, fontWeight: "700", color: C.blueDk },
  sub: { fontSize: 13, color: C.muted, marginTop: 2 },
  stats: { flexDirection: "row", gap: 36, marginBottom: 24 },
  statsWide: { maxWidth: 560 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 5 },
  statBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: C.blue, backgroundColor: C.blueLt, borderRadius: 6, paddingVertical: 6 },
  statIcon: { fontSize: 17 },
  statText: { fontSize: 16, fontWeight: "700", color: C.blueDk },
  body: { fontSize: 14, color: C.muted, lineHeight: 20 },
  link: { color: C.blue, fontWeight: "700", textDecorationLine: "underline", marginTop: 26, marginBottom: 28 },
  time: { color: C.greenDk, fontWeight: "800" },
  closed: { color: C.red, fontWeight: "700" },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  section: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 10 },
  availHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  month: { backgroundColor: C.green, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  monthText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  date: { width: 64, paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: C.blue, alignItems: "center", backgroundColor: C.blueLt },
  dateOn: { backgroundColor: C.blue, borderColor: C.blue },
  dateOff: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  dateNum: { fontSize: 18, fontWeight: "700", color: C.text },
  dateDay: { fontSize: 14, color: C.muted, marginTop: 2 },
  slot: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 22, borderWidth: 1, borderColor: C.blue, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  slotOn: { backgroundColor: C.blue },
  slotOff: { borderColor: C.border, backgroundColor: "#F1F5F9" },
  slotText: { fontSize: 14, fontWeight: "600", color: C.blueDk, textAlign: "center", textAlignVertical: "center", includeFontPadding: false },
  slotTextOff: { color: "#94A3B8", textDecorationLine: "line-through" },
  slotTag: { fontSize: 10, color: C.red, fontWeight: "700", textAlign: "center", includeFontPadding: false },
  tagFree: { color: C.greenDk },
  tagBooked: { color: C.red },
  tagPast: { color: "#94A3B8" },
  footer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: "#fff" },
  cta: { backgroundColor: C.green, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  ctaWide: { paddingVertical: 18 },
  ctaOff: { backgroundColor: "#A3AAB5" },
  hero: { height: 420, width: "100%", justifyContent: "flex-end", alignItems: "center", paddingBottom: 44 },
  heroGlass: {
    width: "46%", minWidth: 420, alignItems: "center", paddingVertical: 14, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.55)", borderWidth: 1, borderColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(6px)",
  } as ViewStyle,
  heroTitle: { color: C.blue, fontSize: 26, fontWeight: "500" },
  heroCrumb: { color: C.blue, fontSize: 18, fontWeight: "500", marginTop: 6 },
  webPage: { width: "100%", maxWidth: 1240, alignSelf: "center", paddingHorizontal: 32, marginTop: 56, gap: 24 },
  webDoctor: { flexDirection: "row", gap: 56, alignItems: "stretch", marginBottom: 8 },
  webPhoto: { width: "28%", aspectRatio: 1, borderRadius: 32, backgroundColor: C.blueLt },
  pill: { alignSelf: "flex-start", backgroundColor: C.blueLt, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 8 },
  pillText: { color: C.blue, fontSize: 16, fontWeight: "700" },
  webName: { color: C.blue, fontSize: 52, fontWeight: "900", lineHeight: 62, marginTop: 18 },
  webSub: { color: C.muted, fontSize: 17, marginTop: 6 },
  webButton: { marginTop: 28, marginBottom: 8, width: 320, maxWidth: "100%", alignSelf: "center" },
  webCard: { backgroundColor: "#fff", borderRadius: 16, padding: 28, borderTopWidth: 4, borderTopColor: C.green,
    shadowColor: "#0A3D8F", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});

// Website (desktop browser): same styles with larger text
const sWeb = StyleSheet.create({
  ...sPhone,
  label: { ...sPhone.label, fontSize: 18, marginBottom: 8 },
  statIcon: { fontSize: 22 },
  statText: { ...sPhone.statText, fontSize: 20 },
  statBox: { ...sPhone.statBox, paddingVertical: 10 },
  body: { ...sPhone.body, fontSize: 18, lineHeight: 28 },
  link: { ...sPhone.link, fontSize: 18 },
  section: { ...sPhone.section, fontSize: 26, marginBottom: 14 },
  monthText: { ...sPhone.monthText, fontSize: 16 },
  month: { ...sPhone.month, paddingHorizontal: 14, paddingVertical: 8 },
  date: { ...sPhone.date, width: 84, paddingVertical: 14 },
  dateNum: { ...sPhone.dateNum, fontSize: 24 },
  dateDay: { ...sPhone.dateDay, fontSize: 17 },
  slot: { ...sPhone.slot, paddingHorizontal: 16, paddingVertical: 8 },
  slotText: { ...sPhone.slotText, fontSize: 17 },
  slotTag: { ...sPhone.slotTag, fontSize: 12 },
  heroTitle: { ...sPhone.heroTitle, fontSize: 34 },
  heroCrumb: { ...sPhone.heroCrumb, fontSize: 22 },
  pillText: { ...sPhone.pillText, fontSize: 19 },
  webName: { ...sPhone.webName, fontSize: 60, lineHeight: 72 },
  webSub: { ...sPhone.webSub, fontSize: 21 },
  ctaText: { ...sPhone.ctaText, fontSize: 20 },
});
