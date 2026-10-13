import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Lang = "bn" | "en";

const STRINGS = {
  bn: {
    appTagline: "ডাক্তার বুক করুন, সুস্থ থাকুন",
    home: "হোম", history: "ইতিহাস", reports: "টেস্ট রিপোর্ট", medicine: "বর্তমান ওষুধ",
    specialist: "বিশেষজ্ঞ", designation: "পদবি", chamber: "চেম্বার",
    availability: "সময়সূচি", closed: "বন্ধ", to: "থেকে",
    getAppointment: "অ্যাপয়েন্টমেন্ট নিন", appointment: "অ্যাপয়েন্টমেন্ট", consultTypes: "কনসালটেশনের ধরন", experience: "অভিজ্ঞতা", years: "+ বছর", consultFee: "কনসালটেশন ফি", qualification: "যোগ্যতা", readBio: "জীবনী পড়ুন", hideBio: "কম দেখান", makeAppointment: "অ্যাপয়েন্টমেন্ট নিন", workingHours: "কাজের সময়", moreServices: "আরও সেবা", contact: "যোগাযোগ", footerAbout: "ঘরে বসেই বিশেষজ্ঞ ডাক্তারের সিরিয়াল নিন, রিপোর্ট ও ওষুধের তথ্য এক জায়গায় রাখুন।", close: "বন্ধ করুন", availabilityDays: "দিন বেছে নিন", daysShort: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"], consultType: "কনসালটেশন", fee: "ফি", taka: "৳", chooseType: "কনসালটেশনের ধরন বেছে নিন",
    chooseDay: "দিন নির্বাচন করুন", today: "আজ",
    chooseSlot: "সময় নির্বাচন করুন", slotsLeft: "টি স্লট খালি", booked: "বুকড", past: "সময় শেষ",
    noSchedule: "এই দিনে ডাক্তার বসেন না",
    patientInfo: "রোগীর তথ্য", name: "নাম", age: "বয়স", phone: "ফোন নম্বর",
    submit: "জমা দিন", fillAll: "সব তথ্য সঠিকভাবে পূরণ করুন",
    badPhone: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)",
    confirmed: "অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে",
    serial: "সিরিয়াল নং", date: "তারিখ", time: "সময়",
    backHome: "হোমে ফিরুন",
    noHistory: "এখনও কোনো অ্যাপয়েন্টমেন্ট নেই",
    upcoming: "আসন্ন", done: "সম্পন্ন",
    noReports: "কোনো রিপোর্ট নেই", noMedicine: "কোনো ওষুধ নেই",
    addReport: "রিপোর্ট যোগ করুন", addMedicine: "ওষুধ যোগ করুন",
    reportName: "টেস্টের নাম (যেমন CBC)", reportResult: "ফলাফল / মন্তব্য",
    medName: "ওষুধের নাম", medDose: "ডোজ (যেমন ১+০+১, খাবারের পরে)",
    save: "সংরক্ষণ", remove: "মুছুন",
    notifBookedTitle: "অ্যাপয়েন্টমেন্ট নিশ্চিত ✅",
    notifReminderTitle: "অ্যাপয়েন্টমেন্ট ২ ঘণ্টা পরে ⏰",
    notifReminderReports: "সঙ্গে আনুন সর্বশেষ টেস্ট রিপোর্ট:",
    notifNoReports: "আপনার সর্বশেষ টেস্ট রিপোর্টগুলো সঙ্গে আনুন।",
    language: "English",
    // doctor / admin
    user: "ব্যবহারকারী", patient: "রোগী", doctor: "ডাক্তার", whoAreYou: "আপনি কে?",
    patientDesc: "সিরিয়াল নিন, রিপোর্ট ও ওষুধ দেখুন", doctorDesc: "লগইন করে রোগী ও প্রেসক্রিপশন দেখুন",
    adminLogin: "অ্যাডমিন লগইন", doctorLogin: "ডাক্তার লগইন", email: "ইমেইল", password: "পাসওয়ার্ড",
    login: "লগইন", logout: "লগআউট", loginFailed: "ইমেইল বা পাসওয়ার্ড ভুল",
    demoMode: "ডেমো মোড: সার্ভার এখনো যুক্ত হয়নি। ডেমো লগইন:",
    dashboard: "ড্যাশবোর্ড", welcome: "স্বাগতম",
    writeMedicine: "ওষুধ লিখুন", writeTests: "টেস্ট লিখুন", calendar: "ক্যালেন্ডার", updatePhone: "ফোন নম্বর পরিবর্তন", updateInfo: "তথ্য পরিবর্তন",
    medicineDesc: "রোগীর জন্য ওষুধ ও ডোজ", testsDesc: "রোগীর জন্য টেস্টের নাম", calendarDesc: "কোন দিন বসবেন তা ঠিক করুন",
    phoneDesc: "সব জায়গার নম্বর একসাথে বদলান", infoDesc: "নাম, অভিজ্ঞতা, ফি, চেম্বার, সময়সূচি",
    choosePatient: "রোগী নির্বাচন করুন", noPatients: "এখনো কোনো রোগী সিরিয়াল নেয়নি",
    todayPatients: "আজকের রোগী", todayPatientsDesc: "আজকের ২০টি সিরিয়াল — রোগী বেছে ওষুধ ও টেস্ট লিখুন", freeSlot: "খালি", noChamberToday: "আজ চেম্বার বন্ধ", earlierPatients: "আগের রোগী", upcomingPatients: "পরের দিনের রোগী", addRx: "ওষুধ ও টেস্ট যোগ করুন", editRx: "ওষুধ ও টেস্ট সম্পাদনা", viewRx: "প্রেসক্রিপশন দেখুন", writeRx: "ওষুধ ও টেস্ট লিখুন", saveRx: "সংরক্ষণ করুন", noRxYet: "ডাক্তার এখনো কোনো ওষুধ লেখেননি",
    medicines: "ওষুধ", tests: "টেস্ট", addRow: "+ আরেকটি যোগ করুন", testName: "টেস্টের নাম (যেমন CBC)",
    prescription: "প্রেসক্রিপশন", edit: "সম্পাদনা", noItems: "কিছু লেখা হয়নি", rxDate: "তারিখ",
    advisedTests: "পরামর্শকৃত টেস্ট", writtenBy: "লিখেছেন",
    tapToClose: "যেদিন বসবেন না সেদিন চাপুন — লাল মানে বন্ধ", markedClosed: "বন্ধ ঘোষণা করা হয়েছে",
    weeklyOff: "সাপ্তাহিক বন্ধ", saved: "সংরক্ষিত হয়েছে", phones: "ফোন নম্বর", addPhone: "+ নম্বর যোগ করুন",
    doctorName: "ডাক্তারের নাম", specialty: "বিশেষত্ব", feeTaka: "কনসালটেশন ফি (৳)", experienceYears: "অভিজ্ঞতা (বছর)",
    biography: "জীবনী", photoUrl: "ছবির লিংক", startTime: "শুরুর সময় (যেমন 17:00)", closedDay: "বন্ধ",
    inBangla: "বাংলায়", inEnglish: "ইংরেজিতে", prescribedByDoctor: "ডাক্তারের প্রেসক্রিপশন", notSignedIn: "লগইন করা নেই",
    days: ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"],
  },
  en: {
    appTagline: "Book Your Doctor, Stay Healthy",
    home: "Home", history: "History", reports: "Test Reports", medicine: "Current Medicine",
    specialist: "Specialist", designation: "Designation", chamber: "Chamber",
    availability: "Schedule", closed: "Closed", to: "to",
    getAppointment: "Get Appointment", appointment: "Appointment", consultTypes: "Consultation Type", experience: "Experience", years: "+ Yrs", consultFee: "Consultation Fee", qualification: "Qualification", readBio: "Read Biography", hideBio: "Show less", makeAppointment: "Make Appointment", workingHours: "Working Hours", moreServices: "More Services", contact: "Contact", footerAbout: "Book a specialist doctor's serial from home, and keep your reports and medicines in one place.", close: "Close", availabilityDays: "Availability", daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], consultType: "Consultation", fee: "Fee", taka: "৳", chooseType: "Choose a consultation type",
    chooseDay: "Choose a day", today: "Today",
    chooseSlot: "Choose a time", slotsLeft: " slots free", booked: "Booked", past: "Passed",
    noSchedule: "The doctor is not available this day",
    patientInfo: "Patient Information", name: "Name", age: "Age", phone: "Phone number",
    submit: "Submit", fillAll: "Please fill in all fields correctly",
    badPhone: "Enter a valid 11-digit mobile number (01XXXXXXXXX)",
    confirmed: "Appointment confirmed",
    serial: "Serial No", date: "Date", time: "Time",
    backHome: "Back to Home",
    noHistory: "No appointments yet",
    upcoming: "Upcoming", done: "Done",
    noReports: "No reports yet", noMedicine: "No medicine yet",
    addReport: "Add report", addMedicine: "Add medicine",
    reportName: "Test name (e.g. CBC)", reportResult: "Result / note",
    medName: "Medicine name", medDose: "Dose (e.g. 1+0+1, after meals)",
    save: "Save", remove: "Remove",
    notifBookedTitle: "Appointment confirmed ✅",
    notifReminderTitle: "Appointment in 2 hours ⏰",
    notifReminderReports: "Please bring your latest test reports:",
    notifNoReports: "Please bring your latest test reports.",
    language: "বাংলা",
    // doctor / admin
    user: "User", patient: "Patient", doctor: "Doctor", whoAreYou: "Who are you?",
    patientDesc: "Book a serial, see reports and medicine", doctorDesc: "Log in to see patients and prescriptions",
    adminLogin: "Admin Login", doctorLogin: "Doctor Login", email: "Email", password: "Password",
    login: "Log in", logout: "Log out", loginFailed: "Wrong email or password",
    demoMode: "Demo mode: no server connected yet. Demo login:",
    dashboard: "Dashboard", welcome: "Welcome",
    writeMedicine: "Medicine", writeTests: "Tests", calendar: "Calendar", updatePhone: "Update Phone Number", updateInfo: "Update Info",
    medicineDesc: "Medicines and doses for a patient", testsDesc: "Tests to do for a patient", calendarDesc: "Set which days you are available",
    phoneDesc: "Change the number everywhere at once", infoDesc: "Name, experience, fee, chamber, schedule",
    choosePatient: "Choose a patient", noPatients: "No patient has booked yet",
    todayPatients: "Today's Patients", todayPatientsDesc: "Today's 20 serials — pick a patient to write medicine and tests", freeSlot: "Free", noChamberToday: "No chamber today", earlierPatients: "Earlier patients", upcomingPatients: "Upcoming patients", addRx: "Add medicine & tests", editRx: "Edit medicine & tests", viewRx: "View prescription", writeRx: "Write medicine & tests", saveRx: "Save", noRxYet: "The doctor hasn't prescribed any medicine yet",
    medicines: "Medicines", tests: "Tests", addRow: "+ Add another", testName: "Test name (e.g. CBC)",
    prescription: "Prescription", edit: "Edit", noItems: "Nothing written", rxDate: "Date",
    advisedTests: "Advised tests", writtenBy: "Written by",
    tapToClose: "Tap a day you won't sit — red means closed", markedClosed: "Marked closed",
    weeklyOff: "Weekly off", saved: "Saved", phones: "Phone numbers", addPhone: "+ Add number",
    doctorName: "Doctor's name", specialty: "Specialty", feeTaka: "Consultation fee (৳)", experienceYears: "Experience (years)",
    biography: "Biography", photoUrl: "Photo link", startTime: "Start time (e.g. 17:00)", closedDay: "Closed",
    inBangla: "In Bangla", inEnglish: "In English", prescribedByDoctor: "Doctor's prescription", notSignedIn: "Not signed in",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
};

export type Strings = typeof STRINGS.en;

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Shows digits in Bangla when the app language is Bangla. */
export const num = (v: string | number, lang: Lang) =>
  lang === "bn" ? String(v).replace(/\d/g, d => BN_DIGITS[Number(d)]) : String(v);

interface I18n { lang: Lang; t: Strings; setLang: (l: Lang) => void; n: (v: string | number) => string; }

const Ctx = createContext<I18n>({} as I18n);
const KEY = "db_lang";

// Bangla is the default language; the choice is remembered on the phone
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => { if (v === "en" || v === "bn") setLangState(v); });
  }, []);

  const setLang = (l: Lang) => { setLangState(l); AsyncStorage.setItem(KEY, l); };

  return (
    <Ctx.Provider value={{ lang, t: STRINGS[lang] as Strings, setLang, n: v => num(v, lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
