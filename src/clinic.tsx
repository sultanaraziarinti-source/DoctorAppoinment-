import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./lib/supabase";
import { CLOSED_DAYS, ClinicData, applyClinic, clinicSnapshot } from "./doctor";
import type { Appointment } from "./store";

export interface PrescribedMedicine { name: string; dose: string; }
export interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  medicines: PrescribedMedicine[];
  tests: string[];
  createdAt: string;
  updatedAt: string;
}

interface Clinic {
  /** Bumps whenever doctor info / schedule / closed days change, so screens re-render. */
  version: number;
  online: boolean;               // false = demo mode (no Supabase keys yet)
  isDoctor: boolean;
  closedDays: Set<string>;
  prescriptions: Prescription[];
  /** Doctor only: every booking (from the server; in demo mode the caller passes this device's bookings). */
  doctorAppointments: Appointment[];
  /** Patient: prescriptions written for these bookings. */
  loadMyPrescriptions: (appointmentIds: string[]) => Promise<Prescription[]>;
  /** Doctor: fetch the latest bookings and prescriptions from the server. */
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveInfo: (d: Partial<ClinicData>) => Promise<string | null>;
  setClosed: (date: string, closed: boolean) => Promise<string | null>;
  savePrescription: (p: Omit<Prescription, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<Prescription>;
}

const Ctx = createContext<Clinic>({} as Clinic);
const KEYS = { info: "db_clinic_info", closed: "db_closed_days", rx: "db_prescriptions" };
// Demo mode (no server yet): a fixed doctor login so the screens can be tried on one device
export const DEMO_LOGIN = { email: "admin@gmail.com", password: "123456" };
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const fromRow = (r: Record<string, unknown>): Prescription => ({
  id: r.id as string, appointmentId: r.appointment_id as string,
  patientName: r.patient_name as string, patientAge: r.patient_age as number, patientPhone: r.patient_phone as string,
  medicines: r.medicines as PrescribedMedicine[], tests: r.tests as string[],
  createdAt: r.created_at as string, updatedAt: r.updated_at as string,
});

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [isDoctor, setIsDoctor] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const bump = () => setVersion(v => v + 1);

  const applyClosed = (days: string[]) => { CLOSED_DAYS.clear(); days.forEach(d => CLOSED_DAYS.add(d)); };

  // Doctor's data: all prescriptions and bookings (the server only allows this when logged in)
  const loadRx = useCallback(async () => {
    if (!supabase) return;
    const [{ data: rx }, { data: appts }] = await Promise.all([
      supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("start", { ascending: false }),
    ]);
    setPrescriptions(rx ? rx.map(fromRow) : []);
    setDoctorAppointments(appts ? appts.map(a => ({
      id: a.id, serial: a.serial, date: a.date, start: a.start, end: a.end_time, name: a.name,
      age: a.age, phone: a.phone, type: a.type, createdAt: a.created_at,
    })) : []);
  }, []);

  useEffect(() => {
    (async () => {
      if (supabase) {
        const [{ data: info }, { data: closed }] = await Promise.all([
          supabase.from("clinic").select("data").eq("id", 1).maybeSingle(),
          supabase.from("closed_days").select("date"),
        ]);
        if (info?.data) applyClinic(info.data as ClinicData);
        if (closed) applyClosed(closed.map(c => c.date as string));
      } else {
        const [[, info], [, closed], [, rx]] = await AsyncStorage.multiGet(Object.values(KEYS));
        if (info) applyClinic(JSON.parse(info));
        if (closed) applyClosed(JSON.parse(closed));
        if (rx) setPrescriptions(JSON.parse(rx));
      }
      bump();
    })().catch(() => bump());

    if (!supabase) return;
    // Keep every open app/website up to date when the doctor changes something
    const ch = supabase.channel("clinic")
      .on("postgres_changes", { event: "*", schema: "public", table: "clinic" }, p => { applyClinic((p.new as { data: ClinicData }).data); bump(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "closed_days" }, async () => {
        const { data } = await supabase!.from("closed_days").select("date");
        if (data) { applyClosed(data.map(c => c.date as string)); bump(); }
      })
      .subscribe();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { setIsDoctor(!!session); loadRx(); });
    return () => { supabase!.removeChannel(ch); sub.subscription.unsubscribe(); };
  }, [loadRx]);

  const signIn: Clinic["signIn"] = async (email, password) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? error.message : null;
    }
    if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) return "wrong";
    setIsDoctor(true); // in memory only: lasts until Log out or the app/browser is closed
    return null;
  };

  const signOut = async () => {
    setIsDoctor(false);
    if (supabase) await supabase.auth.signOut();
  };

  const saveInfo: Clinic["saveInfo"] = async d => {
    applyClinic(d);
    const all = clinicSnapshot();
    bump();
    if (supabase) {
      const { error } = await supabase.from("clinic").upsert({ id: 1, data: all });
      return error?.message ?? null;
    }
    await AsyncStorage.setItem(KEYS.info, JSON.stringify(all));
    return null;
  };

  const setClosed: Clinic["setClosed"] = async (date, closed) => {
    if (closed) CLOSED_DAYS.add(date); else CLOSED_DAYS.delete(date);
    bump();
    if (supabase) {
      const { error } = closed
        ? await supabase.from("closed_days").upsert({ date })
        : await supabase.from("closed_days").delete().eq("date", date);
      if (error) return error.message;
      // Tell patients' phones (server function sends the push notifications)
      if (closed) supabase.functions.invoke("notify-closed", { body: { date } }).catch(() => {});
      return null;
    }
    await AsyncStorage.setItem(KEYS.closed, JSON.stringify([...CLOSED_DAYS]));
    return null;
  };

  const loadMyPrescriptions: Clinic["loadMyPrescriptions"] = async ids => {
    if (!ids.length) return [];
    if (!supabase) return prescriptions.filter(p => ids.includes(p.appointmentId));
    const { data } = await supabase.rpc("my_prescriptions", { appointment_ids: ids });
    return (data ?? []).map(fromRow);
  };

  const savePrescription: Clinic["savePrescription"] = async p => {
    const now = new Date().toISOString();
    const old = p.id ? prescriptions.find(x => x.id === p.id) : undefined;
    const rx: Prescription = { ...p, id: p.id ?? uid(), createdAt: old?.createdAt ?? now, updatedAt: now };
    const next = [rx, ...prescriptions.filter(x => x.id !== rx.id)];
    setPrescriptions(next);
    if (supabase) {
      await supabase.from("prescriptions").upsert({
        id: rx.id, appointment_id: rx.appointmentId, patient_name: rx.patientName, patient_age: rx.patientAge,
        patient_phone: rx.patientPhone, medicines: rx.medicines, tests: rx.tests, created_at: rx.createdAt, updated_at: rx.updatedAt,
      });
    } else {
      await AsyncStorage.setItem(KEYS.rx, JSON.stringify(next));
    }
    return rx;
  };

  return (
    <Ctx.Provider value={{
      version, online: !!supabase, isDoctor, closedDays: CLOSED_DAYS, prescriptions, doctorAppointments, loadMyPrescriptions, refresh: loadRx,
      signIn, signOut, saveInfo, setClosed, savePrescription,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useClinic = () => useContext(Ctx);
