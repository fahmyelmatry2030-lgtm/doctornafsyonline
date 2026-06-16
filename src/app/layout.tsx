import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { getSettings } from "@/app/admin/settings/actions";
import { auth } from "@/lib/auth";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  variable: "--font-tajawal",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = settings?.platformName || "نَفسي";
  return {
    title: `${name} — منصة العلاج النفسي أونلاين`,
    description: "تواصل مع أخصائيين نفسيين معتمدين. جلسات فيديو وصوت ومحادثة نصية آمنة داخل المنصة.",
  };
}

import { LayoutWrapper } from "@/components/LayoutWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, session] = await Promise.all([
    getSettings(),
    auth()
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  if (settings.maintenanceMode && !isAdmin) {
    return (
      <html lang="ar" dir="rtl" className={`h-full ${tajawal.variable}`}>
        <body className="min-h-full flex flex-col justify-center items-center font-sans antialiased bg-slate-900 text-white p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="text-6xl animate-bounce">🚧</div>
            <h1 className="text-3xl font-black">{settings.platformName}</h1>
            <h2 className="text-xl font-bold text-indigo-400">المنصة في وضع الصيانة حالياً</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              نعمل حالياً على إجراء بعض التحديثات والتحسينات للمنصة لنقدم لكم أفضل تجربة رعاية نفسية. سنعود قريباً جداً!
            </p>
            <div className="h-px bg-slate-800 w-full my-4" />
            <p className="text-xs text-slate-500">شكراً لتفهمكم وصبركم الجميل.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ar" dir="rtl" className={`h-full ${tajawal.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <Providers>
          <LayoutWrapper header={<Header />} footer={<Footer />}>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
