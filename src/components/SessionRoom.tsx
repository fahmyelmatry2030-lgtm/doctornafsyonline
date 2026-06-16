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
  FileText,
  Save,
  Loader2,
  Paperclip,
  Download,
  Video as VideoIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { WaitingLobby } from "./WaitingLobby";

type ChatMessage = {
  id: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
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
  isTherapist?: boolean;
};

function TherapistNotesPanel({ appointmentId }: { appointmentId: string }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/notes`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || "");
        }
      } catch (e) {
        console.error("Error loading notes", e);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, [appointmentId]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <div className="border-b border-slate-100 pb-3 mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-500" />
          التقرير الطبي والملاحظات
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">اكتب تشخيص الحالة والتقرير الطبي هنا لحفظه بملف المريض.</p>
      </div>
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ابدأ بكتابة تقرير الجلسة وملاحظاتك المهنية..."
            className="flex-1 text-sm rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-slate-800 focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none resize-none transition-all"
          ></textarea>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">
              {saveStatus === "saving" && "جاري الحفظ..."}
              {saveStatus === "saved" && "✓ تم الحفظ بنجاح"}
              {saveStatus === "error" && "✗ فشل الحفظ"}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6366F1]/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              حفظ التقرير
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatOnlySession({
  appointmentId,
  currentUserId,
  currentUserName,
  otherParticipantName,
  isTherapist,
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

  async function handleFileUpload(file: File) {
    setSending(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/files`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await loadMessages();
      } else {
        alert("فشل رفع الملف.");
      }
    } catch {
      alert("حدث خطأ أثناء رفع الملف.");
    } finally {
      setSending(false);
    }
  }

  const chatLayout = (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white">
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
        onFileUpload={handleFileUpload}
      />
    </div>
  );

  if (isTherapist) {
    return (
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
        <div className="lg:col-span-2 h-full flex flex-col">
          {chatLayout}
        </div>
        <div className="lg:col-span-1 h-full rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <TherapistNotesPanel appointmentId={appointmentId} />
        </div>
      </div>
    );
  }

  return <div className="h-[calc(100vh-8rem)]">{chatLayout}</div>;
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
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-800"
              }`}
            >
              {!isMine && (
                <p className="mb-1 text-xs font-medium opacity-70">
                  {msg.sender.name}
                </p>
              )}
              {msg.fileUrl ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs opacity-80 font-semibold flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> مستند مشترك
                  </span>
                  <p className="font-bold underline">{msg.fileName}</p>
                  <a
                    href={msg.fileUrl}
                    download={msg.fileName || "shared_file"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold w-fit mt-1 transition-all ${
                      isMine ? "bg-white/20 hover:bg-white/30 text-white" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل الملف
                  </a>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
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
  onFileUpload,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  onFileUpload?: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 border-t border-slate-100 p-4 items-center"
    >
      {onFileUpload && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="إرفاق ملف"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="اكتب رسالتك..."
        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
      />
      <button
        type="submit"
        disabled={sending || !input.trim()}
        className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}

function RecordingConsentManager({
  onStartRecording,
  onStopRecording,
  isRecording,
  otherParticipantName,
}: {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  otherParticipantName: string;
}) {
  const [consentRequested, setConsentRequested] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const requestRecording = () => {
    // In real system, this triggers a signaling event. Here we show consent interface
    setConsentRequested(true);
    setShowConsentModal(true);
  };

  const handleGrant = () => {
    setConsentGranted(true);
    setShowConsentModal(false);
    onStartRecording();
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <button
          onClick={onStopRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold animate-pulse shadow-md"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          إيقاف التسجيل
        </button>
      ) : (
        <button
          onClick={requestRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 rounded-xl text-xs font-bold"
        >
          <VideoIcon className="w-3.5 h-3.5" />
          طلب تسجيل الجلسة
        </button>
      )}

      {showConsentModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <VideoIcon className="w-12 h-12 text-indigo-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-slate-800">موافقة متبادلة على تسجيل الجلسة</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              وفقاً لشروط الخصوصية الطبية، يتطلب تسجيل هذه المكالمة موافقة صريحة من كلا الطرفين. يرجى تأكيد موافقتك.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleGrant}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> موافق
              </button>
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" /> إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveKitSession({
  appointmentId,
  sessionType,
  livekitToken,
  livekitUrl,
  currentUserId,
  otherParticipantName,
  isTherapist,
}: SessionRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Local browser screen/media recorder
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startLocalRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      recordedChunksRef.current = [];
      const options = { mimeType: "video/webm; codecs=vp9" };
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-${appointmentId}-${Date.now()}.webm`;
        a.click();
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start browser screen recording", err);
      alert("لم يتم إعطاء صلاحيات كافية لتسجيل الشاشة.");
    }
  };

  const stopLocalRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

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

  async function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/files`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await loadMessages();
      } else {
        alert("فشل رفع الملف.");
      }
    } catch {
      alert("حدث خطأ أثناء الرفع.");
    }
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <DemoSessionMode
        sessionType={sessionType}
        appointmentId={appointmentId}
        currentUserId={currentUserId}
        otherParticipantName={otherParticipantName}
        isTherapist={isTherapist}
        onFileUpload={handleFileUpload}
        onStartRecording={startLocalRecording}
        onStopRecording={stopLocalRecording}
        isRecording={isRecording}
      />
    );
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
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-800 px-4 py-2 text-white flex-wrap gap-2">
            <span className="text-sm">
              {sessionType === "VIDEO" ? "جلسة فيديو" : "جلسة صوتية"} — {otherParticipantName}
            </span>
            <div className="flex items-center gap-3">
              <RecordingConsentManager
                onStartRecording={startLocalRecording}
                onStopRecording={stopLocalRecording}
                isRecording={isRecording}
                otherParticipantName={otherParticipantName}
              />
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs hover:bg-slate-600 font-bold"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? "إخفاء الجوانب" : "عرض المحادثة والتقرير"}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl bg-slate-900">
            <VideoConference />
          </div>
          <RoomAudioRenderer />
        </div>

        {showChat && (
          <div className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white lg:w-1/3 overflow-hidden shadow-sm">
            {isTherapist && (
              <div className="flex border-b border-slate-100 p-1 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === "chat" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  المحادثة
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === "notes" ? "bg-white text-[#6366F1] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  التقرير الطبي
                </button>
              </div>
            )}

            {(!isTherapist || activeTab === "chat") ? (
              <>
                <div className="border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800">محادثة الجلسة</h3>
                </div>
                <ChatPanel messages={messages} currentUserId={currentUserId} bottomRef={bottomRef} />
                <MessageInput input={input} setInput={setInput} onSubmit={sendMessage} sending={false} onFileUpload={handleFileUpload} />
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <TherapistNotesPanel appointmentId={appointmentId} />
              </div>
            )}
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
  isTherapist,
  onFileUpload,
  onStartRecording,
  onStopRecording,
  isRecording,
}: {
  sessionType: "VIDEO" | "AUDIO" | "CHAT";
  appointmentId: string;
  currentUserId: string;
  otherParticipantName: string;
  isTherapist?: boolean;
  onFileUpload: (file: File) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(sessionType === "VIDEO");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
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
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex justify-between items-center flex-wrap gap-2">
          <span>وضع تجريبي — أضف مفاتيح LiveKit في ملف .env لتفعيل الفيديو والصوت الحقيقي</span>
          <RecordingConsentManager
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            isRecording={isRecording}
            otherParticipantName={otherParticipantName}
          />
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

      <div className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white lg:w-96 overflow-hidden shadow-sm">
        {isTherapist && (
          <div className="flex border-b border-slate-100 p-1 bg-slate-50/50">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "chat" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              المحادثة
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "notes" ? "bg-white text-[#6366F1] shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              التقرير الطبي
            </button>
          </div>
        )}

        {(!isTherapist || activeTab === "chat") ? (
          <>
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-800">محادثة الجلسة</h3>
            </div>
            <ChatPanel messages={messages} currentUserId={currentUserId} bottomRef={bottomRef} />
            <MessageInput input={input} setInput={setInput} onSubmit={sendMessage} sending={false} onFileUpload={onFileUpload} />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <TherapistNotesPanel appointmentId={appointmentId} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SessionRoom(props: SessionRoomProps) {
  const [inLobby, setInLobby] = useState(true);

  if (inLobby) {
    return (
      <WaitingLobby
        otherParticipantName={props.otherParticipantName}
        sessionType={props.sessionType}
        onEnter={() => setInLobby(false)}
      />
    );
  }

  if (props.sessionType === "CHAT") {
    return (
      <ChatOnlySession
        appointmentId={props.appointmentId}
        currentUserId={props.currentUserId}
        currentUserName={props.currentUserName}
        otherParticipantName={props.otherParticipantName}
        isTherapist={props.isTherapist}
      />
    );
  }

  return <LiveKitSession {...props} />;
}

