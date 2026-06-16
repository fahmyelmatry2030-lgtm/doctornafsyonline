import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "نَفسي — منصة العلاج النفسي أونلاين",
  description:
    "تواصل مع أخصائيين نفسيين معتمدين. جلسات فيديو وصوت ومحادثة نصية آمنة داخل المنصة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`h-full ${tajawal.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
