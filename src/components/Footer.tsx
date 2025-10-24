import Link from 'next/link'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="ml-2 text-xl font-bold">
              CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ XÂY DỰNG CFS
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Chúng tôi cam kết mang đến những giải pháp năng lượng tái tạo 
              bền vững và thân thiện với môi trường cho tương lai xanh.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">
                  Năng lực
                </Link>
              </li>
              <li>
                <Link href="/trends" className="text-gray-300 hover:text-green-400 transition-colors">
                  Xu hướng xanh
                </Link>
              </li>              
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 text-green-400" />
                <span className="text-gray-300 text-sm">
                số 284 đường Biên Giang, P. Chương Mỹ, TP. Hà Nội, Việt Nam
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-green-400" />
                <span className="text-gray-300 text-sm">
                  +84 961 596 889
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-green-400" />
                <span className="text-gray-300 text-sm">
                    info.dientaitao.vn@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI VÀ XÂY DỰNG CFS. Tất cả quyền được bảo lưu.
            </p>            
          </div>
        </div>
      </div>
    </footer>
  )
}




