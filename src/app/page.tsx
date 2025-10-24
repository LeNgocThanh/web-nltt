'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Zap, Leaf, Users, TrendingUp, Award, Loader2 } from 'lucide-react'
import { useLang } from '@/app/providers/LangProvider'

interface Setting {
  id: string
  key: string
  value: string
  type: string
}

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

export default function HomePage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')
  const { lang, setLang } = useLang()

  useEffect(() => {
    fetchSettings()
    fetchProjects()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings?type=home_content')
      const data = await response.json()

      if (data.success) {
        setSettings(data.data.items)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const getSetting = (key: string, defaultValue: string = '') => {
    const setting = settings.find(s => s.key === key)
    return setting?.value || defaultValue
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {getSetting('hero_title', 'Năng Lượng Tái Tạo')}
              <br />
              <span className="text-green-200">{getSetting('hero_subtitle', 'Cho Tương Lai Xanh')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              {getSetting('hero_description', 'Chúng tôi cam kết mang đến những giải pháp năng lượng bền vững, góp phần xây dựng một tương lai xanh và sạch cho thế hệ mai sau.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/about">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Khám phá dự án
                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>
              </Link>
              <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Liên hệ ngay
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {getSetting('stats_projects', '500')}+
              </div>
              <div className="text-gray-600">Dự án hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {getSetting('stats_capacity', '1000MW')}
              </div>
              <div className="text-gray-600">Công suất lắp đặt</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {getSetting('stats_partners', '50')}+
              </div>
              <div className="text-gray-600">Đối tác tin cậy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {getSetting('stats_experience', '15')}+
              </div>
              <div className="text-gray-600">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Năng Lực Cốt Lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các giải pháp năng lượng tái tạo
              từ tư vấn, thiết kế đến thi công và vận hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Điện Mặt Trời</CardTitle>
                <CardDescription>
                  Hệ thống điện mặt trời cho hộ gia đình và doanh nghiệp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Hệ thống rooftop</li>
                  <li>• Điện mặt trời tập trung</li>
                  <li>• Hệ thống hybrid</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Điện Gió</CardTitle>
                <CardDescription>
                  Giải pháp điện gió trên bờ và ngoài khơi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Turbine gió công nghiệp</li>
                  <li>• Hệ thống gió nhỏ</li>
                  <li>• Dự án ngoài khơi</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Năng Lượng Sạch</CardTitle>
                <CardDescription>
                  Các giải pháp năng lượng tái tạo khác
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Thủy điện nhỏ</li>
                  <li>• Năng lượng sinh khối</li>
                  <li>• Hệ thống lưu trữ</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dự Án Tiêu Biểu
            </h2>
            <p className="text-xl text-gray-600">
              Những dự án nổi bật thể hiện năng lực và kinh nghiệm của chúng tôi
            </p>
          </div>

          {/* trạng thái tải/ lỗi/ danh sách */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects
                  // ưu tiên: priority cao trước, sau đó mới createdAt mới nhất
                  .slice() // copy để không mutate state
                  .sort((a, b) => (b.priority - a.priority) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                  .slice(0, 6) // lấy tối đa 6 dự án
                  .map((p) => (
                    <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Không gọi images — chỉ dùng p.image nếu có, fallback màu theo category */}
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div
                          className={[
                            'aspect-video',
                            p.category === 'solar'
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                              : p.category === 'wind'
                                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                : p.category === 'hydro'
                                  ? 'bg-gradient-to-br from-cyan-400 to-sky-600'
                                  : p.category === 'biomass'
                                    ? 'bg-gradient-to-br from-emerald-400 to-green-600'
                                    : 'bg-gradient-to-br from-purple-400 to-purple-600',
                          ].join(' ')}
                        />
                      )}

                      <CardHeader>
                        <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {[
                            p.capacity ? `Công suất: ${p.capacity}` : null,
                            p.location ? `Địa điểm: ${p.location}` : null,
                          ]
                            .filter(Boolean)
                            .join(' | ') || 'Dự án năng lượng tái tạo'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {p.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/about">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Xem tất cả dự án
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-xl text-gray-600">
              Với hơn {getSetting('stats_experience', '15')}+ năm kinh nghiệm trong lĩnh vực năng lượng tái tạo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kinh nghiệm</h3>
              <p className="text-gray-600">
                Hơn {getSetting('stats_experience', '15')} năm kinh nghiệm trong lĩnh vực năng lượng tái tạo
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đội ngũ chuyên gia</h3>
              <p className="text-gray-600">
                Đội ngũ kỹ sư giàu kinh nghiệm và chuyên môn cao
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Công nghệ tiên tiến</h3>
              <p className="text-gray-600">
                Ứng dụng công nghệ mới nhất và hiệu quả nhất
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bền vững</h3>
              <p className="text-gray-600">
                Cam kết phát triển bền vững và thân thiện môi trường
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn Sàng Bắt Đầu Dự Án Của Bạn?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi ngay hôm nay để được tư vấn
            và báo giá miễn phí cho dự án năng lượng tái tạo của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Liên hệ ngay
              </Button>
            </Link>
            <Link href="/trends">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Đọc xu hướng mới
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


