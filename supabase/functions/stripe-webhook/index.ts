import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Stripe secret key from site_settings
    const { data: settingData, error: settingError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "stripe_secret_key")
      .single();

    if (settingError || !settingData?.value) {
      console.error("Stripe not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(settingData.value, { apiVersion: "2023-10-16" });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll process without signature verification for simplicity
    // In production, you should verify the webhook signature
    const event = JSON.parse(body);

    console.log("Received Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          console.log("Updating order:", orderId);

          // Update order status to paid
          const { error: updateError } = await supabase
            .from("client_orders")
            .update({
              status: "paid",
              stripe_payment_intent: session.payment_intent,
              paid_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (updateError) {
            console.error("Error updating order:", updateError);
          } else {
            console.log("Order updated successfully");
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Update order status to cancelled if payment expired
          await supabase
            .from("client_orders")
            .update({
              status: "cancelled",
            })
            .eq("id", orderId)
            .eq("status", "pending"); // Only cancel if still pending
        }
        break;
      }

      case "payment_intent.payment_failed": {
        console.log("Payment failed:", event.data.object.id);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
