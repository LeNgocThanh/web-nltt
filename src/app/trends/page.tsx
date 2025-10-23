'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, TrendingUp, Leaf, Zap, Wind, Loader2 } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  category: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function TrendsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts?published=true')
      const data = await response.json()

      if (data.success) {
        setPosts(data.data.items)
      } else {
        setError('Failed to load posts')
      }
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }
  const featuredPost = posts.length > 0 ? posts[0] : null

  const otherPosts = posts.slice(1) // Lấy các bài viết còn lại (bỏ bài đầu tiên vì đã làm featured)

  const categories = [
    { name: "Tất cả", icon: TrendingUp, count: 24 },
    { name: "Điện mặt trời", icon: Zap, count: 8 },
    { name: "Điện gió", icon: Wind, count: 6 },
    { name: "Công nghệ", icon: Leaf, count: 5 },
    { name: "Xu hướng", icon: TrendingUp, count: 3 },
    { name: "Chính sách", icon: Leaf, count: 2 }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Xu Hướng Xanh
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Cập nhật những xu hướng mới nhất trong lĩnh vực năng lượng tái tạo,
              công nghệ xanh và phát triển bền vững.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.slice(0, 4).map((category, index) => {
                const Icon = category.icon
                return (
                  <Badge key={index} variant="outline" className="px-4 py-2">
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài viết nổi bật</h2>
          </div>

          {featuredPost ? (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2">
                  {featuredPost.featuredImage ? (
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500"></div>
                  )}
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-green-600">{featuredPost.category}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(featuredPost.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {Math.ceil(featuredPost.content.length / 1000)} phút
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>

                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt || featuredPost.content.substring(0, 200) + '...'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-semibold text-sm">
                          A
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Bởi Admin</span>
                    </div>

                    <Link href={`/trends/${featuredPost.slug}`} className="inline-flex">
                      <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                        Đọc tiếp
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p>Chưa có bài viết nào</p>
            </Card>
          )}
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  className="flex items-center"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tất cả bài viết</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchPosts} className="mt-4">Thử lại</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500"></div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.ceil(post.content.length / 1000)} phút
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-green-600 font-semibold text-xs">
                            A
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">Admin</span>
                      </div>

                      <Link href={`/trends/${post.slug}`} className="inline-flex">
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          Đọc tiếp
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
              Xem thêm bài viết
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Nhận những bài viết mới nhất về xu hướng năng lượng tái tạo
            và công nghệ xanh ngay trong hộp thư của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}




