'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';
import { TOKEN_LIMIT } from '@/lib/config';
import { getTokensUsed } from '../_actions/query';
import { AlertCircle, Send, Square, Bot, User, Lock } from 'lucide-react';

interface Props {
    initialTokensUsed: number;
    initialMessages?: { role: 'user' | 'assistant'; content: string }[];
}

export function ChatBox({ initialTokensUsed, initialMessages = [] }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [tokensUsed, setTokensUsed] = useState(initialTokensUsed);

    const {
        messages,
        sendMessage,
        status,
        stop,
        error,
    } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        messages: initialMessages.map((m, i) => ({
            id: `history-${i}`,
            role: m.role,
            parts: [{ type: 'text' as const, text: m.content }],
        })),
        onError: (err: unknown) => {
            console.error('Chat error:', err);
        },
        onFinish: async () => {
            const updated = await getTokensUsed();
            setTokensUsed(updated);
        },
    });

    const isLoading = status === 'submitted' || status === 'streaming';
    const isTyping = status === 'submitted';

    const tokensRemaining = TOKEN_LIMIT - tokensUsed;
    const isNearLimit = tokensRemaining < TOKEN_LIMIT * 0.1;
    const isLimitReached = tokensRemaining <= 0;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, status]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLimitReached) return;
        sendMessage({ text: input });
        setInput('');
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-800 text-sm">AI Assistant</span>
                </div>
                <Badge
                    variant={isLimitReached ? 'destructive' : isNearLimit ? 'destructive' : 'secondary'}
                    className="text-xs"
                >
                    {isLimitReached ? 'Token limit reached' : `${tokensRemaining.toLocaleString()} tokens remaining`}
                </Badge>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                        <Bot className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">How can I help you?</p>
                        <p className="text-slate-400 text-sm mt-1">Type a message to get started</p>
                    </div>
                )}

                <div className="space-y-4">
                    {messages.map((message) => {
                        const textContent = message.parts
                            .filter((p) => p.type === 'text')
                            .map((p) => (p as { type: 'text'; text: string }).text)
                            .join('');

                        return (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                                    <AvatarFallback
                                        className={
                                            message.role === 'user'
                                                ? 'bg-slate-700 text-white text-xs'
                                                : 'bg-indigo-100 text-indigo-700 text-xs'
                                        }
                                    >
                                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className={`
                                    max-w-[75%] rounded-2xl px-4 py-3 text-sm
                                    ${message.role === 'user'
                                            ? 'bg-slate-800 text-white rounded-tr-sm'
                                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'
                                        }
                                    `}
                                >
                                    {message.role === 'assistant' ? (
                                        <MarkdownRenderer content={textContent} />
                                    ) : (
                                        <p className="leading-relaxed whitespace-pre-wrap">{textContent}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="flex gap-3">
                            <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                    <Bot className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error.message || 'An error occurred. Please try again.'}</span>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {isLimitReached ? (
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4 shrink-0" />
                    <p className="text-sm">You have reached your token limit. Contact the administrator to continue.</p>
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
                            disabled={isLoading}
                            className="flex-1 resize-none bg-white border-slate-200 focus-visible:ring-indigo-500 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as unknown as React.FormEvent);
                                }
                            }}
                        />

                        {isLoading ? (
                            <Button
                                type="button"
                                onClick={stop}
                                variant="outline"
                                size="icon"
                                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                                title="Stop response"
                            >
                                <Square className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim()}
                                className="shrink-0 bg-slate-800 hover:bg-slate-700"
                                title="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        )}
                    </form>

                    <p className="text-xs text-slate-400 mt-1.5 text-center">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            )}
        </div>
    );
}
