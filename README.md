# Streaming AI Chat

A Next.js 16 chat application with real-time token-by-token streaming using
the Vercel AI SDK and Anthropic. Built as Week 6 of a 12-month roadmap
transitioning from Laravel/PHP to AI engineering.

## What it does

- Streams responses token by token — text appears as it is generated
- Requires authentication before accessing the chat
- Persists chat history across sessions using Supabase
- Renders responses with full markdown formatting
- Shows a typing indicator while the model is generating
- Enforces a configurable token limit per account for demo deploys

## How streaming works
```
User sends a message
        ↓
Route Handler calls Anthropic with streamText
        ↓
Tokens arrive one by one over HTTP (Server-Sent Events)
        ↓
useChat hook accumulates tokens in real time
        ↓
onFinish fires when complete — response is saved to Supabase
```

## Tech stack

- Next.js 16 (App Router + Route Handlers)
- TypeScript
- Tailwind CSS v4
- Vercel AI SDK (`streamText`, `useChat`)
- Anthropic SDK (`@anthropic-ai/sdk`)
- Supabase (PostgreSQL + Auth)
- react-markdown + rehype-highlight
- shadcn/ui
- @tailwindcss/typography

## Model

Currently using `claude-haiku-4-5-20251001` — configurable in `app/api/chat/route.ts`

## Setup

1. Clone the repository
2. Install dependencies
```bash
npm install
```

3. Create a Supabase project and run this SQL in the SQL Editor:
```sql
CREATE TABLE messages (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    question        text NOT NULL,
    response        text NOT NULL,
    input_tokens    int NOT NULL DEFAULT 0,
    output_tokens   int NOT NULL DEFAULT 0,
    model           text NOT NULL,
    created_at      timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own messages"
ON messages FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

4. Create a `.env.local` file in the root folder
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TOKEN_LIMIT=10000
```

5. Run the development server
```bash
npm run dev
```

6. Open `http://localhost:3000`

## Project structure
```
app/
├── api/
│   └── chat/
│       └── route.ts            Route Handler — streaming, auth and token limit
├── auth/
│   ├── login/
│   │   └── page.tsx            Login page
│   ├── register/
│   │   └── page.tsx            Register page
│   └── logout/
│       └── route.ts            Logout route handler
├── _actions/
│   └── chat.ts                 Server Actions — token usage and message history
├── _components/
│   ├── ChatBox.tsx             Client Component — useChat hook and chat UI
│   ├── LoginForm.tsx           Client Component — login form
│   ├── MarkdownRenderer.tsx    Renders model responses as formatted markdown
│   ├── RegisterForm.tsx        Client Component — register form
│   └── TypingIndicator.tsx     Animated indicator while model is generating
├── globals.css                 Global styles and Tailwind configuration
├── layout.tsx                  Root layout
└── page.tsx                    Home page — protected, loads history and token count
lib/
├── config.ts                   Shared configuration (NEXT_PUBLIC_TOKEN_LIMIT)
└── supabase/
    ├── client.ts               Supabase browser client
    └── server.ts               Supabase server client
proxy.ts                        Session refresh on every request
.env.example                    Environment variables template
```

## Live demo

[https://ts-streaming-ai.vercel.app](https://ts-streaming-ai.vercel.app)

> Demo accounts are limited to 10000 tokens. Create an account to try it out.

## Context

Built as Week 6 of a 12-month roadmap transitioning from Laravel/PHP to AI
engineering — covering TypeScript, Next.js, RAG systems, and AI agents for
the international market.