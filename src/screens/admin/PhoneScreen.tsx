import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { CONTACT } from "../../doctor";
import { useClinic } from "../../clinic";
import { Button, Field, Page, ui } from "./ui";

// One place to change the chamber phone numbers; the website header, footer and prescriptions all read from here
export default function PhoneScreen() {
  const { t } = useI18n();
  const { saveInfo } = useClinic();
  const [phones, setPhones] = useState<string[]>(CONTACT.phones.length ? CONTACT.phones : [""]);
  const [email, setEmail] = useState(CONTACT.email);
  const [msg, setMsg] = useState("");

  const save = async () => {
    const list = phones.map(p => p.trim()).filter(Boolean);
    const err = await saveInfo({ contact: { phones: list.length ? list : CONTACT.phones, email: email.trim() } });
    setMsg(err ?? t.saved);
  };

  return (
    <Page>
      <Text style={ui.title}>📞 {t.updatePhone}</Text>
      <Text style={[ui.muted, { marginBottom: 12 }]}>{t.phoneDesc}</Text>
      {msg ? <Text style={msg === t.saved ? ui.ok : ui.error}>{msg}</Text> : null}
      <View style={ui.card}>
        {phones.map((p, i) => (
          <View key={i} style={ui.row}>
            <Field label={`${t.phone} ${i + 1}`} value={p} keyboardType="phone-pad"
              onChangeText={v => setPhones(x => x.map((y, j) => j === i ? v : y))} />
            {phones.length > 1 && (
              <Pressable onPress={() => setPhones(x => x.filter((_, j) => j !== i))} accessibilityLabel={t.remove}>
                <Text style={ui.remove}>×</Text>
              </Pressable>
            )}
          </View>
        ))}
        <Pressable onPress={() => setPhones(x => [...x, ""])}><Text style={ui.add}>{t.addPhone}</Text></Pressable>
        <Field label={t.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>
      <Button title={t.save} onPress={save} />
    </Page>
  );
}
