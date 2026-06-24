import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default async function PatientMessagesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Fetch unique therapists the patient has had appointments with
  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: {
      therapist: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationsMap = new Map();
  appointments.forEach(app => {
    const tId = app.therapist.id;
    if (!conversationsMap.has(tId)) {
      conversationsMap.set(tId, app);
    } else {
      const existing = conversationsMap.get(tId);
      const existingLastMsg = existing.messages[0]?.createdAt || new Date(0);
      const newLastMsg = app.messages[0]?.createdAt || new Date(0);
      if (newLastMsg > existingLastMsg) {
        conversationsMap.set(tId, app);
      }
    }
  });

  const conversations = Array.from(conversationsMap.values());

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">رسائلي</h1>
          <p className="text-slate-600 mt-2 text-lg">تواصل مع أطبائك وأخصائييك.</p>
        </div>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Contacts Sidebar */}
        <div className="w-full md:w-1/3 border-l border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث عن أخصائي..." 
                className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-sm focus:border-indigo-400 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                لا توجد محادثات حتى الآن.
              </div>
            ) : (
              conversations.map((app) => (
                <Link 
                  key={app.id} 
                  href={`/session/${app.id}`} 
                  className="flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-white transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                    {app.therapist.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-bold text-slate-800 truncate">د. {app.therapist.name}</h3>
                      <span className="text-[10px] text-slate-400">
                        {app.messages[0] ? format(new Date(app.messages[0].createdAt), 'MMM d', { locale: arSA }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {app.messages[0] ? app.messages[0].content : "انقر لبدء المحادثة في الجلسة"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Chat Area Placeholder */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-500">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">اختر محادثة</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            قم باختيار الأخصائي من القائمة الجانبية للدخول إلى الغرفة التفاعلية.
          </p>
        </div>
      </div>
    </div>
  );
}
