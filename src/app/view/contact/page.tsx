'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Eye, Trash2, Loader2, Mail, Phone, Building2, Calendar, X
} from 'lucide-react'

type Contact = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  subject?: string | null
  message: string
  status: string // pending | read | replied
  createdAt: string
  updatedAt: string
}

type ModalMode = 'view'

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'Tất cả'|'pending'|'read'|'replied'>('Tất cả')

  const [open, setOpen] = useState(false)
  const [mode] = useState<ModalMode>('view')
  const [current, setCurrent] = useState<Contact | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchContacts() }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError('')
      // Tuỳ API của bạn, nếu có phân trang thì thêm ?page= / ?limit=
      const res = await fetch('/api/contacts', { cache: 'no-store' })
      const json = await res.json()
      if (!json?.success) {
        setError(json?.message || 'Không tải được danh sách liên hệ')
        setItems([])
        return
      }
      const rows: Contact[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.items)
          ? json.data.items
          : []
      setItems(rows)
    } catch {
      setError('Không tải được danh sách liên hệ')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter((c) => {
      const hit =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q) ||
        (c.subject ?? '').toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      const statusOk = status === 'Tất cả' ? true : c.status === status
      return hit && statusOk
    })
  }, [items, search, status])

  const openView = (c: Contact) => {
    setCurrent(c)
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setCurrent(null)
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Xoá liên hệ này?')
    if (!ok) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/contacts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Xoá thất bại')
        return
      }
      setItems(prev => prev.filter(x => x.id !== id))
      if (current?.id === id) closeModal()
    } catch {
      alert('Có lỗi khi xoá')
    } finally {
      setDeletingId(null)
    }
  }

  // Khoá scroll nền khi mở modal
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
    }
    return map[s] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContacts}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý liên hệ</h1>
              <p className="text-gray-600 mt-1">Đọc và xoá các yêu cầu liên hệ từ khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader><CardTitle>Bộ lọc & tìm kiếm</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên, email, chủ đề, nội dung…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="block w-44 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tất cả">Tất cả trạng thái</option>
                  <option value="pending">pending</option>
                  <option value="read">read</option>
                  <option value="replied">replied</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ đề</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{c.name}</div>
                        {c.company && <div className="text-sm text-gray-500">{c.company}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" />{c.email}</span>
                          {c.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" />{c.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="line-clamp-2">{c.subject || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => openView(c)} title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            title="Xoá"
                          >
                            {deletingId === c.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Không có liên hệ nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal View */}
      {open && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold">Chi tiết liên hệ</h2>
                <p className="text-sm text-gray-500">
                  Nhận lúc {new Date(current.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={closeModal} aria-label="Đóng">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Body (scrollable) */}
            <div className="px-6 py-5 overflow-y-auto grow space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Họ và tên</div>
                  <div className="text-sm font-medium">{current.name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm font-medium">{current.email}</div>
                </div>

                {current.phone && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="text-sm font-medium">{current.phone}</div>
                  </div>
                )}

                {current.company && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Công ty</div>
                    <div className="text-sm font-medium">{current.company}</div>
                  </div>
                )}

                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500">Chủ đề</div>
                  <div className="text-sm font-medium">{current.subject || '—'}</div>
                </div>
              </section>

              <section>
                <div className="text-xs text-gray-500 mb-1">Nội dung</div>
                <div className="rounded-md border bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {current.message}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Trạng thái</div>
                  <div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(current.status)}`}>
                      {current.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Tạo lúc</div>
                  <div className="text-sm font-medium">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {new Date(current.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Cập nhật</div>
                  <div className="text-sm font-medium">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {new Date(current.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={closeModal}>Đóng</Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(current.id)}
                disabled={deletingId === current.id}
              >
                {deletingId === current.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Xoá
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
