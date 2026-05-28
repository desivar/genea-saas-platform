# 🌳 Genea — Genealogy Presentation Builder

A professional-grade web application for building beautiful genealogy presentations, family trees and research reports.

## 🎯 Purpose
Built for genealogists and families who want to present their family history professionally — from the 1700s to the present — with elegant design and academic rigor.

## ✨ Features
- **Presentation Builder** — 9 customizable slide types with live editing
- **Family Trees** — Interactive trees from earliest ancestor to present
- **Chicago Citations** — Auto-formatted Chicago Manual of Style citations on every slide
- **Heritage Stickers** — 9+ country heritage tags with pastel themes
- **8 Historical Fonts** — Playfair, Cormorant, Cinzel and more
- **5 Color Palettes** — Cream, Sage, Rose, Slate, Lavender
- **Research Time Tracker** — For genealogist accounts
- **Print & Export** — HTML export and print-ready booklets
- **Share** — Public shareable links
- **3 User Roles** — Admin, Genealogist, Family Member

## 🛠️ Tech Stack
**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- ReactFlow (family tree visualization)
- React Router DOM

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB Atlas + Mongoose
- JWT Authentication
- Bcrypt password hashing
- Cloudinary (image uploads)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Cloudinary account

### Installation

**Clone the repository:**
```bash
git clone https://github.com/yourusername/genea-saas-platform.git
cd genea-saas-platform
```

**Backend setup:**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5500
```

```bash
npm run dev
```

**Frontend setup:**
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

```bash
npm run dev
```

## 👤 User Roles
| Role | Access |
|------|--------|
| **Admin** | Full access — first registered user |
| **Genealogist** | Build presentations, citations, time tracker |
| **Family Member** | View shared presentations |

## 📚 Citation System
Genea implements Chicago Manual of Style citations supporting:
- Census Records
- Books
- Newspapers
- Magazines
- Oral Histories
- Portraits & Photographs
- Custom sources

Citations appear as footnotes on each slide and auto-populate the bibliography slide.

## 🗺️ Roadmap
- [ ] Cloudinary image uploads for person profiles
- [ ] PDF export
- [ ] Collaborative editing
- [ ] Mobile responsive design
- [ ] AI-assisted biography writing

## 📄 License
MIT License — free to use and modify.

## 👩‍💻 Author
Built with care for families everywhere 🌳
