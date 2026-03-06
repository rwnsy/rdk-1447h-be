# RDK 1447-H Backend API

Backend API untuk website RDK 1447-H, dibangun dengan Node.js, Express, dan MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM)
- **File Upload**: Multer (Memory Storage)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel Serverless Functions

## 📁 Project Structure

```
rdk-1447h-be/
├── api/
│   └── index.js              # Vercel serverless entry point
├── src/
│   ├── server.js             # Local development server
│   ├── configs/
│   │   ├── db.js            # MongoDB connection configuration
│   │   └── multer.js        # File upload configuration
│   ├── controllers/
│   │   ├── articleController.js
│   │   ├── donationController.js
│   │   └── galleryController.js
│   ├── models/
│   │   ├── articleModel.js
│   │   ├── donationModel.js
│   │   └── galleryModel.js
│   ├── routes/
│   │   ├── articleRoute.js
│   │   ├── authRoutes.js
│   │   ├── donationRoutes.js
│   │   └── galleryRoutes.js
│   ├── services/
│   │   └── Base64FileService.js
│   └── utils/
│       └── FileValidationService.js
├── .env                      # Environment variables (not tracked)
├── .env.example             # Environment variables template
├── vercel.json              # Vercel deployment configuration
├── package.json
└── VERCEL_DEPLOYMENT.md     # Detailed deployment guide
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB (local atau Atlas)
- npm atau yarn

### Installation Steps

1. **Clone repository**

   ```bash
   git clone https://github.com/fahmiirfanfaiz/rdk-1447h-be.git
   cd rdk-1447h-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` dan isi dengan konfigurasi Anda:

   ```env
   MONGO_URI=mongodb://localhost:27017/rdk1447h
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   TZ=Asia/Jakarta
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create new article (multipart/form-data)
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Donations

- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation by ID
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Gallery

- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID
- `POST /api/gallery` - Create new gallery item
- `PUT /api/gallery/:id` - Update gallery item
- `DELETE /api/gallery/:id` - Delete gallery item

### Health Check

- `GET /` - API status check
- `GET /api` - API status check

## 🧪 Testing

### Using Postman

1. Import collection dari folder `postman/`
2. Import environment dari `postman/RDK-1447H.postman_environment.json`
3. Update `BASE_URL` variable sesuai dengan environment Anda

### Using cURL

```bash
# Health check
curl http://localhost:5000/api

# Get all articles
curl http://localhost:5000/api/articles

# Create article (with image)
curl -X POST http://localhost:5000/api/articles \
  -F "title=Test Article" \
  -F "content=This is test content" \
  -F "image=@/path/to/image.jpg"
```

## 🚀 Deployment

### Deploy to Vercel

Lihat panduan lengkap di **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

Quick steps:

1. Push code ke GitHub
2. Import project di Vercel Dashboard
3. Add environment variables
4. Deploy!

URL Production: `https://your-project.vercel.app`

### Deploy to Other Platforms

Project ini juga bisa di-deploy ke:

- Railway
- Render
- Heroku
- AWS EC2
- Google Cloud Run
- DigitalOcean App Platform

## 🔧 Scripts

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Lint (if configured)
npm run lint
```

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `multer` - File upload middleware
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `crypto` - Cryptographic functions

### Development Dependencies

- `nodemon` - Auto-reload development server

## ⚙️ Configuration

### Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

### CORS Configuration

Default CORS configuration di `api/index.js` mengizinkan semua origins. Untuk production, sebaiknya batasi ke frontend domain saja:

```javascript
app.use(
  cors({
    origin: ["https://your-frontend-domain.com"],
    credentials: true,
  }),
);
```

### File Upload Limits

- Max file size: **5 MB**
- Allowed types: **image/jpeg, image/png, image/webp**
- Storage: **Memory (base64 encoded to MongoDB)**

## 🐛 Known Issues & Limitations

### Vercel Serverless

- Max execution time: 10s (Free) / 60s (Pro)
- File uploads stored in MongoDB (not recommended for large files)
- Cold start ~1-3 seconds

### Recommended Improvements

- [ ] Migrate file uploads to Cloudinary/S3
- [ ] Add rate limiting
- [ ] Add request validation (express-validator)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit & integration tests
- [ ] Add logging (Winston/Morgan)
- [ ] Add caching (Redis)

## 📝 License

ISC

## 👥 Contributors

- [Fahmi Irfan Faiz](https://github.com/fahmiirfanfaiz)

## 📞 Support

Untuk pertanyaan atau issues, silakan buka issue di [GitHub Repository](https://github.com/fahmiirfanfaiz/rdk-1447h-be/issues).

---

**Last Updated**: March 6, 2026
