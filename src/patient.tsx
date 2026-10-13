import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Patient { name: string; phone: string; }

interface PatientCtx {
  ready: boolean;
  patient: Patient | null;
  login: (p: Patient) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<PatientCtx>({} as PatientCtx);
const KEY = "db_patient";

// The patient "logs in" with name + phone (no password). It's remembered on this device
// until they log out, and pre-fills the booking form.
export function PatientProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v) setPatient(JSON.parse(v)); })
      .finally(() => setReady(true));
  }, []);

  const login = async (p: Patient) => { setPatient(p); await AsyncStorage.setItem(KEY, JSON.stringify(p)); };
  const logout = async () => { setPatient(null); await AsyncStorage.removeItem(KEY); };

  return <Ctx.Provider value={{ ready, patient, login, logout }}>{children}</Ctx.Provider>;
}

export const usePatient = () => useContext(Ctx);
