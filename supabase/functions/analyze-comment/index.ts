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
    const { comment_id, text } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const aiServiceUrl = Deno.env.get('AI_SERVICE_URL') || 'http://localhost:8000';

    const response = await fetch(`${aiServiceUrl}/predict/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.status}`);
    }

    const analysis = await response.json();

    const { error } = await supabase
      .from('comments')
      .update({
        sentiment: analysis.sentiment,
        sentiment_confidence: analysis.sentiment_confidence,
        is_question: analysis.is_question,
        question_confidence: analysis.question_confidence,
        status: 'analyzed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', comment_id);

    if (error) throw error;

    if (analysis.sentiment === 'positive' && analysis.sentiment_confidence > 0.7) {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/auto-like-comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_id }),
      });
    }

    if (analysis.is_question && analysis.question_confidence > 0.7) {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-template-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_id, text }),
      });
    }

    return new Response(JSON.stringify({ status: 'analyzed', analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur analyse:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
