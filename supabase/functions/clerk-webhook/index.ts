import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/svix@1.6.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set these in your Supabase project:
// supabase secrets set CLERK_WEBHOOK_SECRET=whsec_...
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  if (!CLERK_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

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

  console.log(`Handling Clerk event: ${eventType} for user: ${id}`);

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const email = attributes.email_addresses?.[0]?.email_address;
      const fullName = `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim();
      const avatarUrl = attributes.image_url || attributes.profile_image_url;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: id,
          email: email,
          full_name: fullName || email?.split("@")[0] || "User",
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
          // Default fields for new users
          user_type: attributes.public_metadata?.role || "student",
          subscription_tier: attributes.public_metadata?.subscription_tier || "free",
        }, {
          onConflict: "id"
        });

      if (error) {
        console.error("Error upserting profile:", error);
        return new Response(error.message, { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting profile:", error);
        return new Response(error.message, { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return new Response(err.message, { status: 500 });
  }
});
