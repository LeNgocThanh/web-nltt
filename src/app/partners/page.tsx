'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Award, Users, ArrowRight, Building2, Zap, Wind, Leaf, Loader2 } from 'lucide-react'

interface Partner {
  id: string
  name: string
  description: string
  logo?: string
  website?: string
  category: string
  country: string
  partnership: string
  projects: number
  established: string
  status: string
}

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partners')
      const data = await response.json()
      
      if (data.success) {
        setPartners(data.data)
      } else {
        setError('Failed to load partners')
      }
    } catch (err) {
      setError('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = ["Tất cả", "Điện mặt trời", "Điện gió", "Công nghệ", "Lưu trữ năng lượng", "Biến tần", "Phát triển dự án", "Đa dạng"]
  const countries = ["Tất cả", "Đức", "Mỹ", "Đan Mạch", "Trung Quốc", "Pháp"]

  const stats = [
    {
      label: "Đối tác quốc tế",
      value: `${partners.length}+`,
      description: "Từ các quốc gia hàng đầu"
    },
    {
      label: "Dự án hợp tác",
      value: `${partners.reduce((sum, p) => sum + p.projects, 0)}+`,
      description: "Đã hoàn thành thành công"
    },
    {
      label: "Quốc gia",
      value: `${new Set(partners.map(p => p.country)).size}`,
      description: "Đức, Mỹ, Đan Mạch, Trung Quốc, Pháp"
    },
    {
      label: "Năm hợp tác",
      value: "8+",
      description: "Kinh nghiệm lâu dài"
    }
  ]

  const getIcon = (category: string) => {
    switch (category) {
      case 'Điện mặt trời':
        return Zap
      case 'Điện gió':
        return Wind
      case 'Lưu trữ năng lượng':
        return Wind
      case 'Đa dạng':
        return Building2
      default:
        return Leaf
    }
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
          <Button onClick={fetchPartners}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Đối Tác Chiến Lược
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Chúng tôi tự hào được hợp tác với những tập đoàn hàng đầu thế giới 
              trong lĩnh vực năng lượng tái tạo, mang đến những giải pháp tốt nhất.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stat.value}</div>
                  <div className="text-gray-900 font-semibold">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className="flex items-center"
              >
                {category}
                <Badge variant="secondary" className="ml-2">
                  {category === "Tất cả" ? partners.length : 
                   partners.filter(p => p.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tất cả đối tác</h2>
            <p className="text-gray-600">
              Những đối tác tin cậy đã đồng hành cùng chúng tôi trong suốt quá trình phát triển
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner) => {
              const Icon = getIcon(partner.category)
              return (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-8 h-8 text-green-600" />
                      </div>
                      <Badge variant="outline">{partner.country}</Badge>
                    </div>
                    
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    <CardDescription>{partner.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Danh mục:</span>
                        <span className="font-medium">{partner.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loại hợp tác:</span>
                        <span className="font-medium">{partner.partnership}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Dự án hợp tác:</span>
                        <span className="font-medium">{partner.projects}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hợp tác từ:</span>
                        <span className="font-medium">{partner.established}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                      
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lợi Ích Hợp Tác
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tại sao các đối tác hàng đầu thế giới chọn hợp tác với chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Chất lượng hàng đầu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cam kết cung cấp những giải pháp chất lượng cao nhất 
                  với công nghệ tiên tiến và dịch vụ chuyên nghiệp.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Đội ngũ chuyên gia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Đội ngũ kỹ sư giàu kinh nghiệm và chuyên môn cao, 
                  sẵn sàng hỗ trợ 24/7 cho mọi dự án.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Mạng lưới toàn cầu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kết nối với mạng lưới đối tác quốc tế, 
                  mang đến những cơ hội hợp tác và phát triển mới.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Become Partner */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Muốn Trở Thành Đối Tác?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi để tìm hiểu về cơ hội hợp tác 
            và cùng phát triển những giải pháp năng lượng tái tạo tiên tiến.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Liên hệ hợp tác
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Tải tài liệu hợp tác
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}