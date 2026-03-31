'use server'
import { createClient } from '@/lib/supabase/server'

export async function getTokensUsed(): Promise<number> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    const { data } = await supabase
        .from('messages')
        .select('input_tokens, output_tokens')
        .eq('user_id', user.id)

    if (!data) return 0

    return data.reduce((acc, msg) => acc + msg.input_tokens + msg.output_tokens, 0)
}
