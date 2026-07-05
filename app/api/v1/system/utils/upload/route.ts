import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/core/database/prisma";
import { getOptionalAuth } from "@/features/auth/infrastructure/guards/auth.guard";

/**
 * @swagger
 * /api/v1/system/utils/upload:
 *   post:
 *     summary: Upload a file
 *     description: Endpoint for file uploads using Supabase Storage. Uploads to the 'uploads' bucket and saves to DB if it's an image or video.
 *     tags:
 *       - Utility
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File successfully uploaded
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://your-project.supabase.co/storage/v1/object/public/uploads/123456789-file.jpg
 *                     filename:
 *                       type: string
 *                       example: file.jpg
 *                     size:
 *                       type: integer
 *                       example: 1024
 *                     contentType:
 *                       type: string
 *                       example: image/jpeg
 *       400:
 *         description: Bad Request - No file provided
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await getOptionalAuth(request);
    const userId = auth?.userId || null;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "No file was provided in the request" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    // Extract the file extension (e.g., '.jpg', '.png')
    const extension = file.name.includes('.') 
      ? `.${file.name.split('.').pop()}` 
      : '';
      
    // Use a clean, random ID for the storage URL to prevent any character issues
    const filename = `${uniqueSuffix}${extension}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Storage error: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);

    // Save to database based on file type
    if (file.type.startsWith('image/')) {
      await prisma.uploadedImage.create({
        data: {
          userId,
          url: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }
      });
    } else if (file.type.startsWith('video/')) {
      await prisma.uploadedVideo.create({
        data: {
          userId,
          url: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadStatus: "completed"
        }
      });
    }

    return NextResponse.json({
      status: "success",
      message: "File successfully uploaded",
      data: {
        url: publicUrl,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to process the upload" },
      { status: 500 }
    );
  }
}
