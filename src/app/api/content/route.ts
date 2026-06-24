import { NextResponse } from "next/server";
import { getWebsiteContent } from "@/app/[locale]/admin/settings/actions";

export async function GET() {
  try {
    const content = await getWebsiteContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load website content" }, { status: 500 });
  }
}
