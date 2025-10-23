'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Plus, Search, Edit, Trash2, Globe, Award } from 'lucide-react'

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const partners = [
    {
      id: 1,
      name: "Siemens Energy",
      description: "Tập đoàn công nghệ năng lượng hàng đầu thế giới",
      website: "https://siemens-energy.com",
      category: "Công nghệ",
      country: "Đức",
      partnership: "Đối tác chiến lược",
      projects: 25,
      established: "2020",
      status: "active"
    },
    {
      id: 2,
      name: "First Solar",
      description: "Nhà sản xuất tấm pin mặt trời hàng đầu",
      website: "https://firstsolar.com",
      category: "Điện mặt trời",
      country: "Mỹ",
      partnership: "Nhà cung cấp",
      projects: 40,
      established: "2018",
      status: "active"
    },
    {
      id: 3,
      name: "Vestas",
      description: "Nhà sản xuất turbine gió hàng đầu thế giới",
      website: "https://vestas.com",
      category: "Điện gió",
      country: "Đan Mạch",
      partnership: "Đối tác kỹ thuật",
      projects: 30,
      established: "2019",
      status: "active"
    },
    {
      id: 4,
      name: "Tesla Energy",
      description: "Chuyên về hệ thống lưu trữ năng lượng",
      website: "https://tesla.com/energy",
      category: "Lưu trữ năng lượng",
      country: "Mỹ",
      partnership: "Đối tác công nghệ",
      projects: 15,
      established: "2021",
      status: "pending"
    }
  ]

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = ["Tất cả", "Điện mặt trời", "Điện gió", "Công nghệ", "Lưu trữ năng lượng", "Biến tần", "Phát triển dự án", "Đa dạng"]
  const countries = ["Tất cả", "Đức", "Mỹ", "Đan Mạch", "Trung Quốc", "Pháp"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý đối tác</h1>
              <p className="text-gray-600 mt-1">Thêm và quản lý thông tin đối tác</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Quay lại
                </Button>
              </Link>
              <Link href="/admin/partners/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm đối tác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đối tác</p>
                  <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">
                    {partners.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {partners.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng dự án</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {partners.reduce((sum, p) => sum + p.projects, 0)}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm đối tác..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Danh mục:</span>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === "Tất cả" ? "default" : "outline"}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Quốc gia:</span>
                {countries.map((country) => (
                  <Button
                    key={country}
                    variant={country === "Tất cả" ? "default" : "outline"}
                    size="sm"
                  >
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners List */}
        <div className="space-y-4">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={partner.status === 'active' ? "default" : "secondary"}>
                        {partner.status === 'active' ? "Hoạt động" : "Chờ duyệt"}
                      </Badge>
                      <Badge variant="outline">{partner.category}</Badge>
                      <Badge variant="outline">{partner.country}</Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {partner.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {partner.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loại hợp tác:</span>
                        <p className="font-medium">{partner.partnership}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dự án hợp tác:</span>
                        <p className="font-medium">{partner.projects}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hợp tác từ:</span>
                        <p className="font-medium">{partner.established}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Website:</span>
                        <a 
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Globe className="w-4 h-4 inline mr-1" />
                          Truy cập
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy đối tác
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Không có đối tác nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có đối tác nào.'}
              </p>
              <Link href="/admin/partners/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm đối tác đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {filteredPartners.length} trong tổng số {partners.length} đối tác
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}




