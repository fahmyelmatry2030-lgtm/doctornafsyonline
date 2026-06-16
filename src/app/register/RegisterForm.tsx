"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "therapist" ? "THERAPIST" : "PATIENT";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole as "PATIENT" | "THERAPIST",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "فشل التسجيل");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">إنشاء حساب</h1>
        <p className="mb-6 text-sm text-slate-500">ابدأ رحلتك نحو صحة نفسية أفضل</p>

        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "PATIENT" })}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              form.role === "PATIENT"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            أبحث عن علاج
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "THERAPIST" })}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              form.role === "THERAPIST"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            أنا أخصائي
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              الاسم الكامل
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              placeholder="01xxxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          لديك حساب؟{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            سجّل دخول
          </Link>
        </p>
      </div>
    </div>
  );
}
