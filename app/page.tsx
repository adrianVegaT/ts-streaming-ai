import { createClient } from '@/lib/supabase/server';
import { ChatBox } from './_components/ChatBox';
import { getTokensUsed } from './_actions/query';

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const tokensUsed = await getTokensUsed();

    const { data: history } = await supabase
        .from('messages')
        .select('question, response')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

    const formattedHistory = (history ?? []).flatMap((row) => [
        { role: 'user' as const, content: row.question },
        { role: 'assistant' as const, content: row.response },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-end mb-6">
                    <form action="/auth/logout" method="POST">
                        <button
                            type="submit"
                            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer"
                        >
                            Sign out
                        </button>
                    </form>
                </div>

                <ChatBox
                    initialTokensUsed={tokensUsed}
                    initialMessages={formattedHistory}
                />
            </div>
        </div>
    );
}
