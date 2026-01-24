import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      return new Response(
        JSON.stringify({ error: "Stripe belum dikonfigurasi. Silakan atur API key di Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(settingData.value, { apiVersion: "2023-10-16" });

    const { orderId, packageName, price, customerEmail, customerName } = await req.json();

    if (!orderId || !price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: packageName || "Paket Website",
              description: `Order untuk ${customerName}`,
            },
            unit_amount: price, // Price in smallest currency unit (for IDR, it's the actual amount)
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/services/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/services/cancel`,
      metadata: {
        order_id: orderId,
      },
    });

    // Update order with Stripe session ID
    await supabase
      .from("client_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
