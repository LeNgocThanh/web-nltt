'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, Eye, Reply, Trash2, Mail, Phone, User, Building } from 'lucide-react'

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const contacts = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "+84 123 456 789",
      company: "Công ty ABC",
      subject: "Tư vấn dự án điện mặt trời",
      message: "Tôi muốn tư vấn về dự án điện mặt trời cho nhà máy của công ty. Dự án có quy mô khoảng 5MW...",
      status: "pending",
      createdAt: "2024-01-15 10:30:00"
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "+84 987 654 321",
      company: "Tập đoàn XYZ",
      subject: "Hợp tác phát triển dự án điện gió",
      message: "Chúng tôi quan tâm đến việc hợp tác phát triển dự án điện gió ngoài khơi tại Bạc Liêu...",
      status: "read",
      createdAt: "2024-01-14 15:45:00"
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "+84 555 123 456",
      company: "Công ty DEF",
      subject: "Báo giá hệ thống lưu trữ năng lượng",
      message: "Xin chào, tôi cần báo giá cho hệ thống lưu trữ năng lượng 2MWh cho dự án điện mặt trời...",
      status: "replied",
      createdAt: "2024-01-13 09:20:00"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "+84 777 888 999",
      company: "Nhà máy GHI",
      subject: "Bảo trì hệ thống điện mặt trời",
      message: "Hệ thống điện mặt trời của chúng tôi cần bảo trì định kỳ. Mong được hỗ trợ...",
      status: "pending",
      createdAt: "2024-01-12 14:15:00"
    }
  ]

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    read: "bg-blue-100 text-blue-800",
    replied: "bg-green-100 text-green-800"
  }

  const statusLabels = {
    pending: "Chưa đọc",
    read: "Đã đọc",
    replied: "Đã trả lời"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tin nhắn liên hệ</h1>
              <p className="text-gray-600 mt-1">Quản lý tin nhắn từ khách hàng</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Quay lại
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
                  <p className="text-sm font-medium text-gray-600">Tổng tin nhắn</p>
                  <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {contacts.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã đọc</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {contacts.filter(c => c.status === 'read').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã trả lời</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => c.status === 'replied').length}
                  </p>
                </div>
                <Reply className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tìm kiếm tin nhắn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, công ty hoặc chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={statusColors[contact.status as keyof typeof statusColors]}>
                        {statusLabels[contact.status as keyof typeof statusLabels]}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(contact.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {contact.subject}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-900 font-medium">{contact.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">{contact.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">{contact.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">{contact.company}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {contact.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4" />
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
        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy tin nhắn
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Không có tin nhắn nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có tin nhắn nào.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {filteredContacts.length} trong tổng số {contacts.length} tin nhắn
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




