# Digital Shagun - Backend

Backend API service for the Digital Shagun platform, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication**: Secure JWT-based authentication system
- **User Management**: User registration and login
- **Event Management**: Create and manage wedding gift collection events
- **Contribution Handling**: Process and track gift contributions
- **Database Integration**: PostgreSQL with Prisma ORM
- **Type Safety**: Built with TypeScript
- **API Security**: Request validation and middleware protection

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Express Validator & Zod
- **Security**: bcryptjs for password hashing

## 📦 Installation

1. Clone the repository: 

```bash
git clone https://github.com/meetmehta1198/shagun-backend.git
```

2. Install dependencies:

```bash
npm install
```
3. Set up the database:

```bash
npm run prisma:generate
```

4. Start the server:

```bash
npm run dev
```
