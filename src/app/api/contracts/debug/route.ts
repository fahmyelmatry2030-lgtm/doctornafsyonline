import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Debug endpoint: GET /api/contracts/debug
// Shows exactly what's stored in the DB for contracts
export async function GET() {
  try {
    const results: any = {};

    for (const type of ["trial", "marketing", "annual"]) {
      const dbKey = `contract_pdf_${type}`;
      const record = await prisma.systemSetting.findUnique({
        where: { key: dbKey },
      });

      if (!record) {
        results[type] = { status: "NOT_FOUND", message: "لا يوجد عقد مخزن" };
        continue;
      }

      const base64Length = record.value.length;
      const buffer = Buffer.from(record.value, "base64");
      const pdfHeader = buffer.slice(0, 5).toString("ascii");
      const isPdf = pdfHeader.startsWith("%PDF");

      results[type] = {
        status: isPdf ? "VALID_PDF" : "CORRUPTED",
        base64Length,
        decodedSize: buffer.length,
        decodedSizeKB: (buffer.length / 1024).toFixed(1) + " KB",
        first5Bytes: pdfHeader,
        isPdf,
      };
    }

    // Also check site_settings
    const settingsRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" },
    });
    const settings = settingsRecord ? JSON.parse(settingsRecord.value) : {};
    results.urls = {
      trial: settings.trialContractUrl || "NOT SET",
      marketing: settings.marketingContractUrl || "NOT SET",
      annual: settings.annualContractUrl || "NOT SET",
    };

    // Scan for expiring trials and send email alert
    const allTherapists = await prisma.user.findMany({
      where: { role: "THERAPIST" },
      include: { therapistProfile: true }
    });

    const nowTime = new Date().getTime();
    const alertSentKey = "trial_alerts_sent_json";
    const alertsSentRecord = await prisma.systemSetting.findUnique({ where: { key: alertSentKey } });
    let alertsSentList: Record<string, string> = {};
    if (alertsSentRecord) {
      try {
        alertsSentList = JSON.parse(alertsSentRecord.value);
      } catch {}
    }

    const emailAlertsTriggered: Array<any> = [];

    for (const t of allTherapists) {
      if (!t.therapistProfile) continue;
      const profileCreatedAt = new Date(t.therapistProfile.createdAt).getTime();
      const daysSinceCreation = (nowTime - profileCreatedAt) / (1000 * 60 * 60 * 24);

      let annualApproved = false;
      const contractVal = t.therapistProfile.contractUrl;
      if (contractVal && contractVal.startsWith("{")) {
        try {
          const parsed = JSON.parse(contractVal);
          if (parsed.annual && parsed.annual.status === "APPROVED") {
            annualApproved = true;
          }
        } catch {}
      }

      // If they are on day 11 to 14 of their trial and don't have annual contract approved yet, trigger email alert
      if (daysSinceCreation >= 11 && !annualApproved) {
        // Send alert if we haven't sent one in the last 3 days
        const lastSentStr = alertsSentList[t.id];
        const lastSent = lastSentStr ? new Date(lastSentStr).getTime() : 0;
        const limit3Days = 3 * 24 * 60 * 60 * 1000;

        if (nowTime - lastSent > limit3Days) {
          const remainingDays = Math.max(0, Math.ceil(14 - daysSinceCreation));
          const statusText = daysSinceCreation >= 14 ? "منتهية ومغلقة" : `أوشكت على الانتهاء (متبقي ${remainingDays} أيام)`;
          
          if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const { sendEmail } = await import("@/lib/mail");
            const hrEmail = settings.contactEmail || "support@doctornafsyonline.com";
            
            const htmlContent = `
              <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: right;">
                <h2 style="color: #EF4444; text-align: center; margin-top: 10px;">⚠️ تنبيه الموارد البشرية والإدارة - منصة نفسي</h2>
                <p>تنبيه بخصوص أخصائي في فترة التجربة:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background-color: #F9FAFB;">
                    <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: bold;">اسم الأخصائي:</td>
                    <td style="padding: 10px; border: 1px solid #E5E7EB;">${t.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: bold;">البريد الإلكتروني:</td>
                    <td style="padding: 10px; border: 1px solid #E5E7EB;">${t.email}</td>
                  </tr>
                  <tr style="background-color: #F9FAFB;">
                    <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: bold;">حالة فترة التجربة:</td>
                    <td style="padding: 10px; border: 1px solid #E5E7EB; color: #DC2626; font-weight: bold;">${statusText}</td>
                  </tr>
                </table>
                <p>يرجى اتخاذ إجراء مراجعة الأخصائي إما بتفعيل العقد السنوي الشامل أو اتخاذ الإجراء المناسب.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.NEXT_PUBLIC_API_URL || "https://doctornafsyonline.com"}/admin/therapists?search=${encodeURIComponent(t.name)}" style="background-color: #4318FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">الانتقال للوحة التحكم</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999; text-align: center;">هذا تنبيه تلقائي من النظام لمسؤولي الموارد البشرية.</p>
              </div>
            `;

            await sendEmail({
              to: hrEmail,
              subject: `⚠️ تنبيه فترة تجربة أخصائي - ${t.name}`,
              html: htmlContent
            });

            alertsSentList[t.id] = new Date().toISOString();
            emailAlertsTriggered.push({ id: t.id, name: t.name, status: "EMAIL_SENT" });
          } else {
            emailAlertsTriggered.push({ id: t.id, name: t.name, status: "SMTP_NOT_CONFIGURED" });
          }
        }
      }
    }

    if (emailAlertsTriggered.length > 0) {
      await prisma.systemSetting.upsert({
        where: { key: alertSentKey },
        update: { value: JSON.stringify(alertsSentList) },
        create: { key: alertSentKey, value: JSON.stringify(alertsSentList) }
      });
    }

    results.emailAlerts = emailAlertsTriggered;

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
