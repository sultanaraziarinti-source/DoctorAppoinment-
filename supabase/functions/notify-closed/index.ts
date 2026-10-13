// Supabase Edge Function: when the doctor marks a day closed, notify every patient phone.
// Deploy: npx supabase functions deploy notify-closed
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async req => {
  // Only the logged-in doctor may trigger this
  const auth = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: isDoctor } = await asCaller.rpc("is_doctor");
  if (!isDoctor) return new Response("Unauthorized", { status: 401 });

  const { date } = await req.json() as { date: string };
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: tokens } = await admin.from("push_tokens").select("token");
  if (!tokens?.length) return Response.json({ sent: 0 });

  const day = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const messages = tokens.map(t => ({
    to: t.token,
    sound: "default",
    channelId: "appointments",
    title: "চেম্বার বন্ধ · Chamber closed",
    body: `ডাক্তার ${day} তারিখে বসবেন না। The doctor is not available on ${day}.`,
    data: { closedDate: date },
  }));

  // Expo accepts up to 100 messages per request
  for (let i = 0; i < messages.length; i += 100) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
  }
  return Response.json({ sent: messages.length });
});
