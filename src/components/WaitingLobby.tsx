"use client";

import { useEffect, useRef, useState } from "react";
import { Video, Mic, MicOff, VideoOff, Settings, Sparkles, Loader2 } from "lucide-react";

type WaitingLobbyProps = {
  otherParticipantName: string;
  sessionType: "VIDEO" | "AUDIO" | "CHAT";
  onEnter: () => void;
};

export function WaitingLobby({ otherParticipantName, sessionType, onEnter }: WaitingLobbyProps) {
  const [videoEnabled, setVideoEnabled] = useState(sessionType === "VIDEO");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [permissionState, setPermissionState] = useState<"prompt" | "loading" | "granted" | "denied">("prompt");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup media stream for preview
  useEffect(() => {
    if (sessionType === "CHAT") {
      setPermissionState("granted");
      return;
    }

    async function initPreview() {
      setPermissionState("loading");
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: sessionType === "VIDEO" ? videoEnabled : false,
          audio: audioEnabled,
        });

        streamRef.current = stream;
        if (videoRef.current && videoEnabled) {
          videoRef.current.srcObject = stream;
        }
        setPermissionState("granted");
      } catch (err) {
        console.error("Camera/Mic access denied:", err);
        setPermissionState("denied");
      }
    }

    initPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled, sessionType]);

  const toggleVideo = () => {
    if (streamRef.current && sessionType === "VIDEO") {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
      <div className="text-center space-y-3 mb-8">
        <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> غرفة تحضير الجلسة الآمنة
        </span>
        <h1 className="text-3xl font-black text-slate-800">تجهيز أدوات الاتصال قبل الدخول</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
          يرجى التحقق من وضوح الكاميرا وجودة الصوت. جلستك مع <b>د. {otherParticipantName}</b> سرية ومحميّة بالكامل.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5 items-start">
        {/* Device Preview Block */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="relative aspect-video rounded-3xl bg-slate-900 border-2 border-slate-100 overflow-hidden shadow-xl flex items-center justify-center">
            {sessionType === "VIDEO" && videoEnabled && permissionState === "granted" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center border border-slate-700">
                  {sessionType === "VIDEO" ? <VideoOff className="w-8 h-8 text-slate-500" /> : <Mic className="w-8 h-8 text-slate-500" />}
                </div>
                <p className="text-sm font-bold text-slate-300">
                  {sessionType === "VIDEO"
                    ? (videoEnabled ? "بانتظار الإذن..." : "الكاميرا مغلقة")
                    : "اتصال صوتي فقط"}
                </p>
                {permissionState === "denied" && (
                  <p className="text-xs text-red-400">
                    يرجى السماح بصلاحية الكاميرا والمايك من إعدادات المتصفح.
                  </p>
                )}
              </div>
            )}

            {/* Quick Preview Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${permissionState === "granted" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              معاينة الكاميرا
            </div>
          </div>

          {/* Device Toggle Controls */}
          {sessionType !== "CHAT" && (
            <div className="flex justify-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-3">
              <button
                onClick={toggleAudio}
                className={`p-3.5 rounded-full transition-all ${
                  audioEnabled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                    : "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20"
                }`}
                title={audioEnabled ? "كتم المايك" : "تشغيل المايك"}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {sessionType === "VIDEO" && (
                <button
                  onClick={toggleVideo}
                  className={`p-3.5 rounded-full transition-all ${
                    videoEnabled
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20"
                  }`}
                  title={videoEnabled ? "قفل الكاميرا" : "فتح الكاميرا"}
                >
                  {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lobby Details Block */}
        <div className="md:col-span-2 glass rounded-3xl border border-slate-100 p-6 space-y-6 flex flex-col justify-between h-full min-h-[300px]">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" /> إعدادات الجلسة
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                <span className="text-slate-400 block mb-0.5">نوع الجلسة</span>
                <span className="font-bold text-slate-700">
                  {sessionType === "VIDEO" ? "فيديو مباشر وعالي الدقة" : sessionType === "AUDIO" ? "مكالمة صوتية عالية الجودة" : "محادثة نصية مباشرة"}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                <span className="text-slate-400 block mb-0.5">الطرف الآخر</span>
                <span className="font-bold text-slate-700">{otherParticipantName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onEnter}
            disabled={permissionState === "loading"}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-600/20 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {permissionState === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> جاري فحص الأجهزة...
              </>
            ) : (
              "انضم الآن للجلسة"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
