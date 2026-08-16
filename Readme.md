# Vidtube – Video Management Platform

Vidtube is a backend-focused video management application built using Node.js, Express.js, MongoDB and Mongoose.

The application allows users to securely register and login, upload video content, store media files using Cloudinary, and manage their uploaded videos through REST APIs.

## Features

- User registration and login
- JWT-based authentication
- Access and refresh token authentication
- Secure logout
- User profile management
- Avatar upload
- Video upload
- Thumbnail upload
- Cloudinary integration for media storage
- View published videos
- Search and sort videos
- Update uploaded videos
- Delete uploaded videos
- Basic ownership authorization

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- Cloudinary
- REST APIs

## How It Works

### User Authentication

User
↓
Register / Login
↓
JWT Authentication
↓
Access Protected APIs

### Video Upload

User
↓
Upload Video + Thumbnail
↓
Multer
↓
Cloudinary
↓
Cloudinary URL
↓
MongoDB

MongoDB stores video information such as title, description, duration, views, owner and Cloudinary URLs instead of storing the actual video files.

## Main API Operations

### User

- Register
- Login
- Logout
- Refresh Access Token
- Get Current User
- Update Account Details
- Update Avatar

### Video

- Upload Video
- Get All Videos
- Get Video by ID
- Search Videos
- Sort Videos
- Update Video
- Delete Video

## Future Scope

The backend can be extended into an educational video platform where faculty can upload lecture videos and students can access published course content.

Possible future features:

- Student and faculty roles
- Course and subject management
- Lecture-wise video organization
- Admin dashboard
- Role-based access control
- Course-specific video content

## Learning Outcomes

Through this project, I worked with:

- REST API development
- JWT authentication
- Middleware
- MongoDB and Mongoose
- File upload handling using Multer
- Cloudinary integration
- CRUD operations
- Authentication and authorization
- API-based backend architecture