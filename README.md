# 🌐 OrbitWCE — Community & Event Management System  

> **Connecting Clubs. Empowering Students. Building the WCE Ecosystem.**  

OrbitWCE is a comprehensive **Community & Event Management Platform** developed for **Walchand College of Engineering, Sangli**.  

It unifies all student clubs, communities, and technical organizations under one digital ecosystem — making it easy to manage events, memberships, and collaborations.

## 🚀 Overview  

OrbitWCE streamlines event management, communication, and collaboration across all 17 student clubs of WCE.  
Built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**, the platform provides an efficient, secure, and interactive experience for both coordinators and students.


## 🌟 Features

### User Authentication
- Secure JWT-based authentication
- Role-based access control (Admin, Community, User)
- Email OTP verification
- Password reset functionality
- Profile management

### Event Management
- Create and manage events
- Event registration and ticketing
- Event categories and filtering
- Calendar view
- Event reminders and notifications

### Community Features
- User profiles with avatars
- Community creation and management
- Team member management
- Discussion forums
- Activity feeds

### Admin Dashboard
- User management
- Event moderation
- Analytics and reporting
- System configuration

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Axios for API requests
- Tailwind CSS for styling
- React Icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.IO for real-time features
- Nodemailer for email notifications
- Multer for file uploads

### Development Tools
- Nodemon for development server
- ESLint for code linting
- Prettier for code formatting
- Git for version control

## 📁 Project Structure

```
OrbitWCE/
├── .gitattributes
├── Backend/
│   ├── .DS_Store
│   ├── .gitignore
│   ├── .vscode/
│   │   └── settings.json
│   ├── checkAllUsers.js
│   ├── checkExistingUsers.js
│   ├── checkRoleValues.js
│   ├── COMMUNITY_ROLES_GUIDE.md
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── controller-email.js
│   │   ├── controller-user.js
│   │   ├── eventController.js
│   │   ├── eventRegistrationController.js
│   │   ├── notificationController.js
│   │   ├── profileController.js
│   │   ├── reportController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── logs/
│   │   ├── combined.log
│   │   ├── error.log
│   │   └── exceptions.log
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Notification.js
│   │   ├── Report.js
│   │   └── User.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRegistrationRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── seedCommunityRoles.js
│   │   ├── seedSuperAdmin.js
│   │   ├── updateByEmail.js
│   │   ├── updateCommunityRoles.js
│   │   └── updateExistingRoles.js
│   ├── server.js
│   ├── updateCommunityRolesToCommunity.js
│   ├── uploads
│   └── utils/
│       ├── emailQueue.js
│       ├── errorHandler.js
│       ├── logger.js
│       ├── otpService.js
│       └── sendEmail/
│           └── sendEmail.js
├── Event Poster.png
├── Frontend/
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   ├── Background.jpg
│   │   ├── forget_&_reset.png
│   │   ├── hero.png
│   │   ├── login_&_verify.png
│   │   ├── logo.png
│   │   ├── PGT.png
│   │   ├── ProjectIcon.png
│   │   ├── ProjectLogo.png
│   │   ├── register.png
│   │   └── vite.svg
│   ├── README.md
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets/
│   │   │   ├── react.svg
│   │   │   └── team/
│   │   │       ├── deepmala.jpg
│   │   │       ├── mentor.jpeg
│   │   │       ├── pranav.jpg
│   │   │       └── rutuja.jpg
│   │   ├── AuthContext/
│   │   │   └── AuthContext.jsx
│   │   ├── AuthProvider/
│   │   │   └── AuthProvider.jsx
│   │   ├── Components/
│   │   │   ├── Event/
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   └── Event.jsx
│   │   │   ├── Footer/
│   │   │   │   └── Footer.jsx
│   │   │   ├── Loader/
│   │   │   │   └── Loader.jsx
│   │   │   ├── Modal/
│   │   │   │   └── Modal.jsx
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.jsx
│   │   │   ├── Notification/
│   │   │   │   └── NotificationIndicator.jsx
│   │   │   ├── PasswordStrength/
│   │   │   │   └── PasswordStrength.jsx
│   │   │   ├── ProfileDropdown/
│   │   │   │   └── ProfileDropdown.jsx
│   │   │   ├── ProtectedRoutes/
│   │   │   │   ├── SuperAdminRoute.jsx
│   │   │   │   └── UserRoute.jsx
│   │   │   └── ScrollToTop/
│   │   │       ├── ScrollToTop.jsx
│   │   │       └── ScrollToTopButton.jsx
│   │   ├── Hooks/
│   │   │   ├── useAxiosInstance.jsx
│   │   │   └── useNavigationWithLoader.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── About/
│   │   │   │   └── About.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── ForgetPassword/
│   │   │   │   │   └── ForgetPassword.jsx
│   │   │   │   ├── Login/
│   │   │   │   │   └── Login.jsx
│   │   │   │   ├── Register/
│   │   │   │   │   └── Register.jsx
│   │   │   │   ├── ResetPassword/
│   │   │   │   │   └── ResetPassword.jsx
│   │   │   │   ├── VerifyEmail/
│   │   │   │   │   └── VerifyEmail.jsx
│   │   │   │   └── VerifyOTP/
│   │   │   │       ├── VerifyEmailOTP.jsx
│   │   │   │       └── VerifyPasswordOTP.jsx
│   │   │   ├── Community/
│   │   │   │   └── CommunityProfile.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.jsx.bak
│   │   │   ├── Events/
│   │   │   │   ├── DeletionRequests.jsx
│   │   │   │   ├── EventDetail.jsx
│   │   │   │   ├── Events.jsx
│   │   │   │   └── SuperAdminEvents.jsx
│   │   │   ├── Home/
│   │   │   │   └── Home.jsx
│   │   │   ├── Legal/
│   │   │   │   ├── PrivacyPolicy.jsx
│   │   │   │   └── TermsAndConditions.jsx
│   │   │   ├── Messages/
│   │   │   │   └── Messages.jsx
│   │   │   ├── Notifications/
│   │   │   │   └── Notifications.jsx
│   │   │   ├── Profile/
│   │   │   │   ├── Profile.css
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── UserProfileEdit.css
│   │   │   │   └── UserProfileEdit.jsx
│   │   │   ├── Reports/
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── Reports.jsx.bak
│   │   │   │   └── SuperAdminReports.jsx
│   │   │   └── SuperAdmin/
│   │   │       ├── DeletionRequests.jsx
│   │   │       ├── Permissions.jsx
│   │   │       ├── SuperApp.css
│   │   │       └── SuperApp.jsx
│   │   ├── socket.js
│   │   └── utils/
│   │       ├── toast.js
│   │       └── validationSchemas.js
│   ├── vercel.json
│   └── vite.config.js
├── README.md
└── test-url.html

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pranav-gujar/OrbitWCE.git
   cd OrbitWCE
   ```

2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../Frontend
   npm install
   ```

4. Set up environment variables in Backend:
   - Create a `.env` file in the Backend directory with the following variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     ACCESS_TOKEN=your_jwt_secret
     REFRESH_TOKEN=
     ACCESS_TOKEN_EXPIRES_IN=
     REFRESH_TOKEN_EXPIRES_IN=
     EMAIL_USER=your_email
     EMAIL_PASS=your_email_password
     CLIENT_URL=http://localhost:5173/
     PORT=3000
     ```
5. Set up environment variables in Frontend:
```
     VITE_API_URL=http://localhost:3000

     
```
### Running the Application

1. Start the backend server:
   ```bash
   cd Backend
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.


4. Admin Credintial Update Script:
```
node scripts/seedSuperAdmin.js
```

## 📄 API Documentation

API documentation is available at `/api-docs` when running the development server.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)

