import { env } from 'cloudflare:workers';

function outputText(payload: unknown): string {
  const value = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (value.output_text) return value.output_text;
  return value.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text ?? '';
}

export async function POST(request: Request) {
  const body = await request.json() as { question?: string; set?: { title?: string; cards?: Array<{ term: string; definition: string }> } };
  const question = body.question?.trim();
  if (!question) return Response.json({ error: 'Ask a question first.' }, { status: 400 });
  const cards = (body.set?.cards ?? []).slice(0, 30);

  if (!env.OPENAI_API_KEY) {
    const anchor = cards[0];
    return Response.json({
      answer: anchor ? `Start with the connection between the term and its job: ${anchor.term} — ${anchor.definition} Try saying that relationship in your own words, then I can quiz you on it.` : 'Add a study set first, then I can explain it and quiz you.',
      ai: false,
    });
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-5.4-mini',
      store: false,
      reasoning: { effort: 'low' },
      instructions: 'You are Quizbuddy, a warm, concise tutor. Answer only from the supplied study set. Teach with retrieval practice: explain briefly, use a concrete analogy when useful, and end with one short check-for-understanding question. If the material does not support an answer, say so.',
      input: `STUDY SET: ${body.set?.title ?? 'Untitled'}\n${cards.map((card) => `${card.term}: ${card.definition}`).join('\n')}\n\nSTUDENT: ${question}`,
    }),
  });
  if (!response.ok) return Response.json({ error: 'The tutor is taking a break. Try again in a moment.' }, { status: 502 });
  const payload = await response.json();
  return Response.json({ answer: outputText(payload), ai: true });
}
