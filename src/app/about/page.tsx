'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Leaf, Wind, Droplets, Battery, Wrench, ArrowRight, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  image?: string
  category: string
  capacity?: string
  location?: string
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

export default function AboutPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // modal state
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Project | null>(null)
  const [imgs, setImgs] = useState<ImageItem[]>([])
  const [imgLoading, setImgLoading] = useState(false)
  const [imgError, setImgError] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects', { cache: 'no-store' })
      const data = await response.json()
      if (data?.success) {
        const rows = Array.isArray(data.data?.items) ? data.data.items : Array.isArray(data.data) ? data.data : []
        setProjects(rows)
      } else {
        setError('Failed to load projects')
      }
    } catch {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // modal helpers
  const openModal = async (p: Project) => {
    setCurrent(p)
    setOpen(true)
    setImgError('')
    setIdx(0)
    setImgLoading(true)
    try {
      const r = await fetch(`/api/images?typeRef=Project&idRef=${encodeURIComponent(p.id)}&sort=sort&order=asc`, { cache: 'no-store' })
      const j = await r.json()
      const list: ImageItem[] = j?.success ? (j.data?.items ?? j.data ?? []) : []
      setImgs(list)
    } catch {
      setImgs([])
      setImgError('Không tải được ảnh')
    } finally {
      setImgLoading(false)
    }
  }
  const closeModal = () => {
    setOpen(false)
    setCurrent(null)
    setImgs([])
    setIdx(0)
  }

  // slide sources (cover + gallery, loại trùng)
  const slides = useMemo(() => {
    const s: { url: string; alt?: string }[] = []
    if (current?.image) s.push({ url: current.image, alt: 'Cover' })
    for (const it of imgs) if (!s.find(x => x.url === it.url)) s.push({ url: it.url, alt: it.alt ?? undefined })
    return s
  }, [current, imgs])

  const canPrev = slides.length > 1
  const canNext = slides.length > 1
  const goPrev = useCallback(() => setIdx(i => (slides.length ? (i - 1 + slides.length) % slides.length : 0)), [slides.length])
  const goNext = useCallback(() => setIdx(i => (slides.length ? (i + 1) % slides.length : 0)), [slides.length])

  // keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, goPrev, goNext])

  const getBadge = (status: string) =>
    status === 'completed' ? 'Đã hoàn thành' : status === 'in-progress' ? 'Đang thi công' : 'Dự kiến'

  const capabilities = [
    { icon: Zap, title: 'Điện Mặt Trời', description: 'Thiết kế, lắp đặt và vận hành hệ thống điện mặt trời', features: ['Hệ thống rooftop cho hộ gia đình','Điện mặt trời tập trung (CSP)','Hệ thống hybrid tích hợp','Giám sát và bảo trì từ xa'], projects: 150, capacity: '500MW' },
    { icon: Wind, title: 'Điện Gió', description: 'Giải pháp điện gió trên bờ và ngoài khơi', features: ['Turbine gió công nghiệp','Hệ thống gió nhỏ phân tán','Dự án điện gió ngoài khơi','Tích hợp lưới điện thông minh'], projects: 80, capacity: '300MW' },
    { icon: Droplets, title: 'Thủy Điện', description: 'Phát triển các dự án thủy điện nhỏ và mini', features: ['Thủy điện nhỏ (< 10MW)','Hệ thống thủy điện mini','Tái tạo các đập cũ','Tích hợp đa mục tiêu'], projects: 45, capacity: '200MW' },
    { icon: Leaf, title: 'Năng Lượng Sinh Khối', description: 'Chuyển đổi sinh khối thành năng lượng', features: ['Đốt trực tiếp sinh khối','Khí hóa sinh khối','Nhiệt điện kết hợp','Xử lý chất thải hữu cơ'], projects: 25, capacity: '100MW' },
    { icon: Battery, title: 'Hệ Thống Lưu Trữ', description: 'Giải pháp lưu trữ năng lượng tiên tiến', features: ['Pin lithium-ion','Hệ thống bơm thủy lực','Lưu trữ nhiệt năng','Quản lý năng lượng thông minh'], projects: 60, capacity: '150MWh' },
    { icon: Wrench, title: 'Tư Vấn & Dịch Vụ', description: 'Dịch vụ tư vấn và hỗ trợ toàn diện', features: ['Khảo sát và đánh giá','Thiết kế hệ thống','Quản lý dự án','Bảo trì và vận hành'], projects: 200, capacity: 'N/A' }
  ]

  const achievements = [
    { year: '2023', title: 'Giải thưởng Doanh nghiệp Xanh', description: 'Được vinh danh là doanh nghiệp có đóng góp tích cực nhất cho môi trường' },
    { year: '2022', title: 'Chứng nhận ISO 14001', description: 'Hệ thống quản lý môi trường đạt tiêu chuẩn quốc tế' },
    { year: '2021', title: 'Top 10 Công ty Năng lượng Tái tạo', description: 'Xếp hạng trong top 10 công ty năng lượng tái tạo hàng đầu Việt Nam' },
    { year: '2020', title: 'Giải thưởng Đổi mới Công nghệ', description: 'Công nhận về những đổi mới trong công nghệ năng lượng sạch' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Năng Lực & Dự Án</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Với hơn 15 năm kinh nghiệm, chúng tôi đã hoàn thành hơn 500 dự án năng lượng tái tạo với tổng công suất lắp đặt hơn 1.2GW.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center"><div className="text-3xl font-bold text-green-600 mb-2">500+</div><div className="text-gray-600">Dự án hoàn thành</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600 mb-2">1.2GW</div><div className="text-gray-600">Công suất lắp đặt</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600 mb-2">50+</div><div className="text-gray-600">Tỉnh thành</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600 mb-2">15+</div><div className="text-gray-600">Năm kinh nghiệm</div></div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Năng Lực Cốt Lõi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Chúng tôi cung cấp đầy đủ các giải pháp năng lượng tái tạo với công nghệ tiên tiến và dịch vụ chuyên nghiệp.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((c, i) => {
              const Icon = c.icon
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-green-600" /></div>
                    <CardTitle className="text-xl">{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {c.features.map((f, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3" />{f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div><div className="text-sm text-gray-500">Dự án</div><div className="font-semibold text-green-600">{c.projects}</div></div>
                      <div><div className="text-sm text-gray-500">Công suất</div><div className="font-semibold text-green-600">{c.capacity}</div></div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dự Án Tiêu Biểu</h2>
            <p className="text-xl text-gray-600">Một số dự án nổi bật thể hiện năng lực và kinh nghiệm của chúng tôi</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchProjects} className="mt-4">Thử lại</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className={`aspect-video ${
                      project.category === 'solar' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      project.category === 'wind' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      project.category === 'hybrid' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      'bg-gradient-to-br from-purple-400 to-purple-600'
                    }`} />
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription>{project.location || 'Việt Nam'}</CardDescription>
                      </div>
                      <Badge variant={project.status === 'completed' ? 'secondary' : project.status === 'in-progress' ? 'default' : 'outline'}>
                        {getBadge(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><div className="text-sm text-gray-500">Công suất</div><div className="font-semibold">{project.capacity || 'N/A'}</div></div>
                      <div><div className="text-sm text-gray-500">Danh mục</div><div className="font-semibold">{project.category}</div></div>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <Button variant="outline" className="w-full" onClick={() => openModal(project)}>
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thành Tựu & Giải Thưởng</h2>
            <p className="text-xl text-gray-600">Những thành tựu và giải thưởng đã đạt được trong suốt quá trình phát triển</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((a, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600 border-green-600">{a.year}</Badge>
                  </div>
                  <CardTitle className="text-xl">{a.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-gray-600">{a.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Muốn Biết Thêm Về Năng Lực Của Chúng Tôi?</h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">Hãy liên hệ với chúng tôi để được tư vấn chi tiết về các giải pháp năng lượng tái tạo phù hợp với nhu cầu của bạn.</p>
          <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">Liên hệ tư vấn</Button>
        </div>
      </section>

      {/* Modal */}
      {open && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
        <div
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          role="dialog" aria-modal="true"
        >

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{current.title}</h3>
                <div className="text-sm text-gray-500">{current.location || 'Việt Nam'} · {getBadge(current.status)}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={closeModal} aria-label="Đóng">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* slider */}
            <div className="p-6 pt-5 overflow-y-auto grow">
              <div className="relative w-full aspect-video bg-gray-50 rounded-lg overflow-hidden border">
                {imgLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin" /></div>
                ) : slides.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    Chưa có hình ảnh
                  </div>
                ) : (
                  <>
                    <img
                      key={slides[idx].url}
                      src={slides[idx].url}
                      alt={slides[idx].alt || current.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {canPrev && (
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                        onClick={goPrev}
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {canNext && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                        onClick={goNext}
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}

                    {/* dots */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          aria-label={`Go to slide ${i + 1}`}
                          className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-white shadow ring-1 ring-black/10' : 'bg-white/60 hover:bg-white'}`}
                          onClick={() => setIdx(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                  <h4 className="font-semibold">Mô tả</h4>
                  <p className="text-gray-700 mt-2 leading-relaxed">{current.description}</p>
                </div>
                <div className="space-y-3">
                  <div><span className="text-sm text-gray-500">Danh mục</span><div className="font-medium">{current.category}</div></div>
                  <div><span className="text-sm text-gray-500">Công suất</span><div className="font-medium">{current.capacity || 'N/A'}</div></div>
                  <div><span className="text-sm text-gray-500">Trạng thái</span><div className="font-medium">{getBadge(current.status)}</div></div>
                  <div><span className="text-sm text-gray-500">Tạo ngày</span><div className="font-medium">{new Date(current.createdAt).toLocaleDateString('vi-VN')}</div></div>
                </div>
              </div>

              {imgError && <div className="mt-4 text-sm text-red-600">{imgError}</div>}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <Button variant="outline" onClick={closeModal}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
