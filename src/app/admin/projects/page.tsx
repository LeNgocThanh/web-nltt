'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart3, Plus, Search, Edit, Trash2, Eye, Loader2, Upload } from 'lucide-react'

interface Project {
  id: string
  title: string
  title_en: string
  description: string
  description_en: string
  image?: string | null
  category: string  
  capacity?: string | null
  location?: string | null
  location_en?: string | null
  status: string
  priority: number
  createdAt: string
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
const PROJECTS_DIR = 'projects'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Modal state (create/edit/view)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<ModalMode>('view')
  const [current, setCurrent] = useState<Project | null>(null)

  // Form fields (used in create/edit)
  const [fTitle, setFTitle] = useState('')
  const [fTitle_en, setFTitle_en] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fDescription_en, setFDescription_en] = useState('')
  const [fImage, setFImage] = useState('') // cover preview (edit only)
  const [fCategory, setFCategory] = useState('solar')  
  const [fCapacity, setFCapacity] = useState('')
  const [fLocation, setFLocation] = useState('')
  const [fLocation_en, setFLocation_en] = useState('')
  const [fStatus, setFStatus] = useState('completed')
  const [fPriority, setFPriority] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  // Images for current project (edit/view)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploadCoverBusy, setUploadCoverBusy] = useState(false)
  const [uploadGalleryBusy, setUploadGalleryBusy] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const json = await res.json()
      if (!json?.success) {
        setError(json?.message || 'Failed to load projects')
        setProjects([])
        return
      }
      const rows = Array.isArray(json.data) ? json.data
        : Array.isArray(json.data?.items) ? json.data.items
        : []
      setProjects(rows)
    } catch {
      setError('Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(
    () => ['Tất cả', 'solar', 'wind', 'hydro', 'hybrid', 'biomass'],
    []
  )

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return projects.filter(p =>
      (selectedCategory === 'Tất cả' || p.category === selectedCategory) &&
      (
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.location?.toLowerCase().includes(term) ?? false)
      )
    )
  }, [projects, searchTerm, selectedCategory])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành'
      case 'in-progress': return 'Đang thi công'
      case 'planned': return 'Dự kiến'
      default: return status
    }
  }

  // utils
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

  // ===== List actions =====
  const openCreateModal = () => {
    setMode('create')
    setCurrent(null)
    setFTitle('')
    setFTitle_en('')
    setFDescription('')
    setFDescription_en('')
    setFCategory('solar')
    setFCapacity('')
    setFLocation('')
    setFLocation_en('')
    setFStatus('completed')
    setFPriority(0)
    setFImage('') // cover not used in create
    setImages([]) // not used in create
    setModalOpen(true)
  }

  const openViewModal = async (p: Project) => {
    setMode('view')
    setCurrent(p)
    setFImage(p.image ?? '')
    setModalOpen(true)
    // load images
    setImagesLoading(true)
    try {
      const r = await fetch(`/api/images?typeRef=Project&idRef=${encodeURIComponent(p.id)}&sort=sort&order=asc`, { cache: 'no-store' })
      const j = await r.json()
      setImages(j?.data?.items ?? j?.data ?? [])
    } catch {
      setImages([])
    } finally {
      setImagesLoading(false)
    }
  }

  const openEditModal = async (p: Project) => {
    setMode('edit')
    setCurrent(p)
    setFTitle(p.title ?? '')
    setFTitle_en(p.title_en ?? '')
    setFDescription(p.description ?? '')
    setFDescription_en(p.description_en ?? '')
    setFImage(p.image ?? '')
    setFCategory(p.category ?? 'solar')
    setFCapacity(p.capacity ?? '')
    setFLocation(p.location ?? '')
    setFLocation_en(p.location_en ?? '')
    setFStatus(p.status ?? 'completed')
    setFPriority(Number.isFinite(p.priority) ? p.priority : 0)
    setModalOpen(true)
    // load images
    setImagesLoading(true)
    try {
      const r = await fetch(`/api/images?typeRef=Project&idRef=${encodeURIComponent(p.id)}&sort=sort&order=asc`, { cache: 'no-store' })
      const j = await r.json()
      setImages(j?.data?.items ?? j?.data ?? [])
    } catch {
      setImages([])
    } finally {
      setImagesLoading(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrent(null)
    setImages([])
  }

  const handleDeleteProject = async (id: string) => {
    const ok = window.confirm('Bạn chắc chắn muốn xoá dự án này?')
    if (!ok) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Xoá thất bại')
        return
      }
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Có lỗi khi xoá dự án')
    } finally {
      setDeletingId(null)
    }
  }

  // ===== Create / Edit Save =====
  const handleSaveCreate = async () => {
    if (!fTitle.trim() || !fDescription.trim() || !fCategory.trim()) {
      alert('Vui lòng điền tối thiểu: Tiêu đề, Mô tả, Phân loại.')
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fTitle.trim(),
          title_en: fTitle_en.trim(),
          description: fDescription.trim(),
          description_en: fDescription_en.trim(),
          category: fCategory.trim(),
          capacity: fCapacity.trim() || null,
          location: fLocation.trim() || null,
          location_en: fLocation_en.trim() || null,
          status: fStatus.trim() || 'completed',
          priority: Number.isFinite(Number(fPriority)) ? Number(fPriority) : 0
        })
      })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Tạo mới thất bại')
        return
      }
      const created: Project = json.data
      // thêm vào danh sách và chuyển thẳng sang edit modal để có thể upload ảnh
      setProjects(prev => [created, ...prev])
      await openEditModal(created)
    } catch {
      alert('Có lỗi khi tạo mới')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!current) return
    if (!fTitle.trim() || !fDescription.trim() || !fCategory.trim() || !fTitle_en.trim() || !fDescription_en.trim()) {
      alert('Vui lòng điền tối thiểu: Tiêu đề, Mô tả, Phân loại.')
      return
    }
    try {
      setSaving(true)
      const res = await fetch(`/api/projects?id=${encodeURIComponent(current.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fTitle.trim(),
          title_en: fTitle_en.trim(),
          description: fDescription.trim(),
          description_en: fDescription.trim(),
          category: fCategory.trim(),
          image: fImage || null,
          capacity: fCapacity.trim() || null,
          location: fLocation.trim() || null,
          location_en: fLocation.trim() || null,
          status: fStatus.trim() || 'completed',
          priority: Number.isFinite(Number(fPriority)) ? Number(fPriority) : 0
        })
      })
      const json = await res.json()
      if (!json?.success) {
        alert(json?.message || 'Cập nhật thất bại')
        return
      }
      const updated: Project = json.data
      setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
      // giữ nguyên modal mở để tiếp tục quản lý ảnh
      setCurrent(updated)
      setFImage(updated.image ?? fImage)
      alert('Đã lưu thay đổi.')
    } catch {
      alert('Có lỗi khi lưu cập nhật')
    } finally {
      setSaving(false)
    }
  }

  // ===== Cover upload (edit only) with rollback =====
  const handleUploadCover = async (file: File) => {
    if (!current || mode !== 'edit') return
    try {
      setUploadCoverBusy(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('files', file)
      fd.append('dir', PROJECTS_DIR)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const upJson = await upRes.json()
      if (!upJson?.success) {
        alert(upJson?.message || 'Upload cover thất bại')
        return
      }
      const url: string | undefined = Array.isArray(upJson?.data?.urls) ? upJson.data.urls[0] : upJson?.data?.url || upJson?.data?.files?.[0]?.url
      if (!url) {
        alert('Không nhận được URL ảnh sau upload')
        return
      }

      console.log('url',url)  

      // commit: PATCH project.image
      const patchRes = await fetch(`/api/projects?id=${encodeURIComponent(current.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url })
      })
      const patchJson = await patchRes.json()
      if (!patchJson?.success) {
        // rollback file
        try {
          const name = filenameFromUrl(url)
          await fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(PROJECTS_DIR)}`, { method: 'DELETE' })
        } catch {}
        alert(patchJson?.message || 'Cập nhật cover thất bại, đã rollback file.')
        return
      }
      const updated: Project = patchJson.data
      setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
      setCurrent(updated)
      setFImage(updated.image ?? url)
    } catch {
      alert('Có lỗi khi upload cover')
    } finally {
      setUploadCoverBusy(false)
    }
  }

  // ===== Gallery upload (edit only) =====
  const handleUploadGallery = async (files: FileList | null) => {
    if (!current || !files || files.length === 0 || mode !== 'edit') return
    try {
      setUploadGalleryBusy(true)
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('files', f))
      fd.append('dir', PROJECTS_DIR)
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
      // attach to Image
      const imgRes = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeRef: 'Project', idRef: current.id, urls })
      })
      const imgJson = await imgRes.json()
      if (!imgJson?.success) {
        // cleanup files best-effort
        try {
          await Promise.all(urls.map(u => {
            const name = filenameFromUrl(u)
            return fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(PROJECTS_DIR)}`, { method: 'DELETE' })
          }))
        } catch {}
        alert(imgJson?.message || 'Gắn ảnh thất bại, đã cố gắng dọn file.')
        return
      }
      // refresh list
      const listRes = await fetch(`/api/images?typeRef=Project&idRef=${encodeURIComponent(current.id)}&sort=sort&order=asc`, { cache: 'no-store' })
      const listJson = await listRes.json()
      setImages(listJson?.data?.items ?? listJson?.data ?? [])
    } catch {
      alert('Có lỗi khi upload gallery')
    } finally {
      setUploadGalleryBusy(false)
    }
  }

  // ===== Delete 1 image from gallery =====
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
      // physical delete (best-effort)
      try {
        const name = filenameFromUrl(imageUrl)
        await fetch(`/api/upload?name=${encodeURIComponent(name)}&dir=${encodeURIComponent(PROJECTS_DIR)}`, { method: 'DELETE' })
      } catch {}
      setImages(prev => prev.filter(i => i.id !== imageId))
    } catch {
      alert('Có lỗi khi xoá ảnh')
    } finally {
      setDeletingImageId(null)
    }
  }

  // ===== Render =====
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
          <Button onClick={fetchProjects}>Thử lại</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý dự án</h1>
              <p className="text-gray-600 mt-1">Quản lý các dự án năng lượng tái tạo</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">Quay lại</Button>
              </Link>
              <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm dự án
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng dự án</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang thi công</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dự kiến</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'planned').length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Bộ lọc và tìm kiếm</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm dự án..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <Badge variant="outline">{project.category}</Badge>
                      {project.capacity && <Badge variant="outline">{project.capacity}</Badge>}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt="cover"
                          className="w-20 h-14 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No cover
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div><span className="font-medium">Địa điểm:</span> {project.location || 'N/A'}</div>
                      <div><span className="font-medium">Ưu tiên:</span> {project.priority}</div>
                      <div><span className="font-medium">Tạo ngày:</span> {new Date(project.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* VIEW modal */}
                    <Button variant="outline" size="sm" onClick={() => openViewModal(project)} title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {/* EDIT modal */}
                    <Button variant="outline" size="sm" onClick={() => openEditModal(project)} title="Sửa nhanh">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {/* DELETE */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingId === project.id}
                      title="Xoá"
                    >
                      {deletingId === project.id ? (
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

        {/* Empty */}
        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy dự án</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Không có dự án nào phù hợp với từ khoá.' : 'Chưa có dự án nào.'}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" /> Thêm dự án đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ===== Modal (custom) ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 mx-auto mt-10 w-full max-w-5xl rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === 'create' && 'Thêm dự án'}
                  {mode === 'edit' && 'Sửa dự án'}
                  {mode === 'view' && 'Xem dự án'}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === 'create' && 'Nhập thông tin cơ bản, lưu để tạo ID rồi mới có thể upload ảnh.'}
                  {mode === 'edit' && 'Cập nhật thông tin và quản lý ảnh.'}
                  {mode === 'view' && 'Thông tin dự án và thư viện ảnh (chỉ đọc).'}
                </p>
              </div>
              {mode === 'view' && current && (
                <Button size="sm" onClick={() => openEditModal(current)}>
                  Chuyển sang Sửa
                </Button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-8 max-h-[80vh] overflow-auto">
              {/* Basic fields */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tiêu đề *</div>
                  <Input
                    value={mode === 'view' ? (current?.title ?? '') : fTitle}
                    onChange={e => setFTitle(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Tiêu đề tiếng Anh*</div>
                  <Input
                    value={mode === 'view' ? (current?.title_en ?? '') : fTitle_en}
                    onChange={e => setFTitle_en(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Phân loại *</div>
                  <select
                    value={mode === 'view' ? (current?.category ?? 'solar') : fCategory}
                    onChange={e => setFCategory(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  >
                    <option value="solar">solar</option>
                    <option value="wind">wind</option>
                    <option value="hydro">hydro</option>
                    <option value="hybrid">hybrid</option>
                    <option value="biomass">biomass</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Mô tả *</div>
                  <textarea
                    rows={4}
                    value={mode === 'view' ? (current?.description ?? '') : fDescription}
                    onChange={e => setFDescription(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm font-medium">Mô tả tiếng Anh*</div>
                  <textarea
                    rows={4}
                    value={mode === 'view' ? (current?.description_en ?? '') : fDescription_en}
                    onChange={e => setFDescription_en(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Công suất</div>
                  <Input
                    value={mode === 'view' ? (current?.capacity ?? '') : fCapacity}
                    onChange={e => setFCapacity(e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="50MW"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Địa điểm</div>
                  <Input
                    value={mode === 'view' ? (current?.location ?? '') : fLocation}
                    onChange={e => setFLocation(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Địa điểm tiếng Anh</div>
                  <Input
                    value={mode === 'view' ? (current?.location_en ?? '') : fLocation_en}
                    onChange={e => setFLocation_en(e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Trạng thái</div>
                  <select
                    value={mode === 'view' ? (current?.status ?? 'completed') : fStatus}
                    onChange={e => setFStatus(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={mode === 'view'}
                  >
                    <option value="planned">planned</option>
                    <option value="in-progress">in-progress</option>
                    <option value="completed">completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Ưu tiên</div>
                  <Input
                    type="number"
                    value={String(mode === 'view' ? (current?.priority ?? 0) : fPriority)}
                    onChange={e => setFPriority(parseInt(e.target.value || '0', 10))}
                    disabled={mode === 'view'}
                  />
                </div>
              </section>

              {/* Cover (edit/view) */}
              {mode !== 'create' && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Ảnh đại diện (Cover)</h3>
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
                    {(mode === 'edit' ? fImage : current?.image) ? (
                      <img
                        src={(mode === 'edit' ? fImage : (current?.image ?? '')) as string}
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
                    * Ảnh cover được lưu **ngay lập tức**. Nếu lưu thất bại, tệp đã upload sẽ được xoá (rollback).
                  </p>
                </section>
              )}

              {/* Gallery (edit/view) */}
              {mode !== 'create' && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Thư viện ảnh</h3>
                    {mode === 'edit' && (
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span>Upload ảnh khác</span>
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
            <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
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
