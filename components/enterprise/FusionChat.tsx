"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Loader2, Bot, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    persona?: "default" | "crisis" | "diagnostic";
    channel?: string;
    timestamp: number;
}

export default function FusionChat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: `u_${Date.now()}`,
            role: "user",
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/fusion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content }),
            });

            if (!res.ok) throw new Error("Fusion broker error");

            const data = await res.json();

            const botMsg: Message = {
                id: data.id,
                role: "assistant",
                content: data.content,
                persona: data.meta?.degraded ? "crisis" : "default", // Simplify for UI
                channel: data.channel,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const errorMsg: Message = {
                id: `err_${Date.now()}`,
                role: "assistant",
                content: "System Connectivity Failure. Kernel link severed.",
                persona: "crisis",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    }

    return (
        <div className="w-full max-w-2xl bg-black/40 border border-indigo-500/20 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col h-[500px] shadow-2xl relative">
            {/* Header */}
            <div className="p-4 border-b border-indigo-500/20 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <span className="font-mono text-sm font-bold text-indigo-100 uppercase tracking-widest">
                        Fusion<span className="text-indigo-500">Link</span> v2.0
                    </span>
                </div>
                <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30 text-[10px] animate-pulse">
                    ONLINE
                </Badge>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                        <Terminal className="w-12 h-12 text-indigo-500/50" />
                        <p className="text-xs font-mono text-indigo-300">SYSTEM READY. AWAITING INPUT.</p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex w-full mb-2",
                            m.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] rounded-lg p-3 text-sm font-mono shadow-lg",
                                m.role === "user"
                                    ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none"
                                    : m.persona === 'crisis'
                                        ? "bg-red-900/20 border border-red-500/30 text-red-100 rounded-tl-none animate-status-pop"
                                        : "bg-slate-800/50 border border-slate-700 text-slate-200 rounded-tl-none"
                            )}
                        >
                            {m.channel && (
                                <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/5">
                                    <span className="text-[10px] opacity-50 uppercase">{m.channel}</span>
                                    {m.persona === 'crisis' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start w-full animate-fusion-typing">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 rounded-tl-none flex items-center gap-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-indigo-500/20">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query the kernel..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-sm text-indigo-100 focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600 shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
