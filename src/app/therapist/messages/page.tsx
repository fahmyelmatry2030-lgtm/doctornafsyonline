import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TherapistChatWrapper from "@/components/TherapistChatWrapper";

export default async function TherapistMessagesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Fetch unique patients the therapist has had appointments with
  const appointments = await prisma.appointment.findMany({
    where: { therapistId: session.user.id },
    include: {
      patient: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by patient to show one conversation per patient
  const conversationsMap = new Map();
  appointments.forEach(app => {
    const pId = app.patient.id;
    if (!conversationsMap.has(pId)) {
      conversationsMap.set(pId, app);
    } else {
      const existing = conversationsMap.get(pId);
      const existingLastMsg = existing.messages[0]?.createdAt || new Date(0);
      const newLastMsg = app.messages[0]?.createdAt || new Date(0);
      if (newLastMsg > existingLastMsg) {
        conversationsMap.set(pId, app);
      }
    }
  });

  const conversations = Array.from(conversationsMap.values());

  const formattedConversations = conversations.map((app: any) => ({
    appointmentId: app.id,
    patient: {
      id: app.patient.id,
      name: app.patient.name,
      avatar: app.patient.avatar,
    },
    lastMessage: app.messages[0]
      ? {
          content: app.messages[0].content,
          createdAt: app.messages[0].createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الرسائل والمحادثات</h1>
        <p className="text-slate-600 mt-2 text-lg">تواصل مباشر وآمن مع مرضاك المتعالجين.</p>
      </div>

      <TherapistChatWrapper
        initialConversations={formattedConversations}
        currentUserId={session.user.id}
      />
    </div>
  );
}
