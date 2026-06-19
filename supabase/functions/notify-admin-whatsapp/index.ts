import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { generated_response_id, comment_text, proposed_response } = await req.json();

    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const adminPhone = Deno.env.get('ADMIN_WHATSAPP_NUMBER');

    if (!phoneNumberId || !accessToken || !adminPhone) {
      throw new Error('Configuration WhatsApp manquante');
    }

    const message = `🤖 *Nouvelle question detectee*

💬 *Commentaire:* ${comment_text.substring(0, 200)}

✍️ *Reponse proposee:*
${proposed_response}

✅ Repondre "OK" pour publier
✏️ Repondre avec votre modification

_ID: ${generated_response_id}_`;

    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: adminPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!waResponse.ok) {
      const error = await waResponse.json();
      throw new Error(`WhatsApp API error: ${error.error?.message}`);
    }

    const waData = await waResponse.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('whatsapp_notifications')
      .insert({
        generated_response_id,
        phone_number: adminPhone,
        message_id: waData.messages?.[0]?.id || '',
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify({ status: 'notified', message_id: waData.messages?.[0]?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
