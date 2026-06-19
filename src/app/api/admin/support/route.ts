import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_VIEWER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  // Creating support tickets is usually done publicly (or by logged-in users). But let's check who creates tickets.
  // In the admin dashboard, we don't create tickets, but we fetch them. The public contact form creates them.
  // Wait, let's see if the admin API endpoint POST is used publicly.
  // If it's `/api/admin/support`, then only admins should access it. Let's block if the user is not ADMIN.
  // Actually, if a normal user creates a support ticket, they might call a public endpoint. Let's see if there is another public support ticket endpoint.
  // Wait, let's check: POST to /api/admin/support is only used in testing or maybe by admins?
  // Let's secure both POST and PUT to be ADMIN-only.
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await req.json();
  const ticket = await prisma.supportTicket.create({ data });
  return NextResponse.json(ticket);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, response, status } = await req.json();
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { response, status, updatedAt: new Date() },
  });
  return NextResponse.json(ticket);
}
