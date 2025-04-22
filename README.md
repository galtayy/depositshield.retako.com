# DepositShield

An application for creating and documenting property inspection reports. This application allows landlords and tenants to create reports before and after moving in, or for general observation purposes.

## Features

- Users can add their properties
- Create various types of reports for properties:
  - Pre-move-in
  - Post-move-out
  - General observation
- Photo upload for reports (file upload and camera capture)
- Add notes and tags to photos
- Access reports via unique UUID
- Progressive Web App (PWA) that works on mobile and desktop devices

## Technology Stack

### Frontend
- Next.js
- Tailwind CSS
- Responsive design
- PWA features

### Backend
- Node.js + Express
- MySQL database
- JWT-based authentication
- File upload operations

## Installation

### Requirements
- Node.js (v14+)
- MySQL (v5.7+)

### Backend Setup

1. Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

2. Edit the `.env` file:
```
PORT=5050
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=depositshield_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASSWORD=email_password
EMAIL_FROM=noreply@depositshield.com
```

3. Create the MySQL database:
```bash
mysql -u root -p < config/schema.sql
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend folder and install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

3. Start the development server:
```bash
npm run dev
```

## Build for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Project Structure

```
depositshield/
├── backend/
│   ├── config/           # Database and application configurations
│   ├── controllers/      # API endpoint handlers
│   ├── middleware/       # Express middlewares
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Helper services
│   ├── uploads/          # Uploaded files
│   └── server.js         # Main application file
│
└── frontend/
    ├── components/       # React components
    ├── lib/              # Helper functions
    ├── pages/            # Next.js pages
    ├── public/           # Static files
    └── styles/           # CSS styles
```

## License

This project is licensed under the [MIT License](LICENSE).
