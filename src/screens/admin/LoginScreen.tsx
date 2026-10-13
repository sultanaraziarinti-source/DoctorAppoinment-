import { useState } from "react";
import { Image, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useClinic } from "../../clinic";
import { Button, Field, Page, ui } from "./ui";

// Doctor / admin login. After login the navigator swaps this for the dashboard.
export default function LoginScreen() {
  const { t } = useI18n();
  const { signIn } = useClinic();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError(err === "wrong" || /invalid/i.test(err) ? t.loginFailed : err);
  };

  return (
    <Page>
      <View style={[ui.card, { padding: 24, maxWidth: 440, width: "100%", alignSelf: "center" }]}>
        <Image source={require("../../../assets/web-logo-mark.png")} style={{ width: 90, height: 70, alignSelf: "center" }} resizeMode="contain" />
        <Text style={[ui.title, { textAlign: "center", marginTop: 10 }]}>{t.adminLogin}</Text>
        {error ? <Text style={ui.error}>{error}</Text> : null}
        <Field label={t.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" onSubmitEditing={submit} />
        <Button title={t.login} onPress={submit} kind="blue" disabled={busy || !email || !password} />
      </View>
    </Page>
  );
}
