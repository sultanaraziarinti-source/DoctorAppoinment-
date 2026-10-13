import { Lang, num } from "./i18n";

export const SLOT_MINUTES = 15;
export const SLOTS_PER_DAY = 20;

/** Chamber start time per weekday (0 = Sunday). null = no chamber that day. 20 slots × 15 min = 5 hours.
 *  These are the defaults; the doctor edits them from "Update Info" (see applyClinic). */
export const SCHEDULE: (string | null)[] = [
  "17:00", // Sunday    5:00 PM – 10:00 PM
  "17:00", // Monday
  "17:00", // Tuesday
  "17:00", // Wednesday
  "17:00", // Thursday
  null,    // Friday    closed
  "17:00", // Saturday
];

export const DOCTOR = {
  name: { bn: "ডা. মোঃ রফিকুল ইসলাম", en: "Dr. Md. Rafiqul Islam" },
  degrees: "MBBS, FCPS (Medicine), MD (Cardiology)",
  specialty: { bn: "মেডিসিন ও হৃদরোগ বিশেষজ্ঞ", en: "Medicine & Cardiology Specialist" },
  designation: { bn: "সহযোগী অধ্যাপক, ঢাকা মেডিকেল কলেজ হাসপাতাল", en: "Associate Professor, Dhaka Medical College Hospital" },
  chamber: { bn: "বন্ধু ডায়াগনস্টিক সেন্টার, ধানমন্ডি, ঢাকা", en: "Bondhu Diagnostic Centre, Dhanmondi, Dhaka" },
  experience: 12,
  bio: {
    bn: "ডা. মোঃ রফিকুল ইসলাম ১২ বছরেরও বেশি সময় ধরে মেডিসিন ও হৃদরোগের চিকিৎসা দিচ্ছেন। উচ্চ রক্তচাপ, ডায়াবেটিস, বুকে ব্যথা ও হৃদরোগ নিয়ন্ত্রণে তাঁর বিশেষ অভিজ্ঞতা রয়েছে।",
    en: "Dr. Md. Rafiqul Islam has been treating medicine and heart patients for over 12 years, with special experience in high blood pressure, diabetes, chest pain and heart disease management.",
  },
  photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
};

export type ConsultType = "chamber" | "video";

/** Consultation types offered, with fee in taka. */
export const CONSULTATIONS: { id: ConsultType; icon: string; fee: number; name: Record<Lang, string> }[] = [
  { id: "chamber", icon: "🏥", fee: 1000, name: { bn: "চেম্বারে সরাসরি", en: "In-Person" } },
  { id: "video", icon: "📹", fee: 800, name: { bn: "ভিডিও কনসালটেশন", en: "Video Consultation" } },
];
export const consultation = (id?: ConsultType) => CONSULTATIONS.find(c => c.id === id);

/** Chamber contact details shown in the website header and footer. The doctor edits them from "Update Phone Number". */
export const CONTACT = {
  phones: ["01XXXXXXXXX"],
  email: "info@doctorbondhu.com",
};

/** Dates the doctor marked closed on the calendar (yyyy-mm-dd). */
export const CLOSED_DAYS = new Set<string>();

export type DoctorInfo = typeof DOCTOR;
export interface ClinicData {
  doctor: DoctorInfo;
  fee: number;
  schedule: (string | null)[];
  contact: { phones: string[]; email: string };
}

/** A copy of the clinic info currently shown in the app. */
export const clinicSnapshot = (): ClinicData => JSON.parse(JSON.stringify({
  doctor: DOCTOR, fee: consultation("chamber")!.fee, schedule: SCHEDULE, contact: CONTACT,
}));

/** Replace the clinic info everywhere in the app (after the doctor saves, or when it loads from the server). */
export function applyClinic(d: Partial<ClinicData>) {
  if (d.doctor) Object.assign(DOCTOR, d.doctor);
  if (d.fee != null) consultation("chamber")!.fee = d.fee;
  if (d.schedule?.length === 7) SCHEDULE.splice(0, 7, ...d.schedule);
  if (d.contact) { CONTACT.phones = [...d.contact.phones]; CONTACT.email = d.contact.email; }
}

export interface Slot { index: number; start: Date; end: Date; }

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "5:00" style 12-hour time without AM/PM, as used on the slot buttons. */
export const hm = (d: Date) => `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;
export const ampm = (d: Date, lang: Lang) =>
  lang === "bn" ? (d.getHours() < 4 || d.getHours() >= 20 ? "রাত" : d.getHours() < 12 ? "সকাল" : d.getHours() < 16 ? "দুপুর" : d.getHours() < 18 ? "বিকাল" : "সন্ধ্যা") : d.getHours() < 12 ? "AM" : "PM";

/** Full time label: "বিকাল ৫:০০" in Bangla (period first), "5:00 PM" in English. */
export const timeLabel = (d: Date, lang: Lang) =>
  lang === "bn" ? `${ampm(d, lang)} ${num(hm(d), lang)}` : `${hm(d)} ${ampm(d, lang)}`;

/** Weekdays in Bangladesh order, Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

export function slotsFor(day: Date): Slot[] {
  const start = SCHEDULE[day.getDay()];
  if (!start || CLOSED_DAYS.has(dateKey(day))) return [];
  const [h, m] = start.split(":").map(Number);
  return Array.from({ length: SLOTS_PER_DAY }, (_, i) => {
    const s = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m + i * SLOT_MINUTES);
    return { index: i, start: s, end: new Date(s.getTime() + SLOT_MINUTES * 60_000) };
  });
}

/** Today and the following days. */
export function nextDays(count: number, now = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
}
export const nextThreeDays = (now = new Date()) => nextDays(3, now);

/** Weekly hours text for the home card, e.g. "5:00 – 10:00". */
export function hoursText(weekday: number) {
  const start = SCHEDULE[weekday];
  if (!start) return null;
  const [h, m] = start.split(":").map(Number);
  const s = new Date(2000, 0, 1, h, m);
  const e = new Date(s.getTime() + SLOTS_PER_DAY * SLOT_MINUTES * 60_000);
  return { s, e };
}

/** Consecutive weekdays (Saturday first) with the same hours, e.g. Saturday–Thursday 17:00, Friday closed. */
export function scheduleGroups() {
  const groups: { from: number; to: number; start: string | null }[] = [];
  for (const d of WEEK_ORDER) {
    const last = groups[groups.length - 1];
    if (last && last.start === SCHEDULE[d]) last.to = d;
    else groups.push({ from: d, to: d, start: SCHEDULE[d] });
  }
  return groups;
}
