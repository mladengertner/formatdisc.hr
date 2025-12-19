import { useState, useRef, FormEvent, useEffect } from "react";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

/* typing indicator (micro‑animation) */
function TypingIndicator() {
    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-black/60 px-3 py-1 text-xs text-emerald-100/80">
            <span className="uppercase tracking-[0.18em] text-emerald-300/80">
                SlavkoFusion
            </span>
            <div className="flex items-center gap-0.5 pl-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-fusion-typing" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-fusion-typing [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-fusion-typing [animation-delay:240ms]" />
            </div>
        </div>
    );
}

/* main chat component */
export function FusionChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // auto‑scroll on new message
    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    };
    // scroll after each render
    useEffect(() => scrollToBottom(), [messages, loading]);

    const send = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", content: trimmed };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const resp = await fetch("/api/fusion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed, userId: "web-client" }),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const assistantMsg: ChatMessage = { id: data.id, role: "assistant", content: data.content };
            setMessages((m) => [...m, assistantMsg]);
        } catch (err) {
            console.error(err);
            setMessages((m) => [...m, { id: `err_${Date.now()}`, role: "assistant", content: "⚠️ Error – try again later." }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <section className="h-64 flex flex-col w-full rounded-xl border border-emerald-500/30 bg-black/30 p-4 shadow-lg backdrop-blur-sm">
            {/* message list */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-emerald-500/30">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`
                rounded-lg px-3 py-1.5 text-xs lg:text-sm max-w-[85%]
                ${msg.role === "user"
                                    ? "bg-emerald-600/70 text-emerald-50"
                                    : "bg-emerald-900/70 text-emerald-200"
                                }
                shadow-sm
              `}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <TypingIndicator />
                    </div>
                )}
            </div>

            {/* input */}
            <form onSubmit={send} className="flex gap-2">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            send(e);
                        }
                    }}
                    placeholder="Ask Slavko…"
                    className="flex-1 resize-none rounded border border-emerald-500/30 bg-black/20 px-3 py-2 text-sm text-emerald-100 placeholder:opacity-60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="rounded bg-emerald-600 px-3 py-2 text-xs font-medium text-emerald-50 hover:bg-emerald-500 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </section>
    );
}
