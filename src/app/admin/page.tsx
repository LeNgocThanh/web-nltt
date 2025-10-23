import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, MessageSquare, Settings, BarChart3, Plus } from 'lucide-react'

export default function AdminPage() {
  const stats = [
    {
      title: "Tổng bài viết",
      value: "24",
      change: "+3 tháng này",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Đối tác",
      value: "8",
      change: "+1 mới",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Tin nhắn",
      value: "156",
      change: "+12 hôm nay",
      icon: MessageSquare,
      color: "text-orange-600"
    },
    {
      title: "Dự án",
      value: "45",
      change: "+5 hoàn thành",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ]

  const quickActions = [
    {
      title: "Tạo bài viết mới",
      description: "Viết bài về xu hướng năng lượng tái tạo",
      href: "/admin/posts/new",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Thêm đối tác",
      description: "Thêm đối tác mới vào danh sách",
      href: "/admin/partners/new",
      icon: Users,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Xem tin nhắn",
      description: "Kiểm tra tin nhắn từ khách hàng",
      href: "/admin/contacts",
      icon: MessageSquare,
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Nội dung trang chủ",
      description: "Chỉnh sửa nội dung hiển thị trang chủ",
      href: "/admin/home-content",
      icon: Settings,
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      action: "Bài viết mới",
      description: "Xu hướng năng lượng tái tạo 2024",
      time: "2 giờ trước",
      user: "Admin"
    },
    {
      id: 2,
      action: "Đối tác mới",
      description: "Tesla Energy đã được thêm",
      time: "5 giờ trước",
      user: "Admin"
    },
    {
      id: 3,
      action: "Tin nhắn mới",
      description: "Từ khách hàng: Nguyễn Văn A",
      time: "1 ngày trước",
      user: "Hệ thống"
    },
    {
      id: 4,
      action: "Cập nhật dự án",
      description: "Dự án ABC đã hoàn thành",
      time: "2 ngày trước",
      user: "Admin"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
              <p className="text-gray-600 mt-1">Quản lý nội dung và dữ liệu trang web</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Chào mừng, Admin</span>
              <Button variant="outline" size="sm">
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
                <CardDescription>
                  Các tác vụ thường dùng để quản lý nội dung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mr-4`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Các thay đổi và cập nhật mới nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.time} • {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Links */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý nội dung</CardTitle>
              <CardDescription>
                Truy cập các trang quản lý chi tiết
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/posts">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">Quản lý bài viết</CardTitle>
                          <CardDescription>Tạo, chỉnh sửa và quản lý bài viết</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/partners">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">Quản lý đối tác</CardTitle>
                          <CardDescription>Thêm và quản lý thông tin đối tác</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/contacts">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <MessageSquare className="w-8 h-8 text-orange-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">Tin nhắn liên hệ</CardTitle>
                          <CardDescription>Xem và quản lý tin nhắn từ khách hàng</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/projects">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">Quản lý dự án</CardTitle>
                          <CardDescription>Thêm và quản lý các dự án năng lượng tái tạo</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/home-content">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <Settings className="w-8 h-8 text-indigo-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">Nội dung trang chủ</CardTitle>
                          <CardDescription>Chỉnh sửa nội dung hiển thị trên trang chủ</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


