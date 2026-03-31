import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createClient } from '@/lib/supabase/server';
import { TOKEN_LIMIT } from '@/lib/config';
import { getTokensUsed } from '@/app/_actions/query';

export async function POST(req: Request) {

    try {

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const tokensUsed = await getTokensUsed();

        if (tokensUsed >= TOKEN_LIMIT) {
            return new Response(
                JSON.stringify({ error: 'Token limit reached. Contact the administrator to continue.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        
        const { messages }: { messages: UIMessage[] } = await req.json();

        const lastMsg = messages[messages.length - 1];
        const userQuestion = (lastMsg.parts as Array<{ type: string; text?: string }>)
            .filter((p) => p.type === 'text')
            .map((p) => p.text ?? '')
            .join('');

        const MODEL_ID = 'claude-haiku-4-5-20251001';
        const result = streamText({
            model: anthropic(MODEL_ID),
            system: 'You are a helpful and concise assistant. Respond in the language of the user.',
            messages: await convertToModelMessages(messages),
            maxOutputTokens: 1000,
            onFinish: async ({ text, usage }) => {
                await supabase.from('messages').insert({
                    user_id: user!.id,
                    question: userQuestion,
                    response: text,
                    input_tokens: usage.inputTokens ?? 0,
                    output_tokens: usage.outputTokens ?? 0,
                    model: MODEL_ID,
                });
            },
        });

        return result.toUIMessageStreamResponse();

    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal error. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
