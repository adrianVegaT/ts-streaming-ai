'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Props {
    content: string;
}

export function MarkdownRenderer({ content }: Props) {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
                p({ children }) {
                    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                },
                code({ children, className }) {
                    const isBlock = className?.includes('language-');
                    if (!isBlock) {
                        return (
                            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        );
                    }
                    return <code className={className}>{children}</code>;
                },
                pre({ children }) {
                    return (
                        <pre className="rounded-lg overflow-x-auto my-3 text-sm">
                            {children}
                        </pre>
                    );
                },
                ul({ children }) {
                    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                },
                h1({ children }) {
                    return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>;
                },
                h2({ children }) {
                    return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                },
                h3({ children }) {
                    return <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>;
                },
                blockquote({ children }) {
                    return (
                        <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-3">
                            {children}
                        </blockquote>
                    );
                },
                strong({ children }) {
                    return <strong className="font-semibold text-slate-900">{children}</strong>;
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}