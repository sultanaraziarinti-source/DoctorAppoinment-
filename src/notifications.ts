import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as NotificationsModule from "expo-notifications";
import { Appointment, Report } from "./store";
import { DOCTOR, hm, ampm, consultation } from "./doctor";
import { Lang, Strings, num } from "./i18n";
import { supabase } from "./lib/supabase";

// Expo Go on Android (SDK 53+) throws as soon as expo-notifications is imported,
// so the module is loaded lazily and skipped there. Use a development build for notifications.
const unsupported =
  Platform.OS === "web" ||
  (Platform.OS === "android" && Constants.executionEnvironment === ExecutionEnvironment.StoreClient);

let Notifications: typeof NotificationsModule | null = null;
if (!unsupported) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require("expo-notifications") as typeof NotificationsModule;
  // Show notifications even while the app is open
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function ensurePermission() {
  if (!Notifications) return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("appointments", {
      name: "Appointments",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Register this phone for the doctor's "chamber closed" push notifications.
 * Needs a development/store build, an EAS project id and Supabase; silently skipped otherwise.
 */
export async function registerForClosedAlerts() {
  if (!Notifications || !supabase || !(await ensurePermission())) return;
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) return;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  // Insert only; if this phone is already registered the database says "duplicate", which is fine
  await supabase.from("push_tokens").insert({ token });
}

const REMINDER_BEFORE_MS = 2 * 60 * 60 * 1000;

/**
 * 1) Confirmation right away (serial, slot, patient info).
 * 2) Reminder 2 hours before the slot, listing the last test reports to bring.
 *    If the slot is less than 2 hours away, the reminder is skipped.
 */
export async function notifyBooking(a: Appointment, reports: Report[], t: Strings, lang: Lang) {
  if (!Notifications || !(await ensurePermission())) return;
  const start = new Date(a.start);
  const end = new Date(a.end);
  const n = (v: string | number) => num(v, lang);
  const when = `${n(start.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" }))}, ${n(hm(start))}–${n(hm(end))} ${ampm(start, lang)}`;
  const c = consultation(a.type);
  const doctor = c ? `${DOCTOR.name[lang]} · ${c.name[lang]}` : DOCTOR.name[lang];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: t.notifBookedTitle,
      body: `${t.serial}: ${n(a.serial)} · ${when}\n${doctor}\n${a.name}, ${t.age} ${n(a.age)}, ${n(a.phone)}`,
      data: { appointmentId: a.id },
    },
    trigger: null,
  });

  const remindAt = start.getTime() - REMINDER_BEFORE_MS;
  if (remindAt > Date.now()) {
    const latest = reports.slice(0, 3).map(r => `• ${r.name}`).join("\n");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t.notifReminderTitle,
        body: `${doctor} · ${when} · ${t.serial} ${n(a.serial)}\n${latest ? `${t.notifReminderReports}\n${latest}` : t.notifNoReports}`,
        data: { appointmentId: a.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: remindAt, channelId: "appointments" },
    });
  }
}
