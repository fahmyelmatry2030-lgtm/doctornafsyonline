"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Loader2, 
  PhoneCall, 
  Video, 
  ShieldCheck 
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import Link from "next/link";

type Conversation = {
  appointmentId: string;
  patient: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
};

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
};

type TherapistChatWrapperProps = {
  initialConversations: Conversation[];
  currentUserId: string;
};

export default function TherapistChatWrapper({
  initialConversations,
  currentUserId,
}: TherapistChatWrapperProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!activeConv) return;
    try {
      const res = await fetch(`/api/appointments/${activeConv.appointmentId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error loading chat messages", e);
    }
  }, [activeConv]);

  // Handle active conversation change
  useEffect(() => {
    if (!activeConv) return;
    
    setLoadingMessages(true);
    loadMessages().finally(() => setLoadingMessages(false));

    // Poll for new messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConv, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || !activeConv) return;

    setSending(true);
    const content = input.trim();
    setInput("");

    try {
      const res = await fetch(`/api/appointments/${activeConv.appointmentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        await loadMessages();
        // Update last message in the sidebar list
        setConversations((prev) =>
          prev.map((c) =>
            c.appointmentId === activeConv.appointmentId
              ? {
                  ...c,
                  lastMessage: {
                    content,
                    createdAt: new Date().toISOString(),
                  },
                }
              : c
          )
        );
      } else {
        alert("فشل إرسال الرسالة");
      }
    } catch {
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setSending(false);
    }
  }

  // Filter conversations by patient name
  const filteredConversations = conversations.filter((c) =>
    c.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden flex flex-col md:flex-row min-h-[600px] h-[calc(100vh-16rem)]">
      
      {/* Sidebar: Contacts List */}
      <div className="w-full md:w-1/3 border-l border-slate-100 flex flex-col bg-slate-50/20">
        <div className="p-4 border-b border-slate-100 bg-white/50">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن مريض..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              {searchQuery ? "لا توجد نتائج للبحث." : "لا توجد محادثات نشطة."}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConv?.appointmentId === conv.appointmentId;
              return (
                <div
                  key={conv.appointmentId}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-start gap-3 p-4 hover:bg-white transition-all cursor-pointer border-r-4 ${
                    isActive
                      ? "bg-white border-r-[#6366F1]"
                      : "border-r-transparent text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {conv.patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-bold truncate">{conv.patient.name}</h3>
                      <span className="text-[9px] text-slate-400">
                        {conv.lastMessage
                          ? format(new Date(conv.lastMessage.createdAt), "hh:mm a", { locale: arSA })
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage ? conv.lastMessage.content : "انقر لبدء المحادثة..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {activeConv ? (
          <>
            {/* Active Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  {activeConv.patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{activeConv.patient.name}</h3>
                  <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    محادثة آمنة وسرية
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/session/${activeConv.appointmentId}`}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  دخول الجلسة
                </Link>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-35" />
                  <p className="text-sm">ابدأ المحادثة — جميع الرسائل محمية وسرية بالكامل.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender.id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMine
                            ? "rounded-br-sm bg-indigo-600 text-white"
                            : "rounded-bl-sm bg-white text-slate-800 border border-slate-100"
                        }`}
                      >
                        {!isMine && (
                          <p className="mb-0.5 text-[10px] font-bold text-indigo-600 opacity-90">
                            {msg.sender.name}
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-[8px] text-right mt-1.5 opacity-60 ${
                            isMine ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          {format(new Date(msg.createdAt), "hh:mm a", { locale: arSA })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center shadow-premium"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك للمريض..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6366F1]/20 text-white transition-all disabled:opacity-50 shrink-0"
              >
                <Send className="h-5 w-5 rotate-180" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-5 text-indigo-500">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">تواصل مع مرضاك</h2>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              قم باختيار مريض من القائمة الجانبية لبدء المحادثة المباشرة معه ومتابعة حالته النفسية.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
