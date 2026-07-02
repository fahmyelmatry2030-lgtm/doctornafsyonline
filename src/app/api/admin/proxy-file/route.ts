import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "cloudinary";

// Ensure cloudinary is configured
if (!cloudinary.v2.config().api_key) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (!session.user.role.startsWith("ADMIN") && session.user.role !== "THERAPIST")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // If it's a Cloudinary URL that has /image/upload/ and is a PDF, it might be blocked publicly.
    // We generate a signed URL to allow downloading it.
    if (fileUrl.includes("res.cloudinary.com") && fileUrl.includes("/image/upload/") && fileUrl.toLowerCase().endsWith(".pdf")) {
      // Extract the public_id
      // URL format: https://res.cloudinary.com/CLOUD_NAME/image/upload/v123456789/FOLDER/FILE.pdf
      const urlParts = fileUrl.split("/upload/");
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1];
        // Remove version number (v123456789/) if present
        const pathParts = pathAfterUpload.split("/");
        let publicIdWithExt = pathAfterUpload;
        if (pathParts[0].match(/^v\d+$/)) {
          publicIdWithExt = pathParts.slice(1).join("/");
        }
        
        // Remove extension for public_id
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
        
        // Generate signed URL
        const signedUrl = cloudinary.v2.utils.private_download_url(publicId, "pdf", {
          resource_type: "image",
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        });
        
        return NextResponse.redirect(signedUrl);
      }
    }

    // For all other URLs (local or already raw), just redirect to them normally
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("Proxy file error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
