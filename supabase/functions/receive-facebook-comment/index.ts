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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { entry } = payload;
    if (!entry || !entry[0]?.changes) {
      return new Response(JSON.stringify({ status: 'no_data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const change of entry[0].changes) {
      if (change.value.item === 'comment') {
        const comment = change.value;

        const { data: post } = await supabase
          .from('posts')
          .select('id')
          .eq('facebook_post_id', comment.post_id)
          .single();

        if (!post) continue;

        const { data: newComment, error } = await supabase
          .from('comments')
          .insert({
            post_id: post.id,
            facebook_comment_id: comment.comment_id,
            author_name: comment.from?.name || 'Anonyme',
            author_id: comment.from?.id || '',
            content: comment.message || '',
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Erreur insertion commentaire:', error);
          continue;
        }

        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment_id: newComment.id, text: comment.message }),
        });
      }
    }

    return new Response(JSON.stringify({ status: 'processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur webhook Facebook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
