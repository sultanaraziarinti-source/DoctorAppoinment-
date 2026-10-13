import { Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { useClinic } from "../../clinic";
import { C } from "../../theme";
import LoginScreen from "./LoginScreen";
import DashboardScreen from "./DashboardScreen";
import PatientsScreen from "./PatientsScreen";
import WriteScreen from "./WriteScreen";
import PrescriptionScreen from "./PrescriptionScreen";
import CalendarScreen from "./CalendarScreen";
import PhoneScreen from "./PhoneScreen";
import InfoScreen from "./InfoScreen";

export type AdminStackParams = {
  Login: undefined;
  Dashboard: undefined;
  Patients: undefined;
  Write: { appointmentId?: string; id?: string };
  Prescription: { id: string };
  Calendar: undefined;
  Phone: undefined;
  Info: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParams>();

// Doctor area: login page until signed in, then the dashboard and its tools.
// The login is kept in memory on this device only: the doctor can go to Home and come back
// without logging in again, until they press Log out or close the browser/app.
// Other people's phones and browsers always start at the login page.
export default function AdminStack() {
  const { t } = useI18n();
  const { isDoctor } = useClinic();
  const nav = useNavigation();
  // First screen of the area (Login / Dashboard): a back arrow to Home (stays logged in)
  const leave = () => (
    <Pressable onPress={() => nav.navigate("HomeTab" as never)} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.backHome}
      style={{ paddingRight: 16 }}>
      <Text style={{ fontSize: 26, color: C.blue }}>‹</Text>
    </Pressable>
  );
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: C.blue, headerTitleStyle: { fontWeight: "800", color: C.blueDk } }}>
      {!isDoctor ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: t.doctorLogin, headerLeft: leave }} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: t.dashboard, headerLeft: leave }} />
          <Stack.Screen name="Patients" component={PatientsScreen} options={{ title: t.todayPatients }} />
          <Stack.Screen name="Write" component={WriteScreen} options={{ title: t.writeRx }} />
          <Stack.Screen name="Prescription" component={PrescriptionScreen} options={{ title: t.prescription }} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: t.calendar }} />
          <Stack.Screen name="Phone" component={PhoneScreen} options={{ title: t.updatePhone }} />
          <Stack.Screen name="Info" component={InfoScreen} options={{ title: t.updateInfo }} />
        </>
      )}
    </Stack.Navigator>
  );
}
