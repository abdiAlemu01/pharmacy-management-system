# Pharmacy Management System - Backend

Enterprise-grade Pharmacy Management Backend built with:
- **Node.js & Express** with TypeScript
- **Prisma ORM** with **PostgreSQL**
- **Layered Monolithic Architecture**: Routes ➔ Controllers ➔ Services
- **Validation Layer**: Request schema validation with Zod
- **Security**: JWT Authentication, RBAC Authorization, Helmet, Rate Limiting, Request ID tracing

## Folder Structure
```
backend/
├── src/
│   ├── app.ts                          # Express application initialization
│   ├── server.ts                       # Server entry point
│   ├── routes/                         # API route declarations
│   ├── controller/                     # HTTP controllers (request/response orchestration)
│   ├── service/                        # Business logic & database operations
│   ├── validation/                     # Zod request validators
│   ├── middleware/                     # Express middlewares (auth, rbac, validation, errors)
│   ├── config/                         # Environment & application configurations
│   ├── database/                       # Prisma client & seed scripts
│   ├── schema/                         # Domain database models & DTO schemas
│   ├── types/                          # TypeScript definitions & ambient declarations
│   ├── errors/                         # Custom error hierarchy
│   ├── utils/                          # Async wrapper, pagination & formatting helpers
│   └── tests/                          # Unit, integration tests & test fixtures
├── prisma/                             # Prisma schema & database migrations
├── Dockerfile & docker-compose.yml
└── package.json
```
