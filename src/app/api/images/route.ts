
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Generic Image API (typeRef + idRef)
 * 
 * Expected Prisma model (for reference):
 * 
 * model Image {
 *   id        String   @id @default(cuid())
 *   typeRef   String   // e.g. 'Project' | 'Post' | 'Partner' | 'Contact' ...
 *   idRef     String   // entity id (cuid/uuid)
 *   url       String
 *   alt       String?
 *   sort      Int      @default(0)
 *   createdAt DateTime @default(now())
 * 
 *   @@index([typeRef, idRef])
 *   @@map("images")
 * }
 */

// -------------------- Utilities --------------------

const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

function ok(data: any, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}
function fail(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status })
}

function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

function parseOrder(searchParams: URLSearchParams) {
  const sort = (searchParams.get('sort') || 'sort').toString()
  const order = (searchParams.get('order') || 'asc').toString().toLowerCase() === 'desc' ? 'desc' : 'asc'
  const orderBy: any = {}
  orderBy[sort] = order
  return orderBy
}

function sanitizeUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const clone: any = { ...payload }
  delete clone.id
  delete clone.createdAt
  return clone
}

// -------------------- Schemas --------------------
const ImageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (s) => /^https?:\/\//i.test(s) || s.startsWith('/uploads/'),
    { message: 'image must be http(s) URL or /uploads/... path' }
  )


const CreateManySchema = z.object({
  typeRef: z.string().min(1),
  idRef: z.string().min(1),
  urls: z.array(ImageUrlSchema).min(1),
  // optional parallel arrays for bulk create
  alts: z.array(z.string()).optional(),
})

const PatchSchema = z.object({
  id: z.string().min(1),
  url: z.string().url().optional(),
  alt: ImageUrlSchema.optional().nullable(),
  sort: z.coerce.number().int().optional(),
})

const ReorderSchema = z.object({
  typeRef: z.string().min(1),
  idRef: z.string().min(1),
  orders: z.array(z.object({
    id: z.string().min(1),
    sort: z.coerce.number().int(),
  })).min(1),
})

  const CreateSchema = z.object({
    typeRef: z.string().min(1),
    idRef: z.string().min(1),
    url: ImageUrlSchema,
    alt: z.string().optional().nullable(),
    sort: z.coerce.number().int().optional().default(0),
  })

// -------------------- Routes --------------------

/**
 * GET /api/images
 * Query:
 *  - typeRef: filter (required for typical usage)
 *  - idRef:   filter (optional for listing all of a type)
 *  - q: search alt/url (optional)
 *  - page, limit, sort (default sort), order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeRef = searchParams.get('typeRef') || undefined
    const idRef = searchParams.get('idRef') || undefined
    const q = searchParams.get('q') || undefined

    const { page, limit, skip } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    // Remove explicit type annotation to fix lint error.
    const where: Prisma.ImageWhereInput = {}
    if (typeRef) where.typeRef = typeRef
    if (idRef) where.idRef = idRef
    if (q) {
      where.OR = [
        { alt: { contains: q, } },
        { url: { contains: q, } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.image.findMany({ where, skip, take: limit, orderBy }),
      prisma.image.count({ where })
    ])

    return ok({
      items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
    })
  } catch (e) {
    console.error('GET /api/images error:', e)
    return fail('Failed to fetch images', 500)
  }
}

/**
 * POST /api/images
 * - Create single: { typeRef, idRef, url, alt?, sort? }
 * - Create many:   { typeRef, idRef, urls: string[], alts?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()

    // Bulk path
    if (Array.isArray(raw?.urls)) {
      const parsed = CreateManySchema.parse(raw)

      const existing = await prisma.image.findMany({
        where: {
          typeRef: parsed.typeRef,
          idRef: parsed.idRef,
          url: { in: parsed.urls }
        },
        select: { url: true }
      })
      const existSet = new Set(existing.map(e => e.url))
      const data: Prisma.ImageCreateManyInput[] = parsed.urls
        .filter((u) => !existSet.has(u))
        .map((u, i) => ({
          typeRef: parsed.typeRef,
          idRef: parsed.idRef,
          url: u,
          alt: parsed.alts?.[i] ?? null,
          sort: i,
        }))
      const res = data.length ? await prisma.image.createMany({ data }) : { count: 0 }
      const items = await prisma.image.findMany({
        where: { typeRef: parsed.typeRef, idRef: parsed.idRef },
        orderBy: { sort: 'asc' }
      })
      return ok({ count: res.count, items })
    }

    // Single path
    const data = CreateSchema.parse(raw)
    const created = await prisma.image.create({ data })
    return ok(created)
  } catch (e: any) {
    if (e?.name === 'ZodError') return fail('Invalid payload', 422, { errors: e.errors })
    console.error('POST /api/images error:', e)
    return fail('Failed to create image(s)', 500)
  }
}

/**
 * PATCH /api/images
 * - Update a single image by id (url/alt/sort)
 * - Reorder many by typeRef + idRef: { typeRef, idRef, orders: [{id, sort}, ...] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const raw = await request.json()

    // Reorder many
    if (Array.isArray(raw?.orders)) {
      const parsed = ReorderSchema.parse(raw)
      // apply in transaction
      const tx = parsed.orders.map(o =>
        prisma.image.update({ where: { id: o.id }, data: { sort: o.sort } })
      )
      const updated = await prisma.$transaction(tx)
      return ok({ count: updated.length })
    }

    // Single update
    const parsed = PatchSchema.parse(sanitizeUpdatePayload(raw))
    const updated = await prisma.image.update({
      where: { id: parsed.id },
      data: { url: parsed.url, alt: parsed.alt, sort: parsed.sort }
    })
    return ok(updated)
  } catch (e: any) {
    if (e?.name === 'ZodError') return fail('Invalid payload', 422, { errors: e.errors })
    if (e?.code === 'P2025') return fail('Image not found', 404)
    console.error('PATCH /api/images error:', e)
    return fail('Failed to update image(s)', 500)
  }
}

/**
 * DELETE /api/images
 * - Single: ?id=STRING  (or body.id)
 * - Bulk by ids: { ids: string[] }
 * - Bulk by ref: { typeRef: string, idRef: string }  (delete all images for an entity)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qid = searchParams.get('id')
    const body = await request.clone().json().catch(() => null)

    // Bulk by ids
    if (Array.isArray(body?.ids) && body.ids.length) {
      const ids = body.ids.filter((s: any) => typeof s === 'string' && s.trim())
      if (!ids.length) return fail('Invalid ids', 400)
      const res = await prisma.image.deleteMany({ where: { id: { in: ids } } })
      return ok({ count: res.count })
    }

    // Bulk by ref
    if (isNonEmpty(body?.typeRef) && isNonEmpty(body?.idRef)) {
      const res = await prisma.image.deleteMany({
        where: { typeRef: body.typeRef.trim(), idRef: body.idRef.trim() }
      })
      return ok({ count: res.count })
    }

    // Single by id (query/body)
    const id = isNonEmpty(qid) ? qid : (isNonEmpty(body?.id) ? body.id : '')
    if (!id) return fail('Missing id (?id=... or body.id)', 400)

    const deleted = await prisma.image.delete({ where: { id } })
    return ok(deleted)
  } catch (e: any) {
    if (e?.code === 'P2025') return fail('Image not found', 404)
    console.error('DELETE /api/images error:', e)
    return fail('Failed to delete image(s)', 500)
  }
}
