import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  const data = await req.json();
  const ticket = await prisma.supportTicket.create({ data });
  return NextResponse.json(ticket);
}

export async function PUT(req: Request) {
  const { id, response, status } = await req.json();
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { response, status, updatedAt: new Date() },
  });
  return NextResponse.json(ticket);
}
