import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SupportTicketsClient } from "./SupportTicketsClient";
import { revalidatePath } from "next/cache";

export default async function SupportTicketsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_VIEWER")) return null;
  const isReadOnly = role === "ADMIN_VIEWER";

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function updateTicketStatus(ticketId: string, status: string, response: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status, response },
    });
    revalidatePath("/admin/support");
  }

  async function deleteTicket(ticketId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });
    revalidatePath("/admin/support");
  }

  return (
    <SupportTicketsClient 
      initialTickets={tickets} 
      isReadOnly={isReadOnly}
      updateTicketStatus={updateTicketStatus}
      deleteTicket={deleteTicket}
    />
  );
}
