import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'est', 'ce', 'se', 'je', 'tu', 'il', 'nous', 'vous', 'ils', 'a', 'pour', 'par', 'sur', 'dans', 'en', 'avec', 'que', 'qui', 'quoi', 'comment', 'pourquoi', 'quand']);
  return text.toLowerCase().replace(/[^a-z\u00e0-\u00ff0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
}

function calculateScore(templateKeywords: string[], commentKeywords: string[]): number {
  if (templateKeywords.length === 0) return 0;
  const matches = commentKeywords.filter(kw => templateKeywords.some(tk => tk.includes(kw) || kw.includes(tk)));
  return matches.length / Math.max(templateKeywords.length, commentKeywords.length);
}

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

    const commentKeywords = extractKeywords(text);

    const { data: templates, error } = await supabase
      .from('response_templates')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    if (!templates || templates.length === 0) {
      return new Response(JSON.stringify({ status: 'no_templates' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let bestTemplate = null;
    let bestScore = 0;

    for (const template of templates) {
      const score = calculateScore(template.keywords, commentKeywords);
      const weightedScore = score * (template.priority / 10) * (1 + template.usage_count * 0.01);
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestTemplate = template;
      }
    }

    if (!bestTemplate || bestScore < 0.1) {
      return new Response(JSON.stringify({ status: 'no_match', score: bestScore }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const proposedResponse = bestTemplate.template_text;

    const { data: generatedResponse } = await supabase
      .from('generated_responses')
      .insert({
        comment_id,
        template_id: bestTemplate.id,
        proposed_response: proposedResponse,
        score: bestScore,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    await supabase
      .from('response_templates')
      .update({ usage_count: bestTemplate.usage_count + 1 })
      .eq('id', bestTemplate.id);

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-admin-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generated_response_id: generatedResponse.id,
        comment_text: text,
        proposed_response: proposedResponse,
      }),
    });

    return new Response(JSON.stringify({
      status: 'generated',
      template: bestTemplate.category,
      score: bestScore,
      response: proposedResponse,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
