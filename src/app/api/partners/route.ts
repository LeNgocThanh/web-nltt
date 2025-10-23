
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Partner model (for reference)
 * model Partner {
 *   id          String   @id @default(cuid())
 *   name        String
 *   description String?
 *   logo        String?
 *   website     String?
 *   category    String?
 *   country     String?
 *   partnership String?
 *   projects    Int      @default(0)
 *   established String?
 *   status      String   @default("active")
 *   priority    Int      @default(0)
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 *   @@map("partners")
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

// Extract where by id only (cuid string)
async function extractPartnerWhere(req: NextRequest): Promise<Prisma.PartnerWhereUniqueInput> {
  const { searchParams } = new URL(req.url)
  const qid = searchParams.get('id')
  if (isNonEmpty(qid)) return { id: qid.trim() }

  const body = await req.clone().json().catch(() => null)
  const id = isNonEmpty(body?.id) ? body.id.trim() : ''
  if (id) return { id }
  throw new Error('MISSING_ID')
}

// -------------------- Validation Schemas --------------------

const urlString = z.string().url()

const CreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional().nullable(),
  logo: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  website: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  category: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  partnership: z.string().optional().nullable(),
  projects: z.coerce.number().int().min(0).optional().default(0),
  established: z.string().optional().nullable(), // e.g., "1998" or "Q2-2010"
  status: z.string().optional().default('active'),
  priority: z.coerce.number().int().optional().default(0),
})

const PutSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  logo: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  website: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  category: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  partnership: z.string().optional().nullable(),
  projects: z.coerce.number().int().min(0).optional().default(0),
  established: z.string().optional().nullable(),
  status: z.string().optional().default('active'),
  priority: z.coerce.number().int().optional().default(0),
})

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  logo: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  website: urlString.optional().nullable().or(z.literal('').transform(() => undefined)),
  category: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  partnership: z.string().optional().nullable(),
  projects: z.coerce.number().int().min(0).optional(),
  established: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.coerce.number().int().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'PATCH requires at least one field' })

// -------------------- Routes --------------------

/**
 * GET /api/partners
 * Query:
 *  - q: search in name/description/website/category/country/partnership/established
 *  - category: exact match | 'all'
 *  - country: exact match | 'all'
 *  - status: exact match | 'all'
 *  - page, limit
 *  - sort, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || undefined
    const category = searchParams.get('category') || undefined
    const country = searchParams.get('country') || undefined
    const status = searchParams.get('status') || undefined

    const { limit, skip, page } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    const where: any = {}
    if (category && category !== 'all') where.category = category
    if (country && country !== 'all') where.country = country
    if (status && status !== 'all') where.status = status
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { website: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { partnership: { contains: q, mode: 'insensitive' } },
        { established: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.partner.findMany({ where, skip, take: limit, orderBy }),
      prisma.partner.count({ where }),
    ])

    return ok({
      items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    })
  } catch (error) {
    console.error('GET /api/partners error:', error)
    return fail('Failed to fetch partners', 500)
  }
}

/**
 * POST /api/partners
 * Body: CreateSchema
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const data = CreateSchema.parse(raw)
    const partner = await prisma.partner.create({ data })
    return ok(partner)
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    console.error('POST /api/partners error:', error)
    return fail('Failed to create partner', 500)
  }
}

/**
 * PUT /api/partners?id=STRING (or body.id)
 * Body: PutSchema
 */
export async function PUT(request: NextRequest) {
  try {
    const where = await extractPartnerWhere(request)
    const raw = await request.json()
    const data = PutSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.partner.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Partner not found', 404)
    }
    console.error('PUT /api/partners error:', error)
    return fail('Failed to update partner', 500)
  }
}

/**
 * PATCH /api/partners?id=STRING (or body.id)
 * Body: PatchSchema
 */
export async function PATCH(request: NextRequest) {
  try {
    const where = await extractPartnerWhere(request)
    const raw = await request.json()
    const data = PatchSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.partner.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Partner not found', 404)
    }
    console.error('PATCH /api/partners error:', error)
    return fail('Failed to update partner', 500)
  }
}

/**
 * DELETE /api/partners
 * - Single: ?id=STRING (or body.id)
 * - Bulk: body.ids: string[]
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

      const result = await prisma.partner.deleteMany({ where: { id: { in: ids } } })
      return ok({ count: result.count })
    }

    // Single by id
    const where = await extractPartnerWhere(request)
    const deleted = await prisma.partner.delete({ where })
    return ok(deleted)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Partner not found', 404)
    }
    console.error('DELETE /api/partners error:', error)
    return fail('Failed to delete partner', 500)
  }
}
