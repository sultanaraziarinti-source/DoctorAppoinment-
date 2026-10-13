import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConsultType, dateKey } from "./doctor";
import { supabase } from "./lib/supabase";

export interface Appointment {
  id: string;
  serial: number;      // 1–20, the slot's position in that day's queue
  date: string;        // yyyy-mm-dd
  start: string;       // ISO time
  end: string;
  name: string;
  age: number;
  phone: string;
  type?: ConsultType;  // missing on bookings made before consultation types existed
  createdAt: string;
}

export interface Report { id: string; name: string; result: string; date: string; }
export interface Medicine { id: string; name: string; dose: string; }

interface Store {
  ready: boolean;
  appointments: Appointment[];
  reports: Report[];
  medicines: Medicine[];
  bookedSerials: (day: Date) => Set<number>;
  /** Re-read which slots are taken from the server (other patients book all day). */
  refreshTaken: () => void;
  addAppointment: (a: Omit<Appointment, "id" | "createdAt">) => Promise<Appointment>;
  addReport: (r: Omit<Report, "id" | "date">) => void;
  removeReport: (id: string) => void;
  addMedicine: (m: Omit<Medicine, "id">) => void;
  removeMedicine: (id: string) => void;
}

const Ctx = createContext<Store>({} as Store);
const KEYS = { appointments: "db_appointments", reports: "db_reports", medicines: "db_medicines" };
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// The patient's own data is saved on this phone. Bookings also go to the server (when set up)
// so the doctor sees them and other patients can't take the same slot.
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [takenOnServer, setTaken] = useState<{ date: string; serial: number }[]>([]);

  useEffect(() => {
    AsyncStorage.multiGet(Object.values(KEYS)).then(([[, a], [, r], [, m]]) => {
      if (a) setAppointments(JSON.parse(a));
      if (r) setReports(JSON.parse(r));
      if (m) setMedicines(JSON.parse(m));
      setReady(true);
    });
  }, []);

  // Slots taken by any patient, from today on (the server is the source of truth)
  const refreshTaken = useCallback(() => {
    supabase?.rpc("taken_slots", { from_date: dateKey(new Date()) }).then(({ data }) => { if (data) setTaken(data); });
  }, []);
  useEffect(refreshTaken, [refreshTaken]);

  const persist = <T,>(key: string, setter: (v: T) => void) => (v: T) => { setter(v); AsyncStorage.setItem(key, JSON.stringify(v)); };
  const saveAppointments = persist(KEYS.appointments, setAppointments);
  const saveReports = persist(KEYS.reports, setReports);
  const saveMedicines = persist(KEYS.medicines, setMedicines);

  // With the server connected, IT decides which slots are taken (so bookings deleted there
  // free up again everywhere). The copy saved on this device is only used in demo mode.
  const bookedSerials = (day: Date) => new Set(supabase
    ? takenOnServer.filter(x => x.date === dateKey(day)).map(x => x.serial)
    : appointments.filter(a => a.date === dateKey(day)).map(a => a.serial));

  const addAppointment: Store["addAppointment"] = async a => {
    const appt: Appointment = { ...a, id: uid(), createdAt: new Date().toISOString() };
    if (supabase) {
      const { error } = await supabase.from("appointments").insert({
        id: appt.id, serial: appt.serial, date: appt.date, start: appt.start, end_time: appt.end,
        name: appt.name, age: appt.age, phone: appt.phone, type: appt.type,
      });
      if (error) throw new Error(error.message); // e.g. someone else took this slot a moment ago
      setTaken(x => [...x, { date: appt.date, serial: appt.serial }]);
    }
    saveAppointments([appt, ...appointments]);
    return appt;
  };

  return (
    <Ctx.Provider value={{
      ready, appointments, reports, medicines, bookedSerials, refreshTaken, addAppointment,
      addReport: r => saveReports([{ ...r, id: uid(), date: new Date().toISOString() }, ...reports]),
      removeReport: id => saveReports(reports.filter(x => x.id !== id)),
      addMedicine: m => saveMedicines([{ ...m, id: uid() }, ...medicines]),
      removeMedicine: id => saveMedicines(medicines.filter(x => x.id !== id)),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
