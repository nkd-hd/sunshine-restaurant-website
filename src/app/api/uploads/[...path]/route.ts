import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments
    const filePath = params.path.join("/")
    
    // Construct the full file path
    const fullPath = join(process.cwd(), "public", "uploads", filePath)
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse("File not found", { status: 404 })
    }
    
    // Read the file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase()
    let contentType = "application/octet-stream"
    
    switch (extension) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg"
        break
      case "png":
        contentType = "image/png"
        break
      case "gif":
        contentType = "image/gif"
        break
      case "webp":
        contentType = "image/webp"
        break
      case "svg":
        contentType = "image/svg+xml"
        break
    }
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
    
  } catch (error) {
    console.error("Error serving uploaded file:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
