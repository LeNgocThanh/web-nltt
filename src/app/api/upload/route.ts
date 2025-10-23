import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, stat, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { prisma } from '@/lib/prisma'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    // Hỗ trợ: 1) files: File | File[]  2) file: File (tương thích cũ)
    let fileEntries: File[] = []
    const filesFromField = form.getAll('files').filter(Boolean) as File[]
    if (filesFromField.length) fileEntries = filesFromField
    const single = form.get('file') as File | null
    if (single) fileEntries.push(single)

    if (!fileEntries.length) {
      return NextResponse.json({ success: false, message: 'Thiếu files[] hoặc file' }, { status: 400 })
    }

    // dir optional: ?dir=sub hoặc form field "dir"
    const url = new URL(req.url)
    const dirParam = url.searchParams.get('dir') ?? (form.get('dir') as string | null) ?? ''
    const baseUploads = join(process.cwd(), 'public', 'uploads')
    const targetDir = dirParam && dirParam.trim() ? join(baseUploads, dirParam.trim()) : baseUploads
    if (!existsSync(targetDir)) await mkdir(targetDir, { recursive: true })

    const now = Date.now()
    const saved: { name: string; url: string; path: string }[] = []

    for (let i = 0; i < fileEntries.length; i++) {
      const f = fileEntries[i]
      const arrayBuffer = await f.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // đặt tên: <timestamp>_<i><ext>
      const ext = extname(f.name || '') || ''
      const filename = `${now}_${i}${ext}`
      const absPath = join(targetDir, filename)
      await writeFile(absPath, buffer)

      // public URL: /uploads[/dir]/<filename>
      const publicPath = dirParam && dirParam.trim()
        ? `/uploads/${encodeURIComponent(dirParam.trim())}/${encodeURIComponent(filename)}`
        : `/uploads/${encodeURIComponent(filename)}`

      saved.push({ name: filename, url: publicPath, path: absPath })
    }

    return NextResponse.json({ success: true, data: { count: saved.length, urls: saved.map(s => s.url), files: saved } })
  } catch (e) {
    console.error('Upload multiple error:', e)
    return NextResponse.json({ success: false, message: 'Upload thất bại' }, { status: 500 })
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'image' hoặc 'file'

    // Lấy danh sách files từ database
    const files = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'file_'
        },
        type: 'json'
      }
    })

    const fileList = files.map(file => {
      const fileData = JSON.parse(file.value)
      return {
        id: file.id,
        ...fileData
      }
    })

    // Lọc theo loại file nếu có
    const filteredFiles = type 
      ? fileList.filter(file => 
          type === 'image' 
            ? file.mimeType.startsWith('image/')
            : !file.mimeType.startsWith('image/')
        )
      : fileList

    return NextResponse.json({
      success: true,
      files: filteredFiles
    })
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get files' },
      { status: 500 }
    )
  }
}

async function getNamesFromReq(req: NextRequest): Promise<string[]> {
  const { searchParams } = new URL(req.url)
  const qName = searchParams.get('name')
  if (qName?.trim()) return [qName.trim()]

  const body = await req.clone().json().catch(() => null)
  if (typeof body?.name === 'string' && body.name.trim()) return [body.name.trim()]
  if (Array.isArray(body?.names) && body.names.length) {
    return body.names
      .map((v: unknown) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean)
  }
  return []
}

// (Tuỳ chọn) Xoá metadata trong DB nếu bạn có model lưu file (best-effort).
// Thử lần lượt các tên model phổ biến để khỏi phải sửa type: uploadFile | file | uploadedFile
async function deleteDbRecordsByFilenames(fileNames: string[]) {
  const candidates = ['uploadFile', 'file', 'uploadedFile'] as const
  for (const key of candidates) {
    const repo = (prisma as any)[key]
    if (!repo) continue
    try {
      // Nếu model có field 'filename' hoặc 'name', chỉnh where tương ứng:
      // Ưu tiên 'filename', fallback 'name'. Nếu model khác, thay lại cho đúng.
      const deleted = await repo.deleteMany({
        where: {
          OR: [
            { filename: { in: fileNames } },
            { name: { in: fileNames } }
          ]
        }
      })
      // Nếu xoá được >0 coi như đã đúng model, không thử các model còn lại
      if (deleted?.count > 0) return { model: key, count: deleted.count }
    } catch {
      // ignore và thử model tiếp theo
    }
  }
  return { model: null, count: 0 }
}

/**
 * DELETE /api/uploads
 * Xoá file trong thư mục uploads; hỗ trợ bulk.
 * - Query:  ?name=<filename>
 * - Body:   { "name": "<filename>" } hoặc { "names": ["a.png","b.pdf"] }
 * - Tuỳ chọn: nếu bạn truyền thêm ?dir=sub (hoặc body.dir), file sẽ xoá theo subfolder.
 */
export async function DELETE(request: NextRequest) {
  try {
    const names = await getNamesFromReq(request)
    if (names.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Thiếu tên file: ?name=... hoặc body.name / body.names' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dirFromQuery = searchParams.get('dir') || undefined
    const body = await request.clone().json().catch(() => null)
    const dir = (typeof body?.dir === 'string' && body.dir.trim()) ? body.dir.trim() : dirFromQuery

    // Thư mục upload mặc định: /public/uploads[/dir]
    const uploadRoot = join(process.cwd(), 'public', 'uploads')
    const baseDir = dir ? join(uploadRoot, dir) : uploadRoot

    const results: Array<{ name: string; removed: boolean; reason?: string }> = []

    for (const name of names) {
      const filePath = join(baseDir, name)
      try {
        // Kiểm tra tồn tại
        await stat(filePath)
      } catch {
        results.push({ name, removed: false, reason: 'Không tìm thấy file' })
        continue
      }
      try {
        await unlink(filePath)
        results.push({ name, removed: true })
      } catch (e: any) {
        results.push({ name, removed: false, reason: e?.message || 'Xoá thất bại' })
      }
    }

    // (Tuỳ chọn) Xoá metadata DB (không bắt buộc; không fail request nếu xoá DB lỗi)
    const dbInfo = await deleteDbRecordsByFilenames(
      results.filter(r => r.removed).map(r => r.name)
    )

    const removedCount = results.filter(r => r.removed).length
    const notRemoved = results.filter(r => !r.removed)

    const status = removedCount > 0 ? 200 : 404
    return NextResponse.json({
      success: removedCount > 0,
      removedCount,
      notRemoved,
      dbDeleted: dbInfo
    }, { status })
  } catch (error) {
    console.error('DELETE upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove file(s)' },
      { status: 500 }
    )
  }
}
