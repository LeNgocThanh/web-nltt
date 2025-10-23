
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Setting model (for reference)
 * model Setting {
 *   id    String @id @default(cuid())
 *   key   String @unique
 *   value String
 *   type  String @default("string") // string, number, boolean, json
 *   @@map("settings")
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
  const sort = (searchParams.get('sort') || 'key').toString()
  const order = (searchParams.get('order') || 'asc').toString().toLowerCase() === 'desc' ? 'desc' : 'asc'
  const orderBy: any = {}
  orderBy[sort] = order
  return orderBy
}

// Block immutable fields
function sanitizeUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const clone: any = { ...payload }
  delete clone.id
  return clone
}

// Extract unique where (id or key)
async function extractSettingWhere(req: NextRequest): Promise<Prisma.SettingWhereUniqueInput> {
  const { searchParams } = new URL(req.url)
  const qid = searchParams.get('id')
  if (isNonEmpty(qid)) return { id: qid.trim() }
  const qkey = searchParams.get('key')
  if (isNonEmpty(qkey)) return { key: qkey.trim() }

  const body = await req.clone().json().catch(() => null)
  const id = isNonEmpty(body?.id) ? body.id.trim() : ''
  const key = isNonEmpty(body?.key) ? body.key.trim() : ''
  if (id) return { id }
  if (key) return { key }
  throw new Error('MISSING_SELECTOR')
}

// Encode value to string according to type
function encodeValueByType(type: 'string' | 'number' | 'boolean' | 'json', input: unknown): string {
  switch (type) {
    case 'number': {
      const n = typeof input === 'number' ? input : Number(input as any)
      if (!Number.isFinite(n)) throw new Error('INVALID_NUMBER')
      return String(n)
    }
    case 'boolean': {
      const b = typeof input === 'boolean' ? input : String(input).toLowerCase()
      if (typeof b === 'boolean') return b ? 'true' : 'false'
      if (b === 'true' || b === '1' || b === 'yes') return 'true'
      if (b === 'false' || b === '0' || b === 'no') return 'false'
      throw new Error('INVALID_BOOLEAN')
    }
    case 'json': {
      try {
        if (typeof input === 'string') {
          // If it's already a JSON string, ensure it parses then store normalized string
          const parsed = JSON.parse(input)
          return JSON.stringify(parsed)
        }
        return JSON.stringify(input)
      } catch {
        throw new Error('INVALID_JSON')
      }
    }
    case 'string':
    default:
      return typeof input === 'string' ? input : String(input ?? '')
  }
}

// -------------------- Validation Schemas --------------------

const TypeEnum = z.enum(['string', 'number', 'boolean', 'json'])

const CreateSchema = z.object({
  key: z.string().min(1, 'key is required'),
  value: z.any(),
  type: TypeEnum.optional().default('string'),
})

const PutSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  type: TypeEnum.optional().default('string'),
})

const PatchSchema = z.object({
  key: z.string().min(1).optional(),
  value: z.any().optional(),
  type: TypeEnum.optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'PATCH requires at least one field' })

// Normalize payload (turn value into string per type)
function normalizePayload<T extends { value?: any; type?: any; key?: any }>(schema: z.ZodTypeAny, raw: any) {
  const parsed = schema.parse(raw) as { value?: any; type?: 'string'|'number'|'boolean'|'json'; key?: string }
  const type = parsed.type ?? 'string'
  if (typeof parsed.value !== 'undefined') {
    (parsed as any).value = encodeValueByType(type, parsed.value)
  }
  return parsed
}

// -------------------- Routes --------------------

/**
 * GET /api/settings
 * Query:
 *  - q: search in key/value
 *  - type: string|number|boolean|json|'all'
 *  - page, limit
 *  - sort (key|type|createdAt|updatedAt), order (asc|desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || undefined
    const type = searchParams.get('type') || undefined

    const { limit, skip, page } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    const where: any = {}
    if (type && type !== 'all') where.type = type
    if (q) {
      where.OR = [
        { key: { contains: q, mode: 'insensitive' } },
        { value: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.setting.findMany({ where, skip, take: limit, orderBy }),
      prisma.setting.count({ where }),
    ])

    return ok({
      items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    })
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return fail('Failed to fetch settings', 500)
  }
}

/**
 * POST /api/settings
 * Body: { key, value, type }
 * - Enforces unique `key`
 * - Serializes `value` by `type` into string for storage
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = CreateSchema.parse(raw) // { key: string, value: any, type?: 'string'|'number'|'boolean'|'json' }

    const type = parsed.type ?? 'string'
    const data: Prisma.SettingCreateInput = {
      key: parsed.key,
      value: encodeValueByType(type, parsed.value), // ✅ string
      type,                                         // ✅ 'string' | 'number' | 'boolean' | 'json'
    }

    const setting = await prisma.setting.create({ data }) // ✅ TS thỏa mãn
    return ok(setting)
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2002') {
      return fail('Key already exists', 409)
    }
    if (error?.message === 'INVALID_NUMBER') return fail('Invalid number for type=number', 422)
    if (error?.message === 'INVALID_BOOLEAN') return fail('Invalid boolean for type=boolean', 422)
    if (error?.message === 'INVALID_JSON') return fail('Invalid JSON for type=json', 422)

    console.error('POST /api/settings error:', error)
    return fail('Failed to create setting', 500)
  }
}

/**
 * PUT /api/settings?id=STRING | ?key=STRING (or body.id/body.key)
 * Body: { key, value, type }  — full update
 */
export async function PUT(request: NextRequest) {
  try {
    const where = await extractSettingWhere(request)
    const raw = await request.json()
    const data = normalizePayload(PutSchema, sanitizeUpdatePayload(raw))

    const updated = await prisma.setting.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?key=... or body.id/body.key)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Setting not found', 404)
    }
    if (error?.code === 'P2002' || (error instanceof Error && 'code' in error && (error as any).code === 'P2002')) {
      // unique key conflict if you update key to an existing one
      return fail('Key already exists', 409)
    }
    if (error?.message === 'INVALID_NUMBER') return fail('Invalid number for type=number', 422)
    if (error?.message === 'INVALID_BOOLEAN') return fail('Invalid boolean for type=boolean', 422)
    if (error?.message === 'INVALID_JSON') return fail('Invalid JSON for type=json', 422)

    console.error('PUT /api/settings error:', error)
    return fail('Failed to update setting', 500)
  }
}

/**
 * PATCH /api/settings?id=STRING | ?key=STRING (or body.id/body.key)
 * Body: partial update (any subset of key/value/type)
 */
export async function PATCH(request: NextRequest) {
  try {
    const where = await extractSettingWhere(request)
    const raw = await request.json()
    const parsed = PatchSchema.parse(sanitizeUpdatePayload(raw))

    // Chúng ta chỉ cần lấy type hiện có nếu:
    // - client KHÔNG gửi parsed.type
    // - NHƯNG có gửi parsed.value (cần encode theo type)
    let effectiveType = parsed.type as 'string' | 'number' | 'boolean' | 'json' | undefined

    const data: any = { ...parsed }

    if (typeof parsed.value !== 'undefined') {
      if (!effectiveType) {
        // Lấy type hiện có, và NHỚ kiểm tra null để tránh lỗi TS
        const existing = await prisma.setting.findUnique({
          where,
          select: { type: true }
        })
        if (!existing) {
          return fail('Setting not found', 404)
        }
        effectiveType = existing.type as 'string' | 'number' | 'boolean' | 'json';
      }
      if (!effectiveType) {
        return fail('Type is required to encode value', 422)
      }
      data.value = encodeValueByType(effectiveType, parsed.value)
    }

    const updated = await prisma.setting.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?key=... or body.id/body.key)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Setting not found', 404)
    }
    if (error?.code === 'P2002' || (error instanceof Error && 'code' in error && (error as any).code === 'P2002')) {
      return fail('Key already exists', 409)
    }
    if (error?.message === 'INVALID_NUMBER') return fail('Invalid number for type=number', 422)
    if (error?.message === 'INVALID_BOOLEAN') return fail('Invalid boolean for type=boolean', 422)
    if (error?.message === 'INVALID_JSON') return fail('Invalid JSON for type=json', 422)

    console.error('PATCH /api/settings error:', error)
    return fail('Failed to update setting', 500)
  }
}

/**
 * DELETE /api/settings
 * - Single: ?id=STRING | ?key=STRING (or body.id/body.key)
 * - Bulk: body.ids: string[]  OR  body.keys: string[]
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

      const result = await prisma.setting.deleteMany({ where: { id: { in: ids } } })
      return ok({ count: result.count })
    }

    // Bulk by keys[]
    if (Array.isArray(body?.keys) && body.keys.length > 0) {
      const keys = (body.keys as any[])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => !!v)

      if (keys.length === 0) return fail('Invalid keys list', 400)

      const result = await prisma.setting.deleteMany({ where: { key: { in: keys } } })
      return ok({ count: result.count })
    }

    // Single by id or key
    const where = await extractSettingWhere(request)
    const deleted = await prisma.setting.delete({ where })
    return ok(deleted)
  } catch (error: any) {
    if (error?.message === 'MISSING_SELECTOR') {
      return fail('Missing identifier (?id=... or ?key=... or body.id/body.key)', 400)
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Setting not found', 404)
    }
    console.error('DELETE /api/settings error:', error)
    return fail('Failed to delete setting', 500)
  }
}
