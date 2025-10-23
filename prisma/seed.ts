import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tạo dữ liệu mẫu cho posts
  await prisma.post.createMany({
    data: [
      {
        title: "Xu hướng năng lượng tái tạo 2024: Tương lai xanh của Việt Nam",
        slug: "xuhuong-nangluong-taitao-2024",
        content: "Năm 2024 đánh dấu một bước ngoặt quan trọng trong phát triển năng lượng tái tạo tại Việt Nam với nhiều chính sách mới và công nghệ tiên tiến...",
        excerpt: "Năm 2024 đánh dấu một bước ngoặt quan trọng trong phát triển năng lượng tái tạo tại Việt Nam với nhiều chính sách mới và công nghệ tiên tiến.",
        category: "Xu hướng",
        published: true
      },
      {
        title: "Điện mặt trời nổi: Giải pháp mới cho đất nước",
        slug: "dien-mat-troi-noi-giai-phap-moi",
        content: "Khám phá tiềm năng của điện mặt trời nổi tại Việt Nam và những lợi ích to lớn của công nghệ này...",
        excerpt: "Khám phá tiềm năng của điện mặt trời nổi tại Việt Nam và những lợi ích to lớn của công nghệ này.",
        category: "Điện mặt trời",
        published: true
      },
      {
        title: "Công nghệ lưu trữ năng lượng: Chìa khóa cho tương lai",
        slug: "cong-nghe-luu-tru-nang-luong",
        content: "Những tiến bộ mới nhất trong công nghệ lưu trữ năng lượng và tác động của chúng đến ngành điện...",
        excerpt: "Những tiến bộ mới nhất trong công nghệ lưu trữ năng lượng và tác động của chúng đến ngành điện.",
        category: "Công nghệ",
        published: true
      }
    ]
  })

  // Tạo dữ liệu mẫu cho partners
  await prisma.partner.createMany({
    data: [
      {
        name: "Siemens Energy",
        description: "Tập đoàn công nghệ năng lượng hàng đầu thế giới, chuyên về điện gió và hệ thống lưới điện thông minh.",
        website: "https://siemens-energy.com",
        category: "Công nghệ",
        country: "Đức",
        partnership: "Đối tác chiến lược",
        projects: 25,
        established: "2020",
        status: "active",
        priority: 1
      },
      {
        name: "First Solar",
        description: "Nhà sản xuất tấm pin mặt trời hàng đầu với công nghệ thin-film tiên tiến và hiệu suất cao.",
        website: "https://firstsolar.com",
        category: "Điện mặt trời",
        country: "Mỹ",
        partnership: "Nhà cung cấp",
        projects: 40,
        established: "2018",
        status: "active",
        priority: 2
      },
      {
        name: "Vestas",
        description: "Nhà sản xuất turbine gió hàng đầu thế giới với hơn 40 năm kinh nghiệm trong lĩnh vực điện gió.",
        website: "https://vestas.com",
        category: "Điện gió",
        country: "Đan Mạch",
        partnership: "Đối tác kỹ thuật",
        projects: 30,
        established: "2019",
        status: "active",
        priority: 3
      },
      {
        name: "Tesla Energy",
        description: "Chuyên về hệ thống lưu trữ năng lượng và giải pháp năng lượng tích hợp cho hộ gia đình và doanh nghiệp.",
        website: "https://tesla.com/energy",
        category: "Lưu trữ năng lượng",
        country: "Mỹ",
        partnership: "Đối tác công nghệ",
        projects: 15,
        established: "2021",
        status: "active",
        priority: 4
      }
    ]
  })

  // Tạo dữ liệu mẫu cho projects
  await prisma.project.createMany({
    data: [
      {
        title: "Nhà máy điện mặt trời ABC",
        description: "Dự án điện mặt trời quy mô lớn, cung cấp điện năng sạch cho hàng nghìn hộ dân.",
        category: "solar",
        capacity: "50MW",
        location: "Ninh Thuận",
        status: "completed",
        priority: 1
      },
      {
        title: "Hệ thống điện gió DEF",
        description: "Dự án điện gió ngoài khơi đầu tiên tại Việt Nam, mở ra tiềm năng to lớn của năng lượng gió.",
        category: "wind",
        capacity: "100MW",
        location: "Bạc Liêu",
        status: "completed",
        priority: 2
      },
      {
        title: "Hệ thống hybrid GHI",
        description: "Kết hợp điện mặt trời và điện gió với hệ thống lưu trữ năng lượng tiên tiến.",
        category: "hybrid",
        capacity: "25MW",
        location: "Đắk Lắk",
        status: "in-progress",
        priority: 3
      }
    ]
  })

  // Tạo dữ liệu mẫu cho settings
  await prisma.setting.createMany({
    data: [
      {
        key: "company_name",
        value: "GreenTech Solutions",
        type: "string"
      },
      {
        key: "company_email",
        value: "info@greentech.com",
        type: "string"
      },
      {
        key: "company_phone",
        value: "+84 123 456 789",
        type: "string"
      }
    ]
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
