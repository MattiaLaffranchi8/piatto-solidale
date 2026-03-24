import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).max(100),
  role: z.enum(["donor", "association", "restaurant"]),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, full_name, role } = parsed.data;
  const admin = createAdminClient();

  // Crea utente già confermato (nessuna email di conferma)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (createError) {
    const msg = createError.message.includes("already registered")
      ? "Email già registrata."
      : createError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Crea profilo
  await admin.from("profiles").insert({
    id: created.user.id,
    email,
    full_name,
    role,
  });

  // Fai login automatico
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role });
}
