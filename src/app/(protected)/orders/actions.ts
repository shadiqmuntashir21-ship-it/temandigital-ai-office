"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { writeActivity } from "@/lib/activity";
import type { Database } from "@/types/database";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type LeadSource = Database["public"]["Enums"]["lead_source"];

function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TD-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function createOrder(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const productId = String(formData.get("product_id") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  if (!productId || !customerName) return;

  const { data: product, error: productError } = await supabase.from("products").select("id, price, name").eq("id", productId).single();
  if (productError || !product) throw new Error("Produk tidak ditemukan.");

  const { data, error } = await supabase.from("orders").insert({
    order_number: orderNumber(),
    product_id: product.id,
    customer_name: customerName,
    customer_email: String(formData.get("customer_email") ?? "").trim() || null,
    customer_whatsapp: String(formData.get("customer_whatsapp") ?? "").trim() || null,
    source: String(formData.get("source") ?? "website") as LeadSource,
    amount: product.price,
    status: "menunggu_pembayaran",
    payment_status: "belum_bayar",
  }).select("id, order_number").single();

  if (error) throw new Error(error.message);
  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "order.created",
    entityType: "order",
    entityId: data.id,
    summary: `Order ${data.order_number} untuk ${product.name} dibuat.`,
  });
  revalidatePath("/orders");
}

export async function updateOrder(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = String(formData.get("status") ?? "menunggu_pembayaran") as OrderStatus;
  const paymentStatus = String(formData.get("payment_status") ?? "belum_bayar") as PaymentStatus;
  const paidAt = paymentStatus === "lunas" ? new Date().toISOString() : null;

  const { error } = await supabase.from("orders").update({
    status,
    payment_status: paymentStatus,
    paid_at: paidAt,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  await writeActivity(supabase, {
    actorProfileId: profile.id,
    action: "order.updated",
    entityType: "order",
    entityId: id,
    summary: `Order diperbarui: ${status}, pembayaran ${paymentStatus}.`,
  });
  revalidatePath("/orders");
}
