'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { api } from '../../../services/api';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface IMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export default function AiAssistantPage() {
  const user = useAuthStore((state) => state.user);
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch chat thread history on load
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const { data } = await api.get('/ai/chat/history');
        if (data.data.messages) {
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setFetchingHistory(false);
      }
    };
    loadChatHistory();
  }, []);

  // 2. Auto-scroll to bottom of chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input;
    setInput('');
    setLoading(true);

    // Append user message to list
    setMessages((prev) => [...prev, { role: 'user', content: userPrompt }]);

    try {
      const { data } = await api.post('/ai/chat', { message: userPrompt });
      const replyText = data.reply;

      // Append assistant message to list
      setMessages((prev) => [...prev, { role: 'model', content: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          role: 'model', 
          content: 'Sorry, I failed to process that operational query. Please check that the FastAPI service is active.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col justify-between space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-emerald-400" /> AI Operations Advisor
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Chat contextually about ventilation safety thresholds, machinery mechanics, explosives laws, and production forecasts.</p>
      </div>

      {/* --- CHAT DIALOGUE BOX --- */}
      <div className="flex-grow border border-zinc-900 bg-zinc-950 p-6 rounded-2xl flex flex-col overflow-y-auto space-y-4">
        {fetchingHistory ? (
          <div className="flex-grow flex items-center justify-center text-xs font-semibold text-zinc-500">
            LOADING SECURE DIALOGUE DATABASE...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-white block">Ask anything about Operations</span>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                Welcome, Supervisor {user?.firstName}. Ask me questions like: <br />
                <span className="text-emerald-400 font-semibold block mt-2">
                  &quot;What are the ventilation limits for Methane?&quot; or &quot;Outline explosive storage rules.&quot;
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
                    isUser ? 'bg-zinc-800' : 'bg-emerald-950/40 border border-emerald-500/10'
                  }`}>
                    {isUser ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4.5 h-4.5 text-emerald-400" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-zinc-900 text-white' 
                      : 'bg-zinc-900/30 border border-zinc-900 text-zinc-300'
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-4 max-w-3xl">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-500/10 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 text-zinc-500 text-xs font-semibold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Digesting operational safety guidelines...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* --- CHAT INPUT BAR --- */}
      <form onSubmit={handleSendMessage} className="flex gap-3 sticky bottom-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI Operational Assistant..."
          className="flex-grow bg-zinc-950 border border-zinc-900 text-white rounded-xl px-5 py-4 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black px-6 rounded-xl transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
}
