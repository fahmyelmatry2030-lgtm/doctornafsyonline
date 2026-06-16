"use client";

import { useState } from "react";
import { 
  ArrowDownToLine, 
  X, 
  CheckCircle, 
  Loader2, 
  CreditCard, 
  Wallet,
  Smartphone
} from "lucide-react";

type WithdrawalButtonProps = {
  maxAmount: number;
};

export default function WithdrawalButton({ maxAmount }: WithdrawalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<"instapay" | "vodafone" | "bank">("instapay");
  const [amount, setAmount] = useState(maxAmount.toString());
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (parsedAmount > maxAmount) {
      setError("المبلغ المدخل يتجاوز الرصيد المتاح لديك");
      return;
    }

    if (!details.trim()) {
      setError("يرجى إدخال تفاصيل الحساب أو رقم التحويل");
      return;
    }

    setLoading(true);
    // Simulate API request to process payout
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
  }

  function handleClose() {
    setIsOpen(false);
    setSuccess(false);
    setAmount(maxAmount.toString());
    setDetails("");
    setError("");
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={maxAmount <= 0}
        className="w-full mt-6 bg-white text-indigo-700 disabled:bg-indigo-100/50 disabled:text-indigo-400 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <ArrowDownToLine className="w-4 h-4" /> طلب سحب الرصيد
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={handleClose}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">تم تقديم الطلب بنجاح!</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  لقد استلمنا طلب سحب مبلغ <span className="font-bold text-indigo-600">{amount} ج.م</span>. 
                  سيتم مراجعة الطلب وتحويل الأموال إلى حسابك في غضون 24 ساعة عمل.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition"
                >
                  إغلاق النافذة
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-950">سحب الرصيد إلى حسابك</h3>
                  <p className="text-xs text-slate-500 mt-1">الرصيد الأقصى المتاح للسحب هو {maxAmount} ج.م</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold text-center">
                    {error}
                  </div>
                )}

                {/* Amount field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">المبلغ المطلوب سحبه</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={maxAmount}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all font-bold text-slate-900"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                      ج.م
                    </div>
                  </div>
                </div>

                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">طريقة التحويل</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "instapay", label: "InstaPay", icon: <Wallet className="w-4 h-4" /> },
                      { id: "vodafone", label: "فودافون", icon: <Smartphone className="w-4 h-4" /> },
                      { id: "bank", label: "حساب بنكي", icon: <CreditCard className="w-4 h-4" /> },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMethod(m.id as any);
                          setDetails("");
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                          method === m.id
                            ? "border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1] font-bold"
                            : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {m.icon}
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {method === "instapay" && "عنوان InstaPay (IPA)"}
                    {method === "vodafone" && "رقم محفظة فودافون كاش"}
                    {method === "bank" && "رقم الحساب البنكي أو الآيبان (IBAN)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={
                      method === "instapay"
                        ? "example@instapay"
                        : method === "vodafone"
                        ? "01xxxxxxxxx"
                        : "EGxxxxxxxxxxxxxxxxxxxxxxx"
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || maxAmount <= 0}
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6366F1]/20 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري معالجة الطلب...
                    </>
                  ) : (
                    "تأكيد طلب السحب"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
