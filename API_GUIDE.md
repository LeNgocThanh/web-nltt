# Hướng dẫn sử dụng API và File Upload

## API Endpoints

### 1. Partners API

#### GET /api/partners
Lấy danh sách đối tác
```javascript
const response = await fetch('/api/partners')
const data = await response.json()
```

**Query parameters:**
- `category`: Lọc theo danh mục
- `country`: Lọc theo quốc gia  
- `status`: Lọc theo trạng thái

#### POST /api/partners
Tạo đối tác mới
```javascript
const response = await fetch('/api/partners', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tên đối tác',
    description: 'Mô tả',
    website: 'https://example.com',
    category: 'Điện mặt trời',
    country: 'Việt Nam',
    partnership: 'Đối tác chiến lược',
    projects: 10,
    established: '2020',
    status: 'active',
    priority: 1
  })
})
```

### 2. Posts API

#### GET /api/posts
Lấy danh sách bài viết
```javascript
const response = await fetch('/api/posts?published=true')
const data = await response.json()
```

**Query parameters:**
- `category`: Lọc theo danh mục
- `published`: Lọc theo trạng thái xuất bản
- `search`: Tìm kiếm theo tiêu đề/nội dung
- `page`: Trang (pagination)
- `limit`: Số lượng mỗi trang

#### POST /api/posts
Tạo bài viết mới
```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Tiêu đề bài viết',
    content: 'Nội dung bài viết',
    excerpt: 'Mô tả ngắn',
    category: 'Xu hướng',
    featuredImage: '/uploads/images/image.jpg',
    published: true
  })
})
```

### 3. Contacts API

#### GET /api/contacts
Lấy danh sách tin nhắn liên hệ
```javascript
const response = await fetch('/api/contacts')
const data = await response.json()
```

#### POST /api/contacts
Tạo tin nhắn liên hệ mới
```javascript
const response = await fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tên người gửi',
    email: 'email@example.com',
    phone: '+84123456789',
    company: 'Tên công ty',
    subject: 'Chủ đề',
    message: 'Nội dung tin nhắn'
  })
})
```

### 4. Projects API

#### GET /api/projects
Lấy danh sách dự án
```javascript
const response = await fetch('/api/projects')
const data = await response.json()
```

#### POST /api/projects
Tạo dự án mới
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Tên dự án',
    description: 'Mô tả dự án',
    category: 'solar',
    capacity: '50MW',
    location: 'Ninh Thuận',
    status: 'completed',
    priority: 1,
    image: '/uploads/images/project.jpg'
  })
})
```

## File Upload API

### POST /api/upload
Upload file hoặc ảnh
```javascript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const data = await response.json()
// Response: { success: true, fileUrl: '/uploads/images/filename.jpg', fileName: 'filename.jpg' }
```

### GET /api/upload
Lấy danh sách files đã upload
```javascript
const response = await fetch('/api/upload?type=image') // type: 'image' hoặc 'file'
const data = await response.json()
```

## File Upload Component

Sử dụng component FileUpload đã tạo:

```jsx
import FileUpload from '@/components/FileUpload'

function MyComponent() {
  const handleUploadSuccess = (fileUrl, fileName) => {
    console.log('File uploaded:', fileUrl, fileName)
    // Cập nhật form data hoặc state
  }

  return (
    <FileUpload
      onUploadSuccess={handleUploadSuccess}
      accept="image/*" // Chỉ cho phép ảnh
      maxSize={5} // Tối đa 5MB
      multiple={false} // Chỉ upload 1 file
    />
  )
}
```

## Cấu trúc thư mục uploads

```
public/
├── uploads/
│   ├── images/     # Ảnh (JPG, PNG, GIF, etc.)
│   └── files/      # Files khác (PDF, DOC, etc.)
```

## Lưu ý quan trọng

1. **File size limit**: Mặc định 10MB, có thể thay đổi trong component
2. **File types**: Có thể giới hạn loại file bằng prop `accept`
3. **Security**: Nên validate file type và size ở backend
4. **Database**: Thông tin file được lưu trong bảng `settings` với key bắt đầu bằng `file_`

## Ví dụ sử dụng trong form

```jsx
'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'

export default function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featuredImage: ''
  })

  const handleUploadSuccess = (fileUrl) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: fileUrl
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    const data = await response.json()
    if (data.success) {
      alert('Tạo bài viết thành công!')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tiêu đề"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />
      
      <textarea
        placeholder="Nội dung"
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
      />
      
      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        accept="image/*"
        maxSize={5}
      />
      
      <button type="submit">Tạo bài viết</button>
    </form>
  )
}
```

## Testing API

Bạn có thể test API bằng cách:

1. **Browser**: Truy cập trực tiếp `/api/partners` để xem JSON response
2. **Postman/Insomnia**: Test POST requests với JSON body
3. **Frontend**: Sử dụng fetch() như trong các ví dụ trên

## Database Schema

Các bảng chính:
- `posts`: Bài viết blog
- `partners`: Đối tác
- `contacts`: Tin nhắn liên hệ
- `projects`: Dự án
- `settings`: Cài đặt hệ thống (bao gồm thông tin files)
