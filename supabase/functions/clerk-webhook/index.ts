import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/svix@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * CLERK WEBHOOK SYNC FOR MARGDARSHAK V3.0
 * 
 * This function listens for user events from Clerk and keeps the Supabase 
 * 'profiles' table in sync. It handles roles and subscriptions from public_metadata.
 */

const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  if (!CLERK_WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Verify Webhook Signature
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id, ...attributes } = evt.data;
  const eventType = evt.type;

  console.log(`Processing ${eventType} for user: ${id}`);

  try {
    // 1. Sync Create & Update
    if (eventType === "user.created" || eventType === "user.updated") {
      const email = attributes.email_addresses?.[0]?.email_address;
      const fullName = `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim();
      const avatarUrl = attributes.image_url || attributes.profile_image_url;
      
      // Metadata from Clerk
      const metadata = attributes.public_metadata || {};
      const role = metadata.role || "student";
      const subscription = metadata.subscription || {};

      const profileData = {
        id: id,
        email: email,
        full_name: fullName || email?.split("@")[0] || "User",
        avatar_url: avatarUrl,
        user_type: role,
        subscription_tier: subscription.tier || "free",
        subscription_status: subscription.status || "inactive",
        subscription_period_end: subscription.period_end ? new Date(subscription.period_end).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" });

      if (error) throw error;
      console.log(`Successfully synced profile for ${id}`);
    }

    // 2. Sync Delete
    if (eventType === "user.deleted") {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      console.log(`Successfully deleted profile for ${id}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Database operation failed:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
