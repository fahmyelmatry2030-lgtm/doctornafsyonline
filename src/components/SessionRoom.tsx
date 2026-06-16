"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Video,
  VideoOff,
} from "lucide-react";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
};

type SessionRoomProps = {
  appointmentId: string;
  sessionType: "VIDEO" | "AUDIO" | "CHAT";
  livekitToken: string | null;
  livekitUrl: string | null;
  livekitConfigured: boolean;
  currentUserId: string;
  currentUserName: string;
  otherParticipantName: string;
};

function ChatOnlySession({
  appointmentId,
  currentUserId,
  currentUserName,
  otherParticipantName,
}: Omit<
  SessionRoomProps,
  "sessionType" | "livekitToken" | "livekitUrl" | "livekitConfigured"
>) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/appointments/${appointmentId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, [appointmentId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    if (res.ok) {
      setInput("");
      await loadMessages();
    }
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="font-bold text-slate-800">جلسة محادثة نصية</h2>
        <p className="text-sm text-slate-500">مع {otherParticipantName}</p>
      </div>
      <ChatPanel
        messages={messages}
        currentUserId={currentUserId}
        bottomRef={bottomRef}
      />
      <MessageInput
        input={input}
        setInput={setInput}
        onSubmit={sendMessage}
        sending={sending}
      />
    </div>
  );
}

function ChatPanel({
  messages,
  currentUserId,
  bottomRef,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          ابدأ المحادثة — جميع الرسائل مشفرة وسرية
        </p>
      )}
      {messages.map((msg) => {
        const isMine = msg.sender.id === currentUserId;
        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                isMine
                  ? "rounded-br-sm bg-teal-600 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-800"
              }`}
            >
              {!isMine && (
                <p className="mb-1 text-xs font-medium opacity-70">
                  {msg.sender.name}
                </p>
              )}
              <p>{msg.content}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageInput({
  input,
  setInput,
  onSubmit,
  sending,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 border-t border-slate-100 p-4"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="اكتب رسالتك..."
        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400"
      />
      <button
        type="submit"
        disabled={sending || !input.trim()}
        className="flex items-center justify-center rounded-xl bg-teal-600 px-4 text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}

function LiveKitSession({
  appointmentId,
  sessionType,
  livekitToken,
  livekitUrl,
  currentUserId,
  otherParticipantName,
}: SessionRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/appointments/${appointmentId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, [appointmentId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await fetch(`/api/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    setInput("");
    await loadMessages();
  }

  if (!livekitToken || !livekitUrl) {
    return <DemoSessionMode sessionType={sessionType} appointmentId={appointmentId} currentUserId={currentUserId} otherParticipantName={otherParticipantName} />;
  }

  return (
    <LiveKitRoom
      token={livekitToken}
      serverUrl={livekitUrl}
      connect={true}
      audio={sessionType !== "CHAT"}
      video={sessionType === "VIDEO"}
      className="h-[calc(100vh-8rem)]"
    >
      <div className="flex h-full gap-4">
        <div className={`flex flex-1 flex-col ${showChat ? "lg:w-2/3" : "w-full"}`}>
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-800 px-4 py-2 text-white">
            <span className="text-sm">
              {sessionType === "VIDEO" ? "جلسة فيديو" : "جلسة صوتية"} — {otherParticipantName}
            </span>
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs hover:bg-slate-600"
            >
              <MessageSquare className="h-4 w-4" />
              {showChat ? "إخفاء الشات" : "إظهار الشات"}
            </button>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl bg-slate-900">
            <VideoConference />
          </div>
          <RoomAudioRenderer />
        </div>

        {showChat && (
          <div className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white lg:w-1/3">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-800">محادثة الجلسة</h3>
            </div>
            <ChatPanel messages={messages} currentUserId={currentUserId} bottomRef={bottomRef} />
            <MessageInput input={input} setInput={setInput} onSubmit={sendMessage} sending={false} />
          </div>
        )}
      </div>
    </LiveKitRoom>
  );
}

function DemoSessionMode({
  sessionType,
  appointmentId,
  currentUserId,
  otherParticipantName,
}: {
  sessionType: "VIDEO" | "AUDIO" | "CHAT";
  appointmentId: string;
  currentUserId: string;
  otherParticipantName: string;
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(sessionType === "VIDEO");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/appointments/${appointmentId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, [appointmentId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await fetch(`/api/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    setInput("");
    await loadMessages();
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex flex-1 flex-col">
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          وضع تجريبي — أضف مفاتيح LiveKit في ملف .env لتفعيل الفيديو والصوت الحقيقي
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
          {sessionType === "VIDEO" && (
            <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-teal-600/30 text-4xl font-bold text-teal-300">
              {otherParticipantName.charAt(0)}
            </div>
          )}
          {sessionType === "AUDIO" && (
            <div className="mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-teal-600/40">
              <Mic className="h-10 w-10 text-teal-300" />
            </div>
          )}
          <p className="text-lg text-white">{otherParticipantName}</p>
          <p className="mt-1 text-sm text-slate-400">
            {sessionType === "VIDEO" ? "جلسة فيديو" : "جلسة صوتية"}
          </p>

          <div className="absolute bottom-6 flex gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`rounded-full p-4 ${micOn ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            {sessionType === "VIDEO" && (
              <button
                onClick={() => setCamOn(!camOn)}
                className={`rounded-full p-4 ${camOn ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            )}
            <button className="rounded-full bg-red-600 p-4 text-white hover:bg-red-700">
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white lg:w-96">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">محادثة الجلسة</h3>
        </div>
        <ChatPanel messages={messages} currentUserId={currentUserId} bottomRef={bottomRef} />
        <MessageInput input={input} setInput={setInput} onSubmit={sendMessage} sending={false} />
      </div>
    </div>
  );
}

export function SessionRoom(props: SessionRoomProps) {
  if (props.sessionType === "CHAT") {
    return (
      <ChatOnlySession
        appointmentId={props.appointmentId}
        currentUserId={props.currentUserId}
        currentUserName={props.currentUserName}
        otherParticipantName={props.otherParticipantName}
      />
    );
  }

  return <LiveKitSession {...props} />;
}
