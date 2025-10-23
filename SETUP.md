# Hướng dẫn thiết lập dự án

## Bước 1: Cài đặt dependencies
```bash
npm install
```

## Bước 2: Cấu hình database
```bash
# Tạo file .env từ env.example
cp env.example .env

# Generate Prisma client
npx prisma generate

# Tạo database
npx prisma db push
```

## Bước 3: Thêm dữ liệu mẫu (tùy chọn)
```bash
# Chạy seed script
npx tsx prisma/seed.ts
```

## Bước 4: Chạy dự án
```bash
npm run dev
```

Mở trình duyệt và truy cập: http://localhost:3000

## Các trang chính

### Trang công khai
- **Trang chủ**: http://localhost:3000
- **Năng lực**: http://localhost:3000/about
- **Xu hướng xanh**: http://localhost:3000/trends
- **Đối tác**: http://localhost:3000/partners
- **Liên hệ**: http://localhost:3000/contact

### Trang admin
- **Dashboard**: http://localhost:3000/admin
- **Quản lý bài viết**: http://localhost:3000/admin/posts
- **Quản lý đối tác**: http://localhost:3000/admin/partners
- **Tin nhắn liên hệ**: http://localhost:3000/admin/contacts

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Trang admin
│   ├── about/             # Trang năng lực
│   ├── trends/            # Trang xu hướng xanh
│   ├── partners/          # Trang đối tác
│   ├── contact/           # Trang liên hệ
│   ├── globals.css        # CSS toàn cục
│   ├── layout.tsx         # Layout chính
│   └── page.tsx           # Trang chủ
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── Header.tsx        # Header chính
│   ├── Footer.tsx        # Footer chính
│   └── FloatingContact.tsx # Nút liên hệ nổi
├── lib/                  # Utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Dữ liệu mẫu
```

## Tính năng chính

### ✅ Đã hoàn thành
- [x] Thiết lập dự án Next.js với App Router
- [x] Cấu hình Tailwind CSS và Shadcn/ui
- [x] Thiết lập Prisma với SQLite
- [x] Tạo layout chính (Header, Footer)
- [x] Trang chủ với hero section và thống kê
- [x] Trang năng lực & dự án
- [x] Trang xu hướng xanh (blog)
- [x] Trang đối tác
- [x] Trang liên hệ với form
- [x] Nút liên hệ nổi (floating button)
- [x] Trang admin dashboard
- [x] Quản lý bài viết
- [x] Quản lý đối tác
- [x] Quản lý tin nhắn liên hệ
- [x] Responsive design
- [x] SEO optimization

### 🔄 Có thể mở rộng
- [ ] API routes cho CRUD operations
- [ ] Authentication cho admin
- [ ] Upload hình ảnh
- [ ] Email integration
- [ ] Google Maps integration
- [ ] Analytics
- [ ] Multi-language support

## Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Mở Prisma Studio
- `npm run db:generate` - Generate Prisma client

## Troubleshooting

### Lỗi Prisma Client
Nếu gặp lỗi "Module has no exported member 'PrismaClient'":
```bash
npx prisma generate
```

### Lỗi database
Nếu gặp lỗi database:
```bash
npx prisma db push --force-reset
npx prisma generate
```

### Lỗi dependencies
Nếu gặp lỗi cài đặt:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Node.js version >= 18
2. Tất cả dependencies đã được cài đặt
3. Database đã được khởi tạo
4. Environment variables đã được cấu hình




