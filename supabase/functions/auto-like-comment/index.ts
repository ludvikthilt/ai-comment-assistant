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
    const { comment_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: comment } = await supabase
      .from('comments')
      .select('*, posts(*, facebook_pages(*))')
      .eq('id', comment_id)
      .single();

    if (!comment) throw new Error('Commentaire non trouvé');

    const pageAccessToken = comment.posts?.facebook_pages?.page_access_token;
    if (!pageAccessToken) throw new Error('Token page manquant');

    const fbResponse = await fetch(
      `https://graph.facebook.com/v18.0/${comment.facebook_comment_id}/likes?access_token=${pageAccessToken}`,
      { method: 'POST' }
    );

    if (!fbResponse.ok) {
      const error = await fbResponse.json();
      throw new Error(`Facebook API error: ${error.error?.message}`);
    }

    await supabase
      .from('comments')
      .update({ auto_liked: true, liked_at: new Date().toISOString() })
      .eq('id', comment_id);

    return new Response(JSON.stringify({ status: 'liked' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
