# ts-streaming-ai

Real-time AI chat built with Next.js, Vercel AI SDK and Anthropic.
Implements token-by-token streaming, per-user persistent history and
token limiting for demo mode deploys.

## What it does

- Real streaming responses — text appears word by word like Claude.ai
- Supabase authentication — each user has their own chat history
- Configurable token limit — usage control for demo deploys
- Markdown rendering — code blocks, lists and formatting fully rendered
- Professional UI with shadcn/ui — typing indicator, stop button, error handling

## Stack

- **Next.js 16** — App Router, Route Handlers
- **Vercel AI SDK** — streaming with `streamText` and `useChat`
- **Anthropic** — Claude Haiku as base model
- **Supabase** — authentication and history persistence
- **shadcn/ui** — UI components
- **react-markdown + rehype-highlight** — response rendering

## Learning context

Week 6 of the PHP to AI Engineer transition roadmap with TypeScript.

The goal was to understand the full streaming pipeline: how tokens leave
the model, travel over HTTP as Server-Sent Events, and arrive at the client
where useChat accumulates them in real time to build the complete response.

The most important thing I learned: streaming cannot live in a Server Action —
it needs a Route Handler because it has to return a Response with an open
connection. onFinish exists because it is the only point where you have the
complete response available to persist it — nothing runs after the return.

## Setup

**1. Clone and install dependencies**
\`\`\`bash
npm install
\`\`\`

**2. Configure environment variables**

Copy the example file and fill in your credentials:
\`\`\`bash
cp .env.example .env.local
\`\`\`

\`\`\`env
# Supabase — get these from your project settings at supabase.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic — get your API key at console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key

# Token limit — maximum tokens a user can consume in demo mode
# Increase or remove this check in app/api/chat/route.ts for production
TOKEN_LIMIT=10000
\`\`\`

**3. Run the development server**
\`\`\`bash
npm run dev
\`\`\`

## Configuration

**Changing the AI model**

The model is defined in `app/api/chat/route.ts`:
\`\`\`typescript
const MODEL_ID = 'claude-haiku-4-5-20251001';
\`\`\`

Available Anthropic models:
- `claude-haiku-4-5-20251001` — fastest, lowest cost, recommended for demos
- `claude-sonnet-4-20250514` — balanced performance and cost
- `claude-opus-4-20250514` — most capable, highest cost

**Changing the token limit**

Set `TOKEN_LIMIT` in your `.env.local`. This controls how many total tokens
each user can consume before being blocked. To disable the limit entirely,
remove the token check in `app/api/chat/route.ts`.

## Project structure

\`\`\`
app/
├── api/chat/route.ts        Route Handler — streaming with auth and token limit
├── _actions/                Server Actions for Supabase queries
├── _components/
│   ├── ChatBox.tsx          Main component using useChat hook
│   ├── MarkdownRenderer.tsx Renders model responses as formatted markdown
│   └── TypingIndicator.tsx  Animated dots while model is generating
└── page.tsx                 Loads history and token count from Supabase
lib/
├── config.ts                Shared configuration (TOKEN_LIMIT)
└── supabase/
    ├── client.ts            Supabase browser client
    └── server.ts            Supabase server client
\`\`\`

## Demo

Deployed on Vercel with TOKEN_LIMIT configured to control usage in demo mode.