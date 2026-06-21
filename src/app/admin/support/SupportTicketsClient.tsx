"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle, Clock, Trash2, Reply } from "lucide-react";

type SupportTicket = {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function SupportTicketsClient({
  initialTickets,
  isReadOnly,
  updateTicketStatus,
  deleteTicket,
}: {
  initialTickets: SupportTicket[];
  isReadOnly: boolean;
  updateTicketStatus: (id: string, status: string, response: string) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  // Reply Modal State
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredTickets = tickets.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  const handleUpdateStatus = async (id: string, status: string, responseText: string) => {
    if (isReadOnly) return;
    setLoading(id);
    try {
      await updateTicketStatus(id, status, responseText);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status, response: responseText } : t))
      );
      setReplyTicket(null);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm("هل أنت متأكد من مسح هذه التذكرة نهائياً؟")) return;
    
    setLoading(id);
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2B3674] mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            رسائل الدعم الفني 🎧
          </h1>
          <p className="text-slate-500 font-medium">إدارة استفسارات ومشاكل المستخدمين والرد عليها</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "OPEN", "RESOLVED", "CLOSED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              filter === f
                ? "bg-[#2B3674] text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "ALL" && "الكل"}
            {f === "OPEN" && "مفتوحة 🕒"}
            {f === "RESOLVED" && "تم الرد ✅"}
            {f === "CLOSED" && "مغلقة 🔒"}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#2B3674]">{ticket.subject}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  من: {ticket.userName} ({ticket.userEmail})
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                ticket.status === "OPEN" ? "bg-amber-100 text-amber-700" :
                ticket.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" :
                "bg-slate-100 text-slate-700"
              }`}>
                {ticket.status === "OPEN" && <Clock className="w-3.5 h-3.5" />}
                {ticket.status === "RESOLVED" && <CheckCircle className="w-3.5 h-3.5" />}
                {ticket.status === "OPEN" ? "بانتظار الرد" : ticket.status === "RESOLVED" ? "تم الرد" : "مغلقة"}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed mb-6">
              {ticket.message}
            </div>

            {ticket.response && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 relative">
                <div className="absolute top-0 right-4 -mt-3 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Reply className="w-3.5 h-3.5" />
                  رد الإدارة
                </div>
                <p className="text-indigo-900 text-sm pt-2">{ticket.response}</p>
              </div>
            )}

            {!isReadOnly && (
              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                {ticket.status === "OPEN" && (
                  <button
                    onClick={() => {
                      setReplyTicket(ticket);
                      setReplyText(ticket.response || "");
                    }}
                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    الرد على الرسالة
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500 font-medium">
            لا توجد رسائل دعم فني في هذا التصنيف.
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-fade-in-up">
            <h3 className="text-xl font-bold text-[#2B3674] mb-4 border-b border-slate-100 pb-4">
              الرد على تذكرة الدعم
            </h3>
            
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك هنا... (سيتم إرسال الرد للعميل أو عرضه في حسابه)"
              className="w-full h-32 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4"
            ></textarea>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setReplyTicket(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateStatus(replyTicket.id, "RESOLVED", replyText)}
                disabled={loading === replyTicket.id || !replyText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading === replyTicket.id ? "جاري الحفظ..." : "حفظ وإغلاق التذكرة ✅"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
