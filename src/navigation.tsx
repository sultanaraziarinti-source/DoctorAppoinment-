import { Text } from "react-native";
import { useWide } from "./useWide";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useI18n } from "./i18n";
import { C } from "./theme";
import type { ConsultType } from "./doctor";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import DaysScreen from "./screens/DaysScreen";
import SlotsScreen from "./screens/SlotsScreen";
import BookScreen from "./screens/BookScreen";
import ConfirmedScreen from "./screens/ConfirmedScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ListScreen from "./screens/ListScreen";
import UserScreen from "./screens/UserScreen";
import AdminStack from "./screens/admin/AdminStack";
import { useClinic } from "./clinic";

export type HomeStackParams = {
  Home: { book?: number } | undefined;  // book: timestamp → jump to the date/slot picker
  Days: { type?: ConsultType } | undefined;
  Slots: { date: string; type?: ConsultType };
  Book: { date: string; serial: number; type?: ConsultType };
  Confirmed: { id: string };
};

const Stack = createNativeStackNavigator<HomeStackParams>();
const Tabs = createBottomTabNavigator();

// Home → choose day → choose slot → patient form → confirmation
function HomeStack() {
  const { t } = useI18n();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: C.blue, headerTitleStyle: { fontWeight: "800", color: C.blueDk } }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Days" component={DaysScreen} options={{ title: t.getAppointment }} />
      <Stack.Screen name="Slots" component={SlotsScreen} options={{ title: t.chooseSlot }} />
      <Stack.Screen name="Book" component={BookScreen} options={{ title: t.patientInfo }} />
      <Stack.Screen name="Confirmed" component={ConfirmedScreen} options={{ title: t.confirmed, headerBackVisible: false, gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

const ReportsScreen = () => <ListScreen kind="reports" />;
const MedicineScreen = () => <ListScreen kind="medicine" />;
const icon = (e: string) => {
  const TabIcon = ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{e}</Text>;
  return TabIcon;
};

export default function Navigation() {
  const { t } = useI18n();
  const wide = useWide();
  useClinic(); // re-render when the doctor changes info or closed days
  return (
    <NavigationContainer documentTitle={{ formatter: () => "DoctorBondhu" }}>
      <Tabs.Navigator screenOptions={() => ({
        // Desktop: the tabs move into the header as menu links
        header: ({ navigation }) => {
          const { routes, index } = navigation.getState();
          // The doctor area isn't a menu item on the website (it's in the footer)
          return <Header links={routes.filter(r => r.name !== "User" && r.name !== "Admin").map(r => ({
            key: r.key,
            label: (({ HomeTab: t.home, History: t.history, Reports: t.reports, Medicine: t.medicine }) as Record<string, string>)[r.name],
            active: routes[index].key === r.key,
            onPress: () => navigation.navigate(r.name),
          }))} onBook={() => navigation.navigate("HomeTab", { screen: "Home", params: { book: Date.now() } })}
            onHome={() => navigation.navigate("HomeTab", { screen: "Home" })} />;
        },
        // Website: tabs move to the header. Phone: a bit taller so the Bangla labels aren't cut off
        tabBarStyle: wide ? { display: "none" } : { minHeight: 62, paddingTop: 6, paddingBottom: 6 },
        // Every page stays full width with a solid background, so it fully covers the page under it
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.blue,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", lineHeight: 15 },
      })}>
        <Tabs.Screen name="HomeTab" component={HomeStack} options={{ title: t.home, tabBarIcon: icon("🏠") }} />
        <Tabs.Screen name="History" component={HistoryScreen} options={{ title: t.history, tabBarIcon: icon("📋") }} />
        <Tabs.Screen name="Reports" component={ReportsScreen} options={{ title: t.reports, tabBarIcon: icon("🧪") }} />
        <Tabs.Screen name="Medicine" component={MedicineScreen} options={{ title: t.medicine, tabBarIcon: icon("💊") }} />
        {/* Phone: "User" tab to choose Patient / Doctor. Website: hidden; Admin Login is in the footer */}
        <Tabs.Screen name="User" component={UserScreen}
          options={{ title: t.user, tabBarIcon: icon("👤"), tabBarItemStyle: wide ? { display: "none" } : undefined }} />
        <Tabs.Screen name="Admin" component={AdminStack}
          options={{ title: t.doctor, headerShown: wide, tabBarItemStyle: { display: "none" } }} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
