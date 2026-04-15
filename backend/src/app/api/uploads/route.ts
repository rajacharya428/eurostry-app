import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { UserRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'

const ALLOWED_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

const MAX_FILE_SIZE = 5 * 1024 * 1024

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return null
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', process.env.CLOUDINARY_FOLDER ?? 'eurostry')

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  const payload = (await response.json().catch(() => null)) as { secure_url?: string } | null
  if (!payload?.secure_url) {
    return null
  }

  return payload.secure_url
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  if (auth.user.role !== UserRole.ADMIN && auth.user.role !== UserRole.OWNER) {
    return errorResponse(403, 'Forbidden')
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return errorResponse(400, 'Invalid upload request')
  }

  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (files.length === 0) {
    return errorResponse(400, 'No files provided')
  }

  const uploads = []

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse(400, 'Only JPG, PNG, and WEBP images are allowed')
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(400, 'Each image must be 5MB or smaller')
    }

    const cloudinaryUrl = await uploadToCloudinary(file)

    if (cloudinaryUrl) {
      uploads.push({
        url: cloudinaryUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      })
      continue
    }

    const uploadDir = join(process.cwd(), 'backend', 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const extension = extname(file.name) || ALLOWED_TYPES.get(file.type) || '.jpg'
    const filename = `${Date.now()}-${randomUUID()}${extension}`
    const filePath = join(uploadDir, filename)
    const bytes = await file.arrayBuffer()

    await writeFile(filePath, Buffer.from(bytes))

    uploads.push({
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  }

  return json({ uploads }, { status: 201 })
}
