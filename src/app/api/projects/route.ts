
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Project model (for reference)
 * model Project {
 *   id          String   @id @default(cuid())
 *   title       String
 *   description String
 *   image       String?
 *   category    String
 *   capacity    String?
 *   location    String?
 *   status      String   @default("completed") // planned, in-progress, completed
 *   priority    Int      @default(0)
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 *   @@map("projects")
 * }
 */

// -------------------- Utilities --------------------

function ok(data: any, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}
function fail(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status })
}

// GET /api/projects helpers
function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

function parseOrder(searchParams: URLSearchParams) {
  const sort = (searchParams.get('sort') || 'createdAt').toString()
  const order = (searchParams.get('order') || 'desc').toString().toLowerCase() === 'asc' ? 'asc' : 'desc'
  const orderBy: any = {}
  orderBy[sort] = order
  return orderBy
}

// Sanitize payload (block immutable fields)
function sanitizeUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const clone: any = { ...payload }
  delete clone.id
  delete clone.createdAt
  delete clone.updatedAt
  return clone
}

// Extract id from ?id=... or body.id (string cuid)
async function extractStringId(req: NextRequest): Promise<string> {
  const { searchParams } = new URL(req.url)
  const qid = searchParams.get('id')
  if (qid && typeof qid === 'string' && qid.trim()) return qid.trim()

  const body = await req.clone().json().catch(() => null)
  const id = body?.id
  if (typeof id === 'string' && id.trim()) return id.trim()

  throw new Error('MISSING_ID')
}

// -------------------- Validation Schemas --------------------

const CreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  category: z.string().min(1, 'category is required'),
  image: z.string().url().optional().nullable().or(z.literal('').transform(() => undefined)),
  capacity: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.string().optional().default('completed'),
  priority: z.coerce.number().int().optional().default(0),
})

const PutSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  image: z.string().url().optional().nullable().or(z.literal('').transform(() => undefined)),
  capacity: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.string().optional().default('completed'),
  priority: z.coerce.number().int().optional().default(0),
})

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  image: z.string().url().optional().nullable().or(z.literal('').transform(() => undefined)),
  capacity: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.coerce.number().int().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'PATCH requires at least one field' })

const ImageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (s) => /^https?:\/\//i.test(s) || s.startsWith('/uploads/'),
    { message: 'image must be http(s) URL or /uploads/... path' }
  )

// Schema cho POST (tạo mới) — đầy đủ & required
const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  capacity: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.string().default('completed'),
  priority: z.coerce.number().int().default(0),
  image: ImageUrlSchema.optional().nullable(), // có thể bỏ qua hoặc null
}).strict()

// Schema cho PATCH (cập nhật) — tất cả optional
const UpdateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  capacity: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.coerce.number().int().optional(),
  image: z.union([ImageUrlSchema, z.null()]).optional(), // cho phép null để xoá cover
}).strict()

// -------------------- Routes --------------------

/**
 * GET /api/projects
 * Query:
 *  - q: search by title/description (contains, case-insensitive)
 *  - category: exact match (optional)
 *  - status: exact match (optional)
 *  - page, limit: pagination
 *  - sort: any field (default createdAt), order: asc|desc
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined

    const { limit, skip, page } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    const where: any = {}
    if (category && category !== 'all') where.category = category
    if (status && status !== 'all') where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.project.count({ where }),
    ])

    return ok({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return fail('Failed to fetch projects', 500)
  }
}

/**
 * POST /api/projects
 * Body: CreateSchema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateProjectSchema.parse(body)

    const project = await prisma.project.create({ data })

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    console.error('POST /api/projects error:', error)
    return fail('Failed to create project', 500)
  }
}

/**
 * PUT /api/projects?id=STRING or body.id
 * Body: PutSchema (full replacement semantics for mutable fields)
 */
export async function PUT(request: NextRequest) {
  try {
    const id = await extractStringId(request)
    const raw = await request.json()
    const data = PutSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.project.update({
      where: { id },
      data,
    })

    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return fail('Project not found', 404)
    }
    console.error('PUT /api/projects error:', error)
    return fail('Failed to update project', 500)
  }
}

/**
 * PATCH /api/projects?id=STRING or body.id
 * Body: PatchSchema (partial update)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing ?id' }, { status: 400 })
    }

    const body = await request.json()
    const data = UpdateProjectSchema.parse(body)

    // Tránh gửi field undefined
    const clean: Record<string, any> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) clean[k] = v
    }

    const updated = await prisma.project.update({
      where: { id },
      data: clean,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ success: false, message: 'Invalid payload', errors: error.errors }, { status: 422 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 })
  }
}

/**
 * DELETE /api/projects
 * - Single: ?id=STRING or body.id
 * - Bulk: body.ids: string[]
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.clone().json().catch(() => null)

    // Bulk delete by ids[]
    if (Array.isArray(body?.ids) && body.ids.length > 0) {
      const ids = (body.ids as any[])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => !!v)

      if (ids.length === 0) {
        return fail('Invalid ids list', 400)
      }

      const result = await prisma.project.deleteMany({
        where: { id: { in: ids } },
      })

      return ok({ count: result.count })
    }

    // Single delete by id
    const id = await extractStringId(request)
    const deleted = await prisma.project.delete({ where: { id } })
    return ok(deleted)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return fail('Project not found', 404)
    }
    console.error('DELETE /api/projects error:', error)
    return fail('Failed to delete project', 500)
  }
}
