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
        
        // Generate a ZIP download URL because Cloudinary free tier blocks raw PDF delivery
        const zipUrl = cloudinary.v2.utils.download_zip_url({
          public_ids: [publicId],
          resource_type: "image", // The PDFs were uploaded with resource_type image
          target_public_id: `nafsi_file_${publicId.split("/").pop()}`
        });

        return NextResponse.redirect(zipUrl);
      }
    }

    // For all other URLs (local or already raw), just redirect to them normally
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("Proxy file error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
