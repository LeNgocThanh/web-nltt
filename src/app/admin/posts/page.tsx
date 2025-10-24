'use client'

import { useEffect, useMemo, useState, useEffect as ReactUseEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Upload, Calendar, Image as ImageIcon } from 'lucide-react'

interface Post {
  id: string
  title: string
  title_en: string
  slug: string
  content: string
  content_en: string
  excerpt?: string | null
  excerpt_en: string | null
  featuredImage?: string | null
  category: string
  published: boolean
  createdAt: string
  updatedAt: string
}

interface ImageItem {
  id: string
  typeRef: string
  idRef: string
  url: string
  alt: string | null
  sort: number
  createdAt: string
}

type ModalMode = 'create' | 'edit' | 'view'
const POSTS_DIR = 'posts'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Modal
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ModalMode>('view')
  const [current, setCurrent] = useState<Post | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields (create/edit)
  const [fTitle, setFTitle] = useState('')
  const [fTitle_en, setFTitle_en] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fContent, setFContent] = useState('')
  const [fContent_en, setFContent_en] = useState('')
  const [fExcerpt, setFExcerpt] = useState('')
  const [fExcerpt_en, setFExcerpt_en] = useState('')
  const [fCategory, setFCategory] = useState('general')
  const [fPublished, setFPublished] = useState(false)
  const [fFeaturedImage, setFFeaturedImage] = useState('') // preview cover

  // Gallery of current post
  const [imagesLoading, setImagesLoading] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploadCoverBusy, setUploadCoverBusy] = useState(false)
  const [uploadGalleryBusy, setUploadGalleryBusy] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/posts', { cache: 'no-store' })
      const json = await res.json()
      if (!json?.success) {
        setError(json?.message || 'Không tải được bài viết')
        setPosts([])
        return
      }
      const rows = Array.isArray(json.data) ? json.data
        : Array.isArray(json.data?.items) ? json.data.items
        : []
      setPosts(rows)
    } catch {
      setError('Không tải được bài viết')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return posts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.slug?.toLowerCase().includes(term) ?? false)
    )
  }, [posts, searchTerm])

  // ===== Modal open helpers =====
  const openCreate = () => {
    setMode('create')
    setCurrent(null)
    setFTitle('')
    setFTitle_en('')
    setFSlug('')
    setFContent('')
    setFContent_en('')
    setFExcerpt('')
    setFExcerpt_en('')
    setFCategory('general')
    setFPublished(false)
    setFFeaturedImage('')
    setImages([])
    setOpen(true)
  }

  const openView = async (p: Post) => {
    setMode('view')
    setCurrent(p)
    setFFeaturedImage(p.featuredImage ?? '')
    setOpen(true)
    await loadImages(p.id)
  }

  const openEdit = async (p: Post) => {
    setMode('edit')
    setCurrent(p)
    setFTitle(p.title ?? '')
    setFTitle_en(p.title_en ?? '')
    setFSlug(p.slug ?? '')
    setFContent(p.content ?? '')
    setFContent_en(p.content_en ?? '')
    setFExcerpt(p.excerpt ?? '')
    setFExcerpt_en(p.excerpt_en ?? '')
    setFCategory(p.category ?? 'general')
    setFPublished(!!p.published)
    setFFeaturedImage(p.featuredImage ?? '')
    setOpen(true)
    await loadImages(p.id)
  }

  const closeModal = () => {
    setOpen(false)
    setCurrent(null)
    setImages([])
  }

  const loadImages = async (postId: string) => {
    setImagesLoading(true)
    try {
      const r = await fetch(`/api/images?typeRef=Post&idRef=${encodeURIComponent(postId)}&sort=sort&order=asc`, { cache: 'no-store' })
      const j = await r.json()
      setImages(j?.data?.items ?? j?.data ?? [])
    } catch {
      setImages([])
    } finally {
      setImagesLoading(false)
    }
  }

  // ===== Create / Edit Save =====
  const handleSaveCreate = async () => {
    if (!fTitle.trim() || !fSlug.trim() || !fContent.trim()) {
      alert('Cần nhập tối thiểu: Title, Slug, Content')
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fTitle.trim(),
          title_en: fTitle_en.trim(),
          slug: fSlug.trim(),
          content: fContent.trim(),
          content_en: fContent_en.trim(),
          excerpt: fExcerpt.trim() || null,
          excerpt_en: fExcerpt_en.trim() || null,
          category: fCategory.trim() || 'general',
          published: !!fPublished,
          featuredImage: null,
        })
      })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Tạo bài viết thất bại')
        return
      }
      const created: Post = json.data
      setPosts(prev => [created, ...prev])
      // chuyển sang edit để có thể upload ảnh cover + gallery
      await openEdit(created)
    } catch {
      alert('Có lỗi khi tạo bài viết')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!current) return
    if (!fTitle.trim() || !fSlug.trim() || !fContent.trim()) {
      alert('Cần nhập tối thiểu: Title, Slug, Content')
      return
    }
    try {
      setSaving(true)
      const res = await fetch(`/api/posts?id=${encodeURIComponent(current.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fTitle.trim(),
          title_en: fTitle_en.trim(),
          slug: fSlug.trim(),
          content: fContent.trim(),
          content_en: fContent_en.trim(),
          excerpt: fExcerpt.trim() || null,
          excerpt_en: fExcerpt_en.trim() || null,
          category: fCategory.trim() || 'general',
          published: !!fPublished,
          featuredImage: fFeaturedImage || null,
        })
      })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Cập nhật thất bại')
        return
      }
      const updated: Post = json.data
      setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
      setCurrent(updated)
      setFFeaturedImage(updated.featuredImage ?? fFeaturedImage)
      alert('Đã lưu thay đổi.')
    } catch {
      alert('Có lỗi khi lưu cập nhật')
    } finally {
      setSaving(false)
    }
  }

  // ===== Delete post =====
  const handleDeletePost = async (id: string) => {
    const ok = window.confirm('Xoá bài viết này?')
    if (!ok) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Xoá thất bại')
        return
      }
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Có lỗi khi xoá')
    } finally {
      setDeletingId(null)
    }
  }

  // ===== Upload cover (featuredImage) with rollback =====
  const filenameFromUrl = (url: string) => {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      const parts = u.pathname.split('/')
      return parts[parts.length - 1]
    } catch {
      const parts = url.split('?')[0].split('#')[0].split('/')
      return parts[parts.length - 1]
    }
  }

  const handleUploadCover = async (file: File) => {
    if (!current || mode !== 'edit') return
    try {
      setUploadCoverBusy(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('files', file)
      fd.append('dir', POSTS_DIR)

      const upRes = await fetch('/api/upload', { method: 'POST', body: fd }) // bạn có /api/upload hoặc /api/uploads -> chỉnh theo API của bạn
      const upJson = await upRes.json()
      if (!upJson?.success) {
        alert(upJson?.message || 'Upload cover thất bại')
        return
      }
      const url: string | undefined = Array.isArray(upJson?.data?.urls) ? upJson.data.urls[0] : upJson?.data?.url || upJson?.data?.files?.[0]?.url
      if (!url) {
        alert('Không nhận được URL sau upload')
        return
      }

      // commit cover
      const patch = await fetch(`/api/posts?id=${encodeURIComponent(current.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredImage: url })
      })
      const pj = await patch.json()
      if (!pj?.success) {
        // rollback file
        try {
          const name = filenameFromUrl(url)
          await fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(POSTS_DIR)}`, { method: 'DELETE' })
        } catch {}
        alert(pj?.message || 'Cập nhật cover thất bại, đã rollback file.')
        return
      }
      const updated: Post = pj.data
      setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
      setCurrent(updated)
      setFFeaturedImage(updated.featuredImage ?? url)
    } catch {
      alert('Có lỗi khi upload cover')
    } finally {
      setUploadCoverBusy(false)
    }
  }

  // ===== Upload gallery (Image with typeRef='Post') =====
  const handleUploadGallery = async (files: FileList | null) => {
    if (!current || !files || files.length === 0 || mode !== 'edit') return
    try {
      setUploadGalleryBusy(true)
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('files', f))
      fd.append('dir', POSTS_DIR)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const upJson = await upRes.json()
      if (!upJson?.success) {
        alert(upJson?.message || 'Upload ảnh thất bại')
        return
      }
      const urls: string[] = Array.isArray(upJson?.data?.urls) ? upJson.data.urls : []
      if (!urls.length) {
        alert('Không nhận được URLs sau upload')
        return
      }
      // attach metadata
      const imgRes = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeRef: 'Post', idRef: current.id, urls })
      })
      const imgJson = await imgRes.json()
      if (!imgJson?.success) {
        // cleanup uploaded files (best-effort)
        try {
          await Promise.all(urls.map(u => {
            const name = filenameFromUrl(u)
            return fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(POSTS_DIR)}`, { method: 'DELETE' })
          }))
        } catch {}
        alert(imgJson?.message || 'Gắn ảnh thất bại, đã cố gắng dọn file.')
        return
      }
      await loadImages(current.id)
    } catch {
      alert('Có lỗi khi upload gallery')
    } finally {
      setUploadGalleryBusy(false)
    }
  }

  // ===== Delete one image from gallery =====
  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    const ok = window.confirm('Xoá ảnh này?')
    if (!ok) return
    try {
      setDeletingImageId(imageId)
      const delRes = await fetch(`/api/images?id=${encodeURIComponent(imageId)}`, { method: 'DELETE' })
      const delJson = await delRes.json()
      if (!delJson?.success) {
        alert(delJson?.message || 'Xoá ảnh thất bại')
        return
      }
      // best-effort remove physical file
      try {
        const name = filenameFromUrl(imageUrl)
        await fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(POSTS_DIR)}`, { method: 'DELETE' })
      } catch {}
      setImages(prev => prev.filter(i => i.id !== imageId))
    } catch {
      alert('Có lỗi khi xoá ảnh')
    } finally {
      setDeletingImageId(null)
    }
  }

  // ===== Lock background scroll when modal open =====
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  // ===== UI =====
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
          <Button onClick={fetchPosts}>Thử lại</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
              <p className="text-gray-600 mt-1">Tạo, chỉnh sửa và quản lý nội dung blog</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài viết mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Bộ lọc và tìm kiếm</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-4">
          {filtered.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={post.published ? 'default' : 'secondary'}>
                        {post.published ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt="cover"
                          className="w-20 h-14 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No cover
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt || '—'}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div>Slug: <span className="font-mono">{post.slug}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => openView(post)} title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(post)} title="Sửa nhanh">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      title="Xoá"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài viết</h3>
              <p className="text-gray-600 mb-6">Hãy bắt đầu bằng việc tạo bài viết đầu tiên.</p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Tạo bài viết
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === 'create' ? 'Tạo bài viết' : mode === 'edit' ? 'Sửa bài viết' : 'Xem bài viết'}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Nhập thông tin cơ bản' : mode === 'edit' ? 'Cập nhật nội dung & quản lý ảnh' : 'Thông tin bài viết và thư viện ảnh'}
                </p>
              </div>
              {mode === 'view' && current && (
                <Button size="sm" onClick={() => openEdit(current)}>Chuyển sang Sửa</Button>
              )}
            </div>

            {/* Body (scrollable) */}
            <div className="px-6 py-5 overflow-y-auto grow">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tiêu đề *</div>
                  <Input
                    value={mode === 'view' ? (current?.title ?? '') : fTitle}
                    onChange={(e) => setFTitle(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Tiêu đề tiếng Anh *</div>
                  <Input
                    value={mode === 'view' ? (current?.title_en ?? '') : fTitle_en}
                    onChange={(e) => setFTitle_en(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Slug *</div>
                  <Input
                    value={mode === 'view' ? (current?.slug ?? '') : fSlug}
                    onChange={(e) => setFSlug(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Trích đoạn</div>
                  <textarea
                    rows={3}
                    value={mode === 'view' ? (current?.excerpt ?? '') : fExcerpt}
                    onChange={(e) => setFExcerpt(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Trích đoạn tiếng Anh</div>
                  <textarea
                    rows={3}
                    value={mode === 'view' ? (current?.excerpt_en ?? '') : fExcerpt_en}
                    onChange={(e) => setFExcerpt_en(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Content *</div>
                  <textarea
                    rows={8}
                    value={mode === 'view' ? (current?.content ?? '') : fContent}
                    onChange={(e) => setFContent(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Content tiếng Anh*</div>
                  <textarea
                    rows={8}
                    value={mode === 'view' ? (current?.content_en ?? '') : fContent_en}
                    onChange={(e) => setFContent_en(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Category</div>
                  <Input
                    value={mode === 'view' ? (current?.category ?? 'general') : fCategory}
                    onChange={(e) => setFCategory(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Published</div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={mode === 'view' ? !!current?.published : !!fPublished}
                      onChange={(e) => setFPublished(e.target.checked)}
                      disabled={mode === 'view'}
                    />
                    <span>Đã xuất bản</span>
                  </label>
                </div>
              </section>

              {/* Cover */}
              {mode !== 'create' && (
                <section className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Ảnh đại diện (featuredImage)</h3>
                    {mode === 'edit' && (
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span>Upload Cover</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleUploadCover(f)
                            e.currentTarget.value = ''
                          }}
                          disabled={uploadCoverBusy || !current}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {(mode === 'edit' ? fFeaturedImage : current?.featuredImage) ? (
                      <img
                        src={(mode === 'edit' ? fFeaturedImage : (current?.featuredImage ?? '')) as string}
                        alt="cover"
                        className="w-36 h-24 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-36 h-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Chưa có cover
                      </div>
                    )}
                    {uploadCoverBusy && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lên...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Cover được lưu ngay. Nếu PATCH thất bại, tệp đã upload sẽ được xoá (rollback).
                  </p>
                </section>
              )}

              {/* Gallery */}
              {mode !== 'create' && (
                <section className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Thư viện ảnh</h3>
                    {mode === 'edit' && (
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span>Upload ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            handleUploadGallery(e.target.files)
                            e.currentTarget.value = ''
                          }}
                          disabled={uploadGalleryBusy || !current}
                        />
                      </label>
                    )}
                  </div>

                  {imagesLoading ? (
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tải ảnh...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map(img => (
                        <div key={img.id} className="relative group border rounded overflow-hidden">
                          <img src={img.url} alt={img.alt ?? ''} className="w-full h-32 object-cover" />
                          {mode === 'edit' && (
                            <button
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 p-1 rounded shadow"
                              onClick={() => handleDeleteImage(img.id, img.url)}
                              disabled={deletingImageId === img.id}
                              title="Xoá ảnh"
                            >
                              {deletingImageId === img.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                      {images.length === 0 && (
                        <div className="text-sm text-gray-500 col-span-full">Chưa có ảnh.</div>
                      )}
                    </div>
                  )}

                  {uploadGalleryBusy && (
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tải ảnh...
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={closeModal}>Đóng</Button>
              {mode === 'create' && (
                <Button onClick={handleSaveCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Tạo mới
                </Button>
              )}
              {mode === 'edit' && (
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Lưu
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
