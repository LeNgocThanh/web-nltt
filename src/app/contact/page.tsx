'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(false)
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            subject: '',
            message: ''
          })
        }, 3000)
      } else {
        alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      details: [
        "số 284 đường Biên Giang, P. Chương Mỹ",
        "TP. Hà Nội,",
        "Việt Nam"
      ]
    },
    {
      icon: Phone,
      title: "Điện thoại",
      details: [
        "Hotline: +084961 596 889",        
        "Hỗ trợ 24/7"
      ]
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "info.dientaitao.vn@gmail.com"        
      ]
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      details: [
        "Thứ 2 - Thứ 6: 8:00 - 17:30",
        "Thứ 7: 8:00 - 12:00",
        "Chủ nhật: Nghỉ"
      ]
    }
  ]

  const offices = [
    {
      city: "TP. Hà Nội",
      address: "số 284 đường Biên Giang, P. Chương Mỹ",
      phone: "+084961 596 889",
      email: "info.dientaitao.vn@gmail.com"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Sẵn sàng tư vấn và hỗ trợ bạn về các giải pháp năng lượng tái tạo. 
              Hãy liên hệ với chúng tôi ngay hôm nay!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Gửi tin nhắn cho chúng tôi</CardTitle>
                  <CardDescription>
                    Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại trong thời gian sớm nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-600 mb-2">
                        Gửi tin nhắn thành công!
                      </h3>
                      <p className="text-gray-600">
                        Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Họ và tên *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            Số điện thoại
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium mb-2">
                            Công ty
                          </label>
                          <Input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Nhập tên công ty"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Chủ đề *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Nhập chủ đề"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          Tin nhắn *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Nhập tin nhắn của bạn"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Gửi tin nhắn
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h2>
                <p className="text-gray-600">
                  Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
                  Hãy liên hệ với chúng tôi qua các kênh sau:
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <Icon className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {info.title}
                            </h3>
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-gray-600 mb-1">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Văn Phòng Trên Toàn Quốc
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi có mặt tại các thành phố lớn để phục vụ bạn tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{office.city}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{office.address}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{office.phone}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{office.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Google Map Placeholder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tìm đường đến văn phòng</h2>
            <p className="text-gray-600">
              Văn phòng chính tại TP. Hà Nội - Dễ dàng tiếp cận từ mọi nơi
            </p>
          </div>
          
          {/* Map placeholder - In real implementation, you would embed Google Maps */}
          <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative">
          
    {/* 1. KHỐI NHÚNG BẢN ĐỒ IFRAME */}
    <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.576201782688!2d105.71015257785253!3d20.92936344143242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345275a40c4db5%3A0xa9b2736c41675f0c!2zMjg0IMSQLiBCacOqbiBHaWFuZywgQmnDqm4gR2lhbmcsIEjDoCDEkMO0bmcsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1761228902925!5m2!1svi!2sY"
    />
    
    {/* 2. NÚT XEM TRÊN GOOGLE MAPS (Đặt ở vị trí phù hợp) */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <a 
            href="https://www.google.com/maps/search/?api=1&query=số+284+đường+Biên+Giang,+P.+Chương+Mỹ,+TP.+Hà+Nội,+Việt+Nam" 
            target="_blank" 
            rel="noopener noreferrer"
        >
            <Button className="bg-green-600 hover:bg-green-700">
                Xem trên Google Maps
            </Button>
        </a>
    </div>

</div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Cần Hỗ Trợ Ngay?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Gọi ngay cho chúng tôi để được tư vấn miễn phí về các giải pháp năng lượng tái tạo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+084 961 596 889">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                <Phone className="w-5 h-5 mr-2" />
                Gọi ngay: +0961 596 889
              </Button>
            </a>
            <a href="mailto:info@greentech.com">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Mail className="w-5 h-5 mr-2" />
                Email: info.dientaitao.vn@gmail.com
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}




