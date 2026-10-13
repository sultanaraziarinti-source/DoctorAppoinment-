import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useI18n } from "../../i18n";
import { useClinic } from "../../clinic";
import PrescriptionView from "../../components/PrescriptionView";
import { Button, Page } from "./ui";
import type { AdminStackParams } from "./AdminStack";

// Shown after the doctor submits: the finished prescription, with Edit
export default function PrescriptionScreen({ route, navigation }: NativeStackScreenProps<AdminStackParams, "Prescription">) {
  const { t } = useI18n();
  const rx = useClinic().prescriptions.find(p => p.id === route.params.id);
  if (!rx) return null;
  return (
    <Page>
      <PrescriptionView rx={rx} />
      <Button title={`✏️  ${t.edit}`} onPress={() => navigation.navigate("Write", { id: rx.id })} kind="blue" />
      <Button title={t.dashboard} onPress={() => navigation.popToTop()} kind="outline" />
    </Page>
  );
}
