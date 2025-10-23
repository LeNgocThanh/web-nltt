// app/trends/[slug]/page.tsx
import { notFound } from 'next/navigation'

type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  featuredImage?: string | null
  category: string
  published: boolean
  createdAt: string
  updatedAt: string
}

type ImageItem = {
  id: string
  typeRef: string
  idRef: string
  url: string
  alt: string | null
  sort: number
  createdAt: string
}

const baseUrl = 'http://localhost:5000';

async function getPostBySlug(slug: string): Promise<Post | null> {
  // Gọi API hiện có của bạn; đảm bảo API /api/posts hỗ trợ filter theo slug
  const res = await fetch(`${baseUrl ?? ''}/api/posts?slug=${encodeURIComponent(slug)}&published=true`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  // backend nên trả về 1 bài hoặc items[0]
  const data = Array.isArray(json?.data?.items) ? json.data.items[0] : json?.data
  return data ?? null
}

async function getPostImages(postId: string): Promise<ImageItem[]> {
  const res = await fetch(`${baseUrl ?? ''}/api/images?typeRef=Post&idRef=${encodeURIComponent(postId)}&sort=sort&order=asc`, { cache: 'no-store' })
  if (!res.ok) return []
  const json = await res.json()
  return json?.data?.items ?? json?.data ?? []
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPostBySlug(params.slug)
  if (!p) return { title: 'Bài viết không tồn tại' }
  return {
    title: p.title,
    description: p.excerpt ?? p.content?.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.excerpt ?? p.content?.slice(0, 160),
      images: p.featuredImage ? [{ url: p.featuredImage }] : [],
      type: 'article'
    }
  }
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return notFound()

  const images = await getPostImages(post.id)

  // slide: cover + gallery (loại trùng)
  const slides = [
    ...(post.featuredImage ? [{ url: post.featuredImage, alt: 'Cover' }] : []),
    ...images.filter((it: ImageItem) => it.url !== post.featuredImage).map(it => ({ url: it.url, alt: it.alt ?? undefined }))
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-sm text-gray-600 mb-2">
            <a href="/trends" className="hover:underline">Xu Hướng Xanh</a> / <span>{post.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{post.title}</h1>
          <div className="text-gray-500 mt-3">
            {new Date(post.createdAt).toLocaleDateString('vi-VN')} • {Math.ceil(post.content.length / 1000)} phút đọc
          </div>
        </div>
      </section>

      {/* Cover / Slider */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative w-full rounded-lg overflow-hidden border bg-gray-50">
            {slides.length ? (
              // đơn giản: hiển thị ảnh đầu (nếu muốn slider client-side, bạn có thể thêm Swiper/keen-slider)
              <img src={slides[0].url} alt={slides[0].alt || post.title} className="w-full h-auto object-cover" />
            ) : (
              <div className="aspect-video" />
            )}
          </div>
          {slides.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
              {slides.map((s, i) => (
                <img key={i} src={s.url} alt={s.alt || `image-${i}`} className="w-full h-20 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="p-4 bg-green-50 text-green-800 rounded-md mb-6">{post.excerpt}</p>
          )}
          <article className="prose max-w-none prose-green prose-img:rounded-lg">
            {/* Nếu content là text thuần, tách đoạn theo \n\n; 
               nếu là HTML/Markdown, hãy render đúng theo editor của bạn */}
            {post.content.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </article>
        </div>
      </section>
    </div>
  )
}
