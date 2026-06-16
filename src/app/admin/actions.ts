"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthClient, getAdminClaims } from "@/lib/supabase-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ESTADO_OPTIONS } from "@/lib/lead-content";

// Las server actions son endpoints públicos: CADA una re-verifica la
// sesión del administrador antes de tocar la base (defensa en profundidad,
// el proxy y el layout ya filtraron antes).

async function requireAdmin() {
  const claims = await getAdminClaims();
  if (!claims) redirect("/admin/login");
}

export async function cambiarEstado(leadId: number, estado: string) {
  await requireAdmin();
  if (!Number.isInteger(leadId) || leadId <= 0) return;
  if (!ESTADO_OPTIONS.some((o) => o.value === estado)) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase
    .from("leads")
    .update({ status: estado, last_contact_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) console.error("[admin] Error cambiando estado:", error.message);

  revalidatePath("/admin");
  revalidatePath(`/admin/lead/${leadId}`);
}

export async function guardarNotas(leadId: number, formData: FormData) {
  await requireAdmin();
  if (!Number.isInteger(leadId) || leadId <= 0) return;

  const notas = String(formData.get("notas") ?? "").slice(0, 4000);
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase
    .from("leads")
    .update({ notes: notas || null })
    .eq("id", leadId);
  if (error) console.error("[admin] Error guardando notas:", error.message);

  revalidatePath(`/admin/lead/${leadId}`);
}

export async function cerrarSesion() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
