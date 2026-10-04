"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const { supabase, profile } = await requireMember();
  const field = (name: string) => String(formData.get(name) ?? "").trim() || null;

  await supabase
    .from("profiles")
    .update({
      full_name: field("full_name"),
      phone: field("phone"),
      company: field("company"),
      tax_id: field("tax_id"),
    })
    .eq("id", profile.id);

  revalidatePath("/app", "layout");
  redirect("/app/cuenta?ok=1");
}
