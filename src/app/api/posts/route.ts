
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Post model (for reference)
 * model Post {
 *   id            String   @id @default(cuid())
 *   title         String
 *   slug          String   @unique
 *   content       String
 *   excerpt       String?
 *   featuredImage String?
 *   category      String   @default("general")
 *   published     Boolean  @default(false)
 *   createdAt     DateTime @default(now())
 *   updatedAt     DateTime @updatedAt
 *   @@map("posts")
 * }
 */

// -------------------- Utilities --------------------

function ok(data: any, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}
function fail(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status })
}

// Pagination & sorting helpers
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

// Block immutable fields
function sanitizeUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const clone: any = { ...payload }
  delete clone.id
  delete clone.createdAt
  delete clone.updatedAt
  return clone
}

// Extract unique selector: prefer id, fall back to slug
async function extractSelector(req: NextRequest): Promise<{ id?: string; slug?: string }> {
  const { searchParams } = new URL(req.url)
  const qid = searchParams.get('id')
  if (qid && typeof qid === 'string' && qid.trim()) return { id: qid.trim() }

  const qslug = searchParams.get('slug')
  if (qslug && typeof qslug === 'string' && qslug.trim()) return { slug: qslug.trim() }

  const body = await req.clone().json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  if (id) return { id }
  if (slug) return { slug }
  throw new Error('MISSING_SELECTOR')
}

const ImageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (s) => /^https?:\/\//i.test(s) || s.startsWith('/uploads/'),
    { message: 'image must be http(s) URL or /uploads/... path' }
  )

// -------------------- Validation Schemas --------------------

const CreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  slug: z.string().min(1, 'slug is required'),
  content: z.string().min(1, 'content is required'),
  excerpt: z.string().optional().nullable(),
  featuredImage: ImageUrlSchema.optional().nullable(),
  category: z.string().optional().default('general'),
  published: z.coerce.boolean().optional().default(false),
})

const PutSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  featuredImage: ImageUrlSchema.optional().nullable(),
  category: z.string().optional().default('general'),
  published: z.coerce.boolean().optional().default(false),
})

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  featuredImage: ImageUrlSchema.optional().nullable(),
  category: z.string().optional(),
  published: z.coerce.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'PATCH requires at least one field' })

// -------------------- Routes --------------------

/**
 * GET /api/posts
 * Query:
 *  - q: search in title/content/excerpt/category/slug
 *  - category: exact match (optional; 'all' to ignore)
 *  - published: 'true' | 'false' | 'all' (default 'all')
 *  - page, limit
 *  - sort, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const published = (searchParams.get('published') || 'all').toLowerCase()
    const q = searchParams.get('q') || undefined

    const { limit, skip, page } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    const where: any = {}
    if (category && category !== 'all') where.category = category
    if (published === 'true') where.published = true
    if (published === 'false') where.published = false
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.post.count({ where }),
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
    console.error('GET /api/posts error:', error)
    return fail('Failed to fetch posts', 500)
  }
}

/**
 * POST /api/posts
 * Body: CreateSchema
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const data = CreateSchema.parse(raw)

    const post = await prisma.post.create({ data })

    return ok(post)
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // unique constraint failed (likely slug)
      return fail('Slug already exists', 409)
    }
    console.error('POST /api/posts error:', error)
    return fail('Failed to create post', 500)
  }
}

/**
 * PUT /api/posts?id=STRING | ?slug=STRING  (or body.id/body.slug)
 * Body: PutSchema
 */
export async function PUT(request: NextRequest) {
  try {
    const where = await extractPostWhere(request)
    const raw = await request.json()
    const data = PutSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.post.update({ where, data })

    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?slug=... or body.id/body.slug)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return fail('Post not found', 404)
      if (error.code === 'P2002') return fail('Slug already exists', 409)
    }
    console.error('PUT /api/posts error:', error)
    return fail('Failed to update post', 500)
  }
}

/**
 * PATCH /api/posts?id=STRING | ?slug=STRING  (or body.id/body.slug)
 * Body: PatchSchema
 */
export async function PATCH(request: NextRequest) {
  try {
    const where = await extractPostWhere(request)
    const raw = await request.json()
    const data = PatchSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.post.update({ where, data })

    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?slug=... or body.id/body.slug)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return fail('Post not found', 404)
      if (error.code === 'P2002') return fail('Slug already exists', 409)
    }
    console.error('PATCH /api/posts error:', error)
    return fail('Failed to update post', 500)
  }
}

/**
 * DELETE /api/posts
 * - Single: ?id=STRING | ?slug=STRING (or body.id/body.slug)
 * - Bulk: body.ids: string[]  OR  body.slugs: string[]
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.clone().json().catch(() => null)

    // Bulk by ids[]
    if (Array.isArray(body?.ids) && body.ids.length > 0) {
      const ids = (body.ids as any[])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => !!v)

      if (ids.length === 0) return fail('Invalid ids list', 400)

      const result = await prisma.post.deleteMany({ where: { id: { in: ids } } })
      return ok({ count: result.count })
    }

    // Bulk by slugs[]
    if (Array.isArray(body?.slugs) && body.slugs.length > 0) {
      const slugs = (body.slugs as any[])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => !!v)

      if (slugs.length === 0) return fail('Invalid slugs list', 400)

      const result = await prisma.post.deleteMany({ where: { slug: { in: slugs } } })
      return ok({ count: result.count })
    }

    // Single by id or slug
    const where = await extractPostWhere(request)
    const deleted = await prisma.post.delete({ where })
    return ok(deleted)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?slug=... or body.id/body.slug)', 400)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return fail('Post not found', 404)
    }
    console.error('DELETE /api/posts error:', error)
    return fail('Failed to delete post', 500)
  }
}
const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

async function extractPostWhere(req: NextRequest): Promise<Prisma.PostWhereUniqueInput> {
  const { searchParams } = new URL(req.url)

  const qid = searchParams.get('id')
  if (isNonEmpty(qid)) return { id: qid.trim() }

  const qslug = searchParams.get('slug')
  if (isNonEmpty(qslug)) return { slug: qslug.trim() }

  // Nếu không có trên query, thử body
  const body = await req.clone().json().catch(() => null)

  if (isNonEmpty(body?.id))   return { id: body.id.trim() }
  if (isNonEmpty(body?.slug)) return { slug: body.slug.trim() }

  throw new Error('MISSING_SELECTOR')
}