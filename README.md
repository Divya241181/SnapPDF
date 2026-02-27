# 📄 SnapPDF — Create PDFs Instantly On Web

A **mobile-first** full-stack web app to create PDF documents from uploaded images or live camera scans. Users can register, log in, manage a personal PDF library, and generate PDFs entirely in the browser using `pdf-lib`.

---

## 🏗️ Project Structure

```
pdf-maker/
├── backend/           # Node.js + Express REST API
│   ├── models/        # Mongoose schemas (User, Pdf)
│   ├── routes/        # auth, user, pdf
│   ├── middleware/    # JWT auth middleware
│   ├── uploads/       # Saved PDF & photo files
│   ├── mongodata/     # Local MongoDB data directory
│   ├── .env           # Environment variables
│   └── index.js       # Server entry point
│
└── frontend/          # React + Vite + Tailwind CSS
    └── src/
        ├── pages/     # Landing, Login, Register, Dashboard, CreatePDF
        ├── components/# Navbar
        ├── store/     # Zustand auth store
        └── index.css  # Global styles + Tailwind layers
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 19, Vite 7, Tailwind CSS v4, React Router v7  |
| State      | Zustand                                             |
| PDF Gen    | `pdf-lib` (runs in the browser)                     |
| Camera     | `react-webcam` + MediaDevices API                   |
| Compression| `browser-image-compression`                         |
| Backend    | Node.js + Express 5                                 |
| Database   | MongoDB 8.2 + Mongoose 9                            |
| Auth       | JWT + bcryptjs                                      |
| File Uploads| Multer                                             |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB 8.x (installed at `C:\Program Files\MongoDB\Server\8.2\`)

### Step 1 — Start MongoDB
Open a terminal and run:
```
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "D:\KIMI\pdf-maker\mongodata" --port 27017
```
> Keep this terminal open while using the app.

### Step 2 — Start the Backend API
Open a **new terminal**:
```bash
cd D:\KIMI\pdf-maker\backend
npm run dev
```
The API will start at `http://localhost:5000`

### Step 3 — Start the Frontend
Open another **new terminal**:
```bash
cd D:\KIMI\pdf-maker\frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint                 | Description              | Auth |
|--------|--------------------------|--------------------------|------|
| POST   | `/api/auth/register`     | Register user            | ❌   |
| POST   | `/api/auth/login`        | Login user, get JWT      | ❌   |
| GET    | `/api/user/profile`      | Get logged-in user info  | ✅   |
| PUT    | `/api/user/profile`      | Update profile           | ✅   |
| POST   | `/api/pdfs`              | Upload & save PDF record | ✅   |
| GET    | `/api/pdfs`              | List user's PDFs         | ✅   |
| DELETE | `/api/pdfs/:id`          | Delete a PDF             | ✅   |

---

## 🎯 Key Features

- **Upload Images → PDF**: Select multiple JPG/PNG files, compress them automatically, arrange order, and compile into a single A4 PDF — all in the browser (no server-side processing needed).
- **Camera Scan**: Use your device's camera to capture pages and add them to the PDF.
- **User Auth**: JWT-based auth with protected routes. Each user only sees their own PDFs.
- **Dashboard**: Grid view of all PDFs with view, download, and delete actions + search bar.
- **Modern UI**: Glassmorphism panels, smooth hover transitions, Inter font, mobile-first layout.

---

## 🗄️ Database Schema

**User**
```json
{ "email": "string", "password": "hashed", "username": "string", "profession": "string", "profilePhotoUrl": "string" }
```

**PDF**
```json
{ "userId": "ObjectId", "filename": "string", "fileUrl": "string", "fileSize": "number", "pageCount": "number", "thumbnailUrl": "string" }
```

---

## 🌐 Deployment Guide

### Frontend → Vercel / Netlify
```bash
cd frontend
npm run build   # Output: dist/
```
Upload `dist/` to Vercel or Netlify. Set environment variables if needed.

### Backend → Render / Railway
1. Push `backend/` to a GitHub repo.
2. Create a new Web Service on [Render](https://render.com).
3. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`.
4. Use MongoDB Atlas (https://cloud.mongodb.com) for a managed MongoDB cloud instance.

### MongoDB Atlas (Cloud DB)
1. Create a free cluster on https://cloud.mongodb.com
2. Get your connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/pdfmaker`)
3. Update `MONGODB_URI` in backend `.env`

---

## 🔒 Security Notes
- Passwords are hashed with `bcryptjs` (10 salt rounds).
- JWT tokens expire in 7 days.
- Each user can only access/delete their own PDF records (backend enforced).
- CORS is enabled for development — restrict to your frontend origin in production.

---

*Built with ❤️ using React, Node.js, MongoDB, pdf-lib, and Tailwind CSS.*
