'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Home, Edit, Save, X, Loader2 } from 'lucide-react'

interface HomeContent {
  id: string
  key: string
  value: string
  type: string
}

export default function HomeContentPage() {
  const [contents, setContents] = useState<HomeContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const homeContentFields = [
    {
      key: 'hero_title',
      label: 'Tiêu đề chính',
      type: 'text',
      description: 'Tiêu đề lớn ở phần hero section'
    },
    {
      key: 'hero_title_en',
      label: 'Tiêu đề chính bằng tiếng Anh',
      type: 'text',
      description: 'Tiêu đề lớn ở phần hero section'
    },
    {
      key: 'hero_subtitle',
      label: 'Tiêu đề phụ',
      type: 'text',
      description: 'Tiêu đề phụ dưới tiêu đề chính'
    },
    {
      key: 'hero_subtitle_en',
      label: 'Tiêu đề phụ bằng tiếng Anh',
      type: 'text',
      description: 'Tiêu đề phụ dưới tiêu đề chính'
    },
    {
      key: 'hero_description',
      label: 'Mô tả hero',
      type: 'textarea',
      description: 'Đoạn mô tả trong hero section'
    },
    {
      key: 'hero_description_en',
      label: 'Mô tả hero bằng tiếng Anh',
      type: 'textarea',
      description: 'Đoạn mô tả trong hero section'
    },
    {
      key: 'stats_projects',
      label: 'Số dự án',
      type: 'number',
      description: 'Số dự án đã hoàn thành'
    },
    {
      key: 'stats_capacity',
      label: 'Công suất lắp đặt',
      type: 'text',
      description: 'Tổng công suất lắp đặt (VD: 1.2GW)'
    },
    {
      key: 'stats_partners',
      label: 'Số đối tác',
      type: 'number',
      description: 'Số đối tác hợp tác'
    },
    {
      key: 'stats_experience',
      label: 'Năm kinh nghiệm',
      type: 'number',
      description: 'Số năm kinh nghiệm'
    },
    {
      key: 'company_description',
      label: 'Mô tả công ty',
      type: 'textarea',
      description: 'Mô tả tổng quan về công ty'
    }
  ]

  useEffect(() => {
    fetchHomeContent()
  }, [])

  const fetchHomeContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings?type=home_content')
      const data = await response.json()
      
      if (data.success) {
        setContents(data.data.items)
      } else {
        setError('Failed to load home content')
      }
    } catch (err) {
      setError('Failed to load home content')
    } finally {
      setLoading(false)
    }
  }

  const getContentValue = (key: string) => {
    const content = contents.find(c => c.key === key)
    return content?.value || ''
  }

  const handleEdit = (key: string) => {
    setEditingKey(key)
    setEditValue(getContentValue(key))
  }

  const handleSave = async () => {
    if (!editingKey) return

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: editingKey,
          value: editValue,
          type: 'home_content'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setContents(prev => {
          const existing = prev.find(c => c.key === editingKey)
          if (existing) {
            return prev.map(c => c.key === editingKey ? { ...c, value: editValue } : c)
          } else {
            return [...prev, { id: data.data.id, key: editingKey, value: editValue, type: 'string' }]
          }
        })
        setEditingKey(null)
        setEditValue('')
      } else {
        alert('Có lỗi xảy ra khi lưu nội dung')
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu nội dung')
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
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
          <Button onClick={fetchHomeContent}>Thử lại</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý nội dung trang chủ</h1>
              <p className="text-gray-600 mt-1">Chỉnh sửa nội dung hiển thị trên trang chủ</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/home-content">
                <Button variant="outline" size="sm">
                  Quay lại
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Xem trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {homeContentFields.map((field) => (
            <Card key={field.key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    {field.label}
                    <Badge variant="outline" className="ml-2">{field.type}</Badge>
                  </div>
                  {editingKey === field.key ? (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-1" />
                        Lưu
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(field.key)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>{field.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {editingKey === field.key ? (
                  field.type === 'textarea' ? (
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={4}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                    />
                  )
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md">
                    {getContentValue(field.key) || (
                      <span className="text-gray-500 italic">Chưa có nội dung</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Xem trước nội dung</CardTitle>
            <CardDescription>
              Nội dung hiện tại sẽ hiển thị trên trang chủ như sau:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getContentValue('hero_title') || 'Năng Lượng Tái Tạo Cho Tương Lai Xanh'}
                </h2>
              </div>
              <div>
                <h3 className="text-xl text-green-600">
                  {getContentValue('hero_subtitle') || 'Cho Tương Lai Xanh'}
                </h3>
              </div>
              <div>
                <p className="text-gray-600">
                  {getContentValue('hero_description') || 'Chúng tôi cam kết mang đến những giải pháp năng lượng bền vững, góp phần xây dựng một tương lai xanh và sạch cho thế hệ mai sau.'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getContentValue('stats_projects') || '500'}+
                  </div>
                  <div className="text-gray-600">Dự án hoàn thành</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getContentValue('stats_capacity') || '1.2GW'}
                  </div>
                  <div className="text-gray-600">Công suất lắp đặt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getContentValue('stats_partners') || '50'}+
                  </div>
                  <div className="text-gray-600">Đối tác</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getContentValue('stats_experience') || '15'}+
                  </div>
                  <div className="text-gray-600">Năm kinh nghiệm</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
