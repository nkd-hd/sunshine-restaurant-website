import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth/config"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      )
    }

    // Validate file types and sizes
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB.` },
          { status: 400 }
        )
      }
    }

    const uploadedUrls: string[] = []

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "meals")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Process each file
    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `meal-${timestamp}-${randomString}.${extension}`

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)

      // Return public URL
      const publicUrl = `/uploads/meals/${filename}`
      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`
    })

  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
