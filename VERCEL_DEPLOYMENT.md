# 🚀 Deployment Guide - Vercel

## 📋 Prerequisites

Sebelum melakukan deployment, pastikan Anda sudah:

- ✅ Memiliki akun [Vercel](https://vercel.com)
- ✅ Repository GitHub sudah ter-push dengan perubahan terbaru
- ✅ MongoDB Atlas atau database MongoDB yang dapat diakses secara public

## 📁 Struktur File untuk Vercel

Project ini sudah dikonfigurasi dengan:

```
rdk-1447h-be/
├── api/
│   └── index.js          # Entry point untuk Vercel serverless
├── src/
│   ├── server.js         # Server untuk development lokal
│   ├── configs/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
├── vercel.json           # Konfigurasi Vercel
├── package.json
└── .env                  # Environment variables (JANGAN DI-COMMIT!)
```

## ⚙️ Environment Variables

Setelah project di-import ke Vercel, tambahkan environment variables berikut di **Project Settings > Environment Variables**:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT (jika digunakan)
JWT_SECRET=your_jwt_secret_key_here

# Timezone
TZ=Asia/Jakarta
```

### 📝 Cara Menambahkan Environment Variables di Vercel:

1. Buka project di Vercel Dashboard
2. Pilih tab **Settings**
3. Klik **Environment Variables**
4. Tambahkan setiap variable dengan key dan value-nya
5. Pilih environment: Production, Preview, dan Development (centang semua)
6. Klik **Save**

## 🌐 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**
   - Klik **"Add New..."** > **"Project"**
   - Pilih repository `rdk-1447h-be`
   - Klik **"Import"**

3. **Configure Project**

   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (kosongkan)
   Output Directory: (kosongkan)
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Tambahkan semua env variables (lihat section di atas)

5. **Deploy**
   - Klik **"Deploy"**
   - Tunggu proses deployment selesai (±2-3 menit)
   - Salin URL deployment Anda (contoh: `https://rdk-1447h-be.vercel.app`)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   # Deployment pertama kali
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Add Environment Variables via CLI**
   ```bash
   vercel env add MONGO_URI production
   vercel env add PORT production
   vercel env add NODE_ENV production
   ```

## 🔍 Testing Deployment

Setelah deployment berhasil, test endpoint API Anda:

### Health Check

```bash
curl https://your-domain.vercel.app/api
```

Expected response:

```json
{
  "success": true,
  "message": "RDK 1447-H API is running",
  "timestamp": "2026-03-06T10:00:00.000Z"
}
```

### Test Articles Endpoint

```bash
curl https://your-domain.vercel.app/api/articles
```

### Test dengan Postman

1. Import collection `RDK-1447H-API.postman_collection.json`
2. Update environment variable `BASE_URL` menjadi URL Vercel Anda
3. Test semua endpoints

## 📱 Update Frontend

Setelah backend di-deploy, update frontend untuk menggunakan URL Vercel:

**File: `rdk-1447h-fe/src/services/api.js`**

```javascript
const API_BASE_URL = "https://your-domain.vercel.app/api";
```

## ⚠️ Penting - Serverless Considerations

### 1. File Upload

Vercel serverless functions memiliki batasan:

- ✅ **Recommended**: Upload file ke cloud storage (Cloudinary, AWS S3, dll)
- ⚠️ **Current setup**: File disimpan ke MongoDB sebagai base64 (sudah OK untuk sementara)

### 2. Execution Time

- Vercel Free Plan: Max 10 detik per request
- Pro Plan: Max 60 detik per request
- Pastikan operasi database tidak terlalu lama

### 3. Cold Start

- Serverless functions mungkin mengalami "cold start" (~1-3 detik) jika tidak ada request dalam beberapa menit
- Ini normal dan tidak bisa dihindari di Free Plan

### 4. Database Connection

- MongoDB connection akan di-reuse antar requests berkat caching
- Pastikan MongoDB Atlas whitelist IP: `0.0.0.0/0` (allow all) karena Vercel menggunakan dynamic IPs

## 🛠️ Troubleshooting

### Error: "Database connection unavailable"

- ✅ Cek apakah `MONGO_URI` sudah ditambahkan di Environment Variables
- ✅ Cek MongoDB Atlas Network Access: Allow from anywhere (0.0.0.0/0)
- ✅ Cek username/password di connection string

### Error: "Module not found"

- ✅ Pastikan semua dependencies ada di `package.json`
- ✅ Redeploy dengan: `vercel --prod`

### Error: "Function execution timeout"

- ✅ Optimize query database Anda
- ✅ Pertimbangkan upgrade ke Pro Plan jika diperlukan

### CORS Issues

- ✅ Pastikan CORS sudah diaktifkan di `api/index.js`
- ✅ Tambahkan allowed origins jika perlu:
  ```javascript
  app.use(
    cors({
      origin: ["https://your-frontend.vercel.app"],
      credentials: true,
    }),
  );
  ```

## 🔄 Re-deployment

Setiap kali ada perubahan di branch `main`:

1. Push code ke GitHub
2. Vercel akan otomatis trigger deployment
3. Deployment baru akan live dalam 2-3 menit

Untuk manual redeploy:

```bash
vercel --prod
```

## 📊 Monitoring

Monitor aplikasi Anda di Vercel Dashboard:

- **Deployments**: Lihat history deployments
- **Functions**: Monitor serverless function logs
- **Analytics**: (Pro Plan) Lihat traffic dan performance metrics

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express.js to Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📞 Support

Jika mengalami masalah:

1. Check Vercel Function Logs di Dashboard
2. Check MongoDB Atlas logs
3. Buka issue di repository GitHub

---

**Created by**: Software Development Engineer  
**Last Updated**: March 6, 2026  
**Version**: 1.0.0
