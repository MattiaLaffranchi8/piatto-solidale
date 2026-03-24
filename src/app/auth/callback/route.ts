import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const db = createAdminClient();

        // Cerca profilo esistente
        let { data: profile } = await db
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Prima registrazione: crea il profilo dai metadati dell'OTP
        if (!profile) {
          const meta = user.user_metadata ?? {};
          const role = meta.role ?? "donor";
          const fullName = meta.full_name ?? user.email ?? "";

          await db.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role,
          });

          profile = { role };
        }

        const role = profile?.role;
        if (role === "donor") return NextResponse.redirect(`${origin}/dashboard/donatore`);
        if (role === "association") return NextResponse.redirect(`${origin}/dashboard/associazione`);
        if (role === "restaurant") return NextResponse.redirect(`${origin}/dashboard/ristorante`);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
