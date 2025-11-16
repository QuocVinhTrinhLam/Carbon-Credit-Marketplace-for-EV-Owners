# Carbon Credit Marketplace

Full-stack monorepo containing a Spring Boot backend and a React + TypeScript frontend for managing carbon credit listings, transactions, and wallets.

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.0**
- **Maven**
- **MySQL 8.0**
- **Docker & Docker Compose**
- **Flyway** (Database Migration)
- **Lombok**

### Frontend
- **Vite 5**
- **React 18**
- **TypeScript 5**
- **TailwindCSS 3**
- **ShadCN UI**
- **TanStack Query (React Query)**
- **React Router**

## Dependencies chính

- Spring Web
- Spring Data JPA
- Validation
- MySQL Driver
- Flyway Core & MySQL
- Lombok

## Project Structure

```
CCMfEO/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # UI components (ShadCN)
│   │   ├── pages/               # Page components
│   │   ├── layouts/             # Layout wrappers
│   │   ├── contexts/            # React contexts (Auth, etc.)
│   │   ├── hooks/               # Custom hooks
│   │   ├── router/              # Route definitions
│   │   ├── services/            # API client services
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── src/                         # Spring Boot backend
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # JPA repositories
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── dto/             # Data transfer objects
│   │   │   └── DemoApplication.java
│   │   └── resources/
│   │       ├── application*.yml
│   │       ├── db/migration/    # Flyway migrations
│   │       └── static/          # Static files (frontend build output)
│   └── test/
│
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── pom.xml
└── README.md
```

## Getting Started

### Prerequisites
- **Java 21**
- **Node.js 18+** and **npm**
- **Docker & Docker Compose** (optional, for containerized deployment)

### Quick Start (Development)

#### 1. Start Backend (Spring Boot)

First, start MySQL in Docker:
```bash
docker compose up -d db
```

Then run the Spring Boot application:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Or using Makefile
make run
```

Backend will be available at **http://localhost:8080**

#### 2. Start Frontend (Vite + React)

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at **http://localhost:5173**

The dev server proxies `/api` requests to the backend at `http://localhost:8080`.

### Production Build & Deployment

#### Build Frontend
```bash
cd frontend
npm run build
```

This generates a production-optimized build in `frontend/dist/`.

#### Copy Frontend Build to Spring Boot Static Resources
```bash
# From project root
cp -r frontend/dist/* src/main/resources/static/
```

Now when you start Spring Boot, it will serve the frontend from `http://localhost:8080`.

#### Run Full Stack with Docker Compose
```bash
docker compose up -d --build

# Or using Makefile
make up
```

Services will run on:
- **Application (Backend + Frontend)**: http://localhost:8080
- **MySQL**: localhost:3306
- **Adminer** (Database UI): http://localhost:8081

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user

### Listings
- `GET /api/listings` - Get all listings (paginated)
- `GET /api/listings/open` - Get open listings
- `GET /api/listings/{id}` - Get listing by ID
- `POST /api/listings` - Create new listing
- `PUT /api/listings/{id}` - Update listing
- `DELETE /api/listings/{id}` - Delete listing

### Transactions
- `GET /api/transactions/mine?userId={id}` - Get user transactions
- `POST /api/transactions` - Create transaction (purchase)
- `POST /api/transactions/{id}/confirm` - Confirm transaction
- `POST /api/transactions/{id}/cancel` - Cancel transaction

### Wallet
- `GET /api/wallet/{userId}/balance` - Get wallet balance
- `POST /api/wallet/{userId}/credit` - Add credits to wallet
- `POST /api/wallet/{userId}/debit` - Deduct credits from wallet

## Makefile Commands

```bash
# Chạy tất cả services
make up

# Dừng tất cả services
make down

# Xem logs
make logs

# Chạy app local với profile dev
make run

# Xem tất cả commands
make help
```

## Database

### Connection Info
- **Host**: localhost (dev) / db (docker)
- **Port**: 3306
- **Database**: appdb
- **Username**: appuser
- **Password**: secret
- **Root Password**: rootsecret

### Adminer Access
Truy cập Adminer tại: http://localhost:8081
- **System**: MySQL
- **Server**: db
- **Username**: appuser
- **Password**: secret
- **Database**: appdb

## Spring Profiles

- **dev**: Kết nối MySQL trên localhost (cho development)
- **docker**: Kết nối MySQL host = "db" (cho Docker environment)

## Database Migration

Flyway sẽ tự động chạy migration scripts trong `src/main/resources/db/migration/` khi application khởi động.

## Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra MySQL container
docker compose logs db

# Restart services
docker compose restart
```

### Xem logs application
```bash
# Logs tất cả services
docker compose logs

# Logs chỉ app
docker compose logs app

# Follow logs real-time
docker compose logs -f app
```

### Reset database
```bash
# Xóa volume và restart
docker compose down -v
docker compose up -d --build
```

