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
    const { generated_response_id, final_response } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: genResponse } = await supabase
      .from('generated_responses')
      .select('*, comments(*, posts(*, facebook_pages(*)))')
      .eq('id', generated_response_id)
      .single();

    if (!genResponse) throw new Error('Reponse generee non trouvee');

    const pageAccessToken = genResponse.comments?.posts?.facebook_pages?.page_access_token;
    const commentId = genResponse.comments?.facebook_comment_id;

    if (!pageAccessToken || !commentId) {
      throw new Error('Informations manquantes pour la publication');
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/v18.0/${commentId}/comments?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: final_response }),
      }
    );

    if (!fbResponse.ok) {
      const error = await fbResponse.json();
      throw new Error(`Facebook API error: ${error.error?.message}`);
    }

    const fbData = await fbResponse.json();

    const { data: adminReply } = await supabase
      .from('admin_replies')
      .select('id')
      .eq('notification_id', genResponse.whatsapp_notifications?.[0]?.id)
      .single();

    await supabase
      .from('facebook_replies')
      .insert({
        comment_id: genResponse.comment_id,
        admin_reply_id: adminReply?.id || null,
        facebook_reply_id: fbData.id,
        content: final_response,
        published_at: new Date().toISOString(),
      });

    await supabase
      .from('comments')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', genResponse.comment_id);

    await supabase
      .from('activity_logs')
      .insert({
        action: 'reply_published',
        entity_type: 'comment',
        entity_id: genResponse.comment_id,
        details: { facebook_reply_id: fbData.id, response: final_response },
        created_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify({ status: 'published', facebook_reply_id: fbData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
