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
    const payload = await req.json();

    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    if (req.method === 'GET') {
      const mode = new URL(req.url).searchParams.get('hub.mode');
      const token = new URL(req.url).searchParams.get('hub.verify_token');
      const challenge = new URL(req.url).searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === verifyToken) {
        return new Response(challenge, { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const message = change.value?.messages?.[0];
        if (!message || message.type !== 'text') continue;

        const text = message.text.body;
        const match = text.match(/_ID: ([a-f0-9-]+)_/);
        if (!match) continue;

        const generatedResponseId = match[1];
        let finalResponse = text.replace(/_ID: [a-f0-9-]+_/g, '').trim();
        let status = 'modified';

        if (finalResponse.toUpperCase() === 'OK') {
          const { data: genResponse } = await supabase
            .from('generated_responses')
            .select('proposed_response')
            .eq('id', generatedResponseId)
            .single();
          finalResponse = genResponse?.proposed_response || '';
          status = 'approved';
        } else if (finalResponse.toUpperCase() === 'NON' || finalResponse.toUpperCase() === 'NO') {
          status = 'rejected';
          continue;
        }

        const { data: notification } = await supabase
          .from('whatsapp_notifications')
          .select('id')
          .eq('generated_response_id', generatedResponseId)
          .single();

        if (notification) {
          await supabase
            .from('admin_replies')
            .insert({
              notification_id: notification.id,
              original_response: text,
              modified_response: finalResponse,
              replied_at: new Date().toISOString(),
            });

          await supabase
            .from('generated_responses')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', generatedResponseId);

          if (status !== 'rejected') {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/publish-facebook-reply`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                generated_response_id: generatedResponseId,
                final_response: finalResponse,
              }),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: 'processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
