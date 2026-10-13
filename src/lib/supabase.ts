import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Shared backend for doctor info, bookings and prescriptions.
 * null until the Supabase keys are put in .env — the app then runs in demo mode (data on this device only).
 */
export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, {
      // persistSession: false → the login lasts until Log out or the browser/app is closed
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: false, detectSessionInUrl: false },
    })
  : null;

// Only refresh the doctor's login token while the app is in the foreground
const client = supabase;
if (client && Platform.OS !== "web") {
  AppState.addEventListener("change", state => {
    if (state === "active") client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
}
