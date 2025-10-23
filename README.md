# GreenTech Solutions - Website Năng Lượng Tái Tạo

Website công ty chuyên về năng lượng tái tạo được xây dựng với Next.js, TypeScript, Tailwind CSS và Prisma.

## Tính năng chính

### Trang công khai
- **Trang chủ**: Giới thiệu tổng quan công ty, slogan, hình ảnh tiêu biểu
- **Năng lực & Dự án**: Liệt kê các dự án và năng lực cốt lõi
- **Xu hướng xanh**: Blog về năng lượng tái tạo và xu hướng xanh
- **Đối tác**: Danh sách đối tác hợp tác
- **Liên hệ**: Form liên hệ, Google Map, thông tin công ty

### Tính năng đặc biệt
- **Header & Footer**: Cố định với logo, menu, link MXH
- **Nút liên hệ nổi**: Floating contact button với form nhanh
- **Responsive**: Tối ưu cho mọi thiết bị
- **SEO friendly**: Meta tags và cấu trúc tối ưu

### Trang Admin
- **Dashboard**: Tổng quan thống kê
- **Quản lý bài viết**: CRUD bài viết blog
- **Quản lý đối tác**: CRUD thông tin đối tác
- **Quản lý tin nhắn**: Xem và quản lý tin nhắn liên hệ

## Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **Database**: SQLite với Prisma ORM
- **Styling**: Tailwind CSS với custom theme
- **Icons**: Lucide React

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd web-nltt
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình database**
```bash
# Tạo file .env từ env.example
cp env.example .env

# Khởi tạo database
npx prisma generate
npx prisma db push
```

4. **Chạy dự án**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Mở Prisma Studio
- `npm run db:generate` - Generate Prisma client

## Cấu trúc dự án

```
src/
├── app/                    # App Router pages
│   ├── admin/             # Admin pages
│   ├── about/             # About/Projects page
│   ├── trends/            # Green trends blog
│   ├── partners/          # Partners page
│   ├── contact/           # Contact page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── Header.tsx        # Main header
│   ├── Footer.tsx        # Main footer
│   └── FloatingContact.tsx # Floating contact button
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
└── types/                # TypeScript types

prisma/
└── schema.prisma         # Database schema
```

## Database Schema

### Tables
- **posts**: Blog posts cho trang xu hướng xanh
- **partners**: Thông tin đối tác
- **contacts**: Tin nhắn liên hệ từ form
- **projects**: Dự án năng lượng tái tạo
- **settings**: Cài đặt hệ thống, dùng cho trang chủ hoặc 1 số trang đặc biệt, phân biệt bằng type

## Tùy chỉnh

### Thay đổi màu sắc chủ đạo
Chỉnh sửa file `tailwind.config.ts` để thay đổi theme màu xanh:

```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))", // Màu xanh chính
    foreground: "hsl(var(--primary-foreground))",
  },
  // ...
}
```

### Thêm trang mới
1. Tạo thư mục trong `src/app/`
2. Tạo file `page.tsx`
3. Thêm link vào navigation trong `Header.tsx`

### Tùy chỉnh nội dung
- **Company info**: Chỉnh sửa trong các component và metadata
- **Contact info**: Cập nhật trong `Footer.tsx` và `ContactPage`
- **Social links**: Thêm vào `Footer.tsx`

## Deployment

### Vercel (Recommended)
1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Cấu hình environment variables
4. Deploy

### Other platforms
- **Netlify**: Sử dụng với static export
- **Railway**: Hỗ trợ full-stack Next.js
- **DigitalOcean**: App Platform

## Hỗ trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ, hãy:
1. Kiểm tra documentation
2. Tạo issue trên GitHub
3. Liên hệ qua email

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.




