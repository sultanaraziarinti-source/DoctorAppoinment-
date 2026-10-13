import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nProvider } from "./src/i18n";
import { StoreProvider } from "./src/store";
import { ensurePermission, registerForClosedAlerts } from "./src/notifications";
import { ClinicProvider } from "./src/clinic";
import Navigation from "./src/navigation";
import { useWide } from "./src/useWide";
import { C } from "./src/theme";

export default function App() {
  const wide = useWide();
  // Ask for notification permission on first launch so reminders can be scheduled
  useEffect(() => { ensurePermission().then(registerForClosedAlerts).catch(() => {}); }, []);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ClinicProvider>
        <StoreProvider>
          {/* Web: phone-width frame on narrow windows, full website layout on desktop */}
          <View style={s.page}>
            <View style={wide ? s.full : s.app}>
              <Navigation />
            </View>
          </View>
          <StatusBar style="dark" />
          {/* Android: hide the system button/gesture bar so the app fills the screen (swipe up to show it) */}
          {Platform.OS === "android" && <NavigationBar hidden />}
        </StoreProvider>
        </ClinicProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: Platform.OS === "web" ? C.blueLt : C.bg, alignItems: "center" },
  app: Platform.OS === "web"
    ? { flex: 1, width: "100%", maxWidth: 480, backgroundColor: C.bg, borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border, overflow: "hidden" }
    : { flex: 1, width: "100%" },
  full: { flex: 1, width: "100%", backgroundColor: C.bg },
});
