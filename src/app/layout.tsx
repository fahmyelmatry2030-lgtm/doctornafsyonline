import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { getSettings } from "@/app/admin/settings/actions";


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
    icons: {
      icon: "/logo.jpeg",
      shortcut: "/logo.jpeg",
      apple: "/logo.jpeg",
    },
  };
}

import { LayoutWrapper } from "@/components/LayoutWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  let session = null;
  try {
    settings = await getSettings().catch((e) => {
      console.error("Layout getSettings error:", e);
      return null;
    });
  } catch (error) {
    console.error("RootLayout data fetch failed:", error);
  }

  if (!settings) {
    settings = {
      platformName: "دكتور نفسي",
      maintenanceMode: false,
    } as any;
  }

  const isAdmin = false; // maintenance bypass handled client-side

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
          <LayoutWrapper header={<Header platformName={settings?.platformName || "دكتور نفسي"} />} footer={<Footer />}>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
