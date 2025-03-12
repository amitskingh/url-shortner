# Project Name

A URL shortener with advanced analytics, including click tracking, country-based insights, device detection (Linux, Windows, Mac), and referrer tracking (LinkedIn, Twitter, etc.).

## 🚀 Features

- 🔗 **URL Shortening** using Base62 encoding
- 📊 **Advanced Analytics**: Click count, country tracking, device insights, and referral sources
- 🔒 **Secure Authentication** with Firebase Admin SDK
- ⚡ **Performance Optimization** with Redis caching
- 📂 **Scalable Database Design** with PostgreSQL/MongoDB & optimized indexing
- 🛠 **Background Processing** with BullMQ for analytics updates
- 📡 **WebSocket Integration** for live tracking
- 📜 **RESTful APIs** with proper authentication

## 🏗 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL(Prisma ORM)
- **Caching & Queues:** Redis, BullMQ
- **Authentication:** Firebase Admin SDK
- **Real-time Communication:** WebSockets
- **Containerization:** Docker

## 📦 Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/amitskingh/url-shortner
   cd url-shortner
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file and add the required variables:
   ```env
   DATABASE_URL=your_database_url
   REDIS_URL=your_redis_url

   # Convert you firebase config into base64
   FIREBASE_ADMIN_SDK=your_firebase_config

   # `AccountID` & `LicenseKey` is from your MaxMind account.
   AccountID=account_id
   LicenseKey=license_key
   ```

4. Start the development server:
   ```sh
   npm run dev
   npm run worker
   ```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/v1/auth/login` | User Login |
| `POST` | `/api/v1/` | Fetch all shorten URL |
| `POST` | `/api/v1/short` | Shorten a URL |
| `GET` | `/api/v1/:shortURL` | Redirect to Original URL |
| `GET` | `/api/v1/analytics/:aliasId` | Get URL Analytics |

## 📖 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a Pull Request

## 📜 License

This project is licensed under the MIT License. Feel free to use and modify it!