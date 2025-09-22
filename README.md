# SkillWorker - Professional Service Platform

<div align="center">
  <img src="SkillWorker_FrontEnd/assets/icons/SkillWorker_logo.png" alt="SkillWorker Logo" width="120" height="120">

  <p align="center">
    <strong>Connecting skilled workers with clients across Sri Lanka</strong>
  </p>

  <p align="center">
    <a href="#demo">🎥 Demo Video</a> •
    <a href="#features">✨ Features</a> •
    <a href="#setup">🚀 Setup</a> •
    <a href="#technologies">💻 Technologies</a>
  </p>
</div>

---

## 📖 Project Description

**SkillWorker** is a comprehensive web-based platform that bridges the gap between skilled service providers and clients seeking professional services. The platform enables workers to showcase their expertise, manage their service offerings, and connect with potential clients, while providing clients with an intuitive interface to discover, evaluate, and hire trusted professionals.

### 🎯 Key Objectives
- **For Workers**: Create professional profiles, manage service advertisements, handle subscriptions, and build client relationships
- **For Clients**: Discover skilled professionals, browse services by category and location, read reviews, and hire with confidence
- **For Administrators**: Comprehensive platform management, user oversight, subscription handling, and analytics

### 🌟 Problem Solved
SkillWorker addresses the challenge of finding reliable skilled workers in Sri Lanka by providing a centralized, verified platform where quality service providers can connect with clients efficiently and securely.

---

## 📸 Screenshots

### 🏠 Login Page
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/login.png" alt="SkillWorker Homepage" width="800">
  <p><em>Modern landing page with service discovery and top-rated professionals</em></p>
</div>

### 👷‍♂️ Worker Dashboard
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/worker-dash.png" alt="Worker Dashboard" width="800">
  <p><em>Comprehensive dashboard for workers to manage profiles, services, and analytics</em></p>
</div>

### 👨‍💼 Home Page
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/client-dash.png" alt="Client Dashboard" width="800">
  <p><em>Interactive client interface with service search and location-based filtering</em></p>
</div>

### 🛡️ Admin Panel
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/admin-dash.png" alt="Admin Dashboard" width="800">
  <p><em>Advanced administrative controls for platform management</em></p>
</div>

### 📱 Profile Management
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/profile-manage.png" alt="Worker Profile" width="800">
  <p><em>Rich profile creation and management interface</em></p>
</div>

### 💳 Subscription Plans
<div align="center">
  <img src="SkillWorker_BackEnd/src/main/resources/static/subscription.png" alt="Subscription Plans" width="800">
  <p><em>Flexible subscription tiers with PayHere payment integration</em></p>
</div>

---

## ✨ Features

### 🔐 Authentication & Security
- **Multi-role Authentication**: Secure login for Workers, Clients, and Administrators
- **JWT Token Management**: Automatic token refresh and session management
- **Google OAuth Integration**: Quick social authentication
- **Role-based Access Control**: Granular permissions system

### 👷‍♂️ Worker Features
- **Profile Management**: Comprehensive profile creation with skills, experience, and portfolio
- **Service Advertisement**: Create and manage service listings with pricing
- **Subscription Plans**: Free, Pro, and Premium tiers with different privileges
- **Review System**: Receive and manage client reviews and ratings
- **Dashboard Analytics**: Track profile views, service performance, and earnings

### 👨‍💼 Client Features
- **Service Discovery**: Browse services by category, location, and ratings
- **Advanced Filtering**: Search with multiple criteria and location mapping
- **Worker Profiles**: View detailed worker information, reviews, and portfolios
- **Booking System**: Direct contact and service booking
- **Interactive Maps**: Location-based service provider discovery

### 🛡️ Admin Features
- **User Management**: Comprehensive user oversight and account management
- **Content Moderation**: Review and approve service listings and profiles
- **Subscription Management**: Monitor and manage subscription plans and payments
- **Analytics Dashboard**: Platform statistics, user metrics, and revenue tracking

### 🔧 Technical Features
- **Real-time Updates**: Dynamic content loading and updates
- **File Upload**: Cloudinary integration for image management
- **Payment Processing**: PayHere payment gateway integration
- **Chat Functionality**: Real-time communication between clients and workers


---

## 💻 Technologies Used

### Backend (Spring Boot)
- **Framework**: Spring Boot v3.5.3
- **Security**: Spring Security with JWT refresh tokens
- **Database**: MySQL with JPA/Hibernate
- **Authentication**: OAuth 2.0 (Google)
- **File Storage**: Cloudinary
- **Payment**: PayHere Gateway
- **Email**: JavaMailSender (Gmail SMTP)


### Frontend
- **Framework**: Vanilla JavaScript with jQuery
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: Font Awesome 6
- **Maps**: Custom Sri Lanka district mapping
- **Notifications**: SweetAlert2
- **HTTP Client**: Axios + jQuery AJAX

### Development & Deployment
- **Build Tool**: Maven
- **Version Control**: Git
- **Environment**: Development profiles
- **Testing**: JUnit 5

---

## 🚀 Setup Instructions

### 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Java 21+** (JDK)
- **Maven 3.6+**
- **MySQL 8.0+**
- **Git**


## 🔧 SkillWorker Configuration Setup

### 1. Environment Configuration
Before running the application, you need to set up your environment variables or create a local configuration file.

#### Option A: Environment Variables (Recommended)
Set these environment variables in your system or IDE:
```
JWT_SECRET=your_actual_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
```

#### Option B: Local Properties File
1. Copy `application-template.properties` to `application-local.properties`
2. Replace all placeholder values with your actual credentials
3. Run with profile: `--spring.profiles.active=local`

### 2. Recent Fixes Applied

✅ **Bean Conflict Resolved**: Fixed duplicate `passwordEncoder` bean definition between `SecurityConfig` and `AppConfig`

✅ **Git Security**: Removed sensitive OAuth credentials from version control

### 3. Running the Application

#### Using IDE:
- Set environment variables in your IDE run configuration
- Run `SkillWorkerApplication.java`

#### Using Command Line:
```bash
# Set environment variables first, then:
./mvnw spring-boot:run
```

### 4. Database Setup
Ensure MySQL is running with:
- Database: `skill_worker_db` (auto-created)
- Username: `root`
- Password: `mysql`

## 🔒 Security Notes
- Never commit real OAuth credentials to Git
- Use environment variables or encrypted configuration in production
- The `application-template.properties` shows the required configuration structure


#### Option B: Local Properties File

1. **Copy Template**:
```bash
cd SkillWorker_BackEnd/src/main/resources
cp application-template.properties application-local.properties
```

2. **Configure Properties**:
    - Edit `application-local.properties`
    - Replace all placeholder values with your actual credentials

3. **Run with Local Profile**:
```bash
./mvnw spring-boot:run -Dspring.profiles.active=local
```

### 🔑 Third-Party Service Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
    - `http://localhost:8080/oauth2/callback/google`
    - `http://localhost:3000/oauth2/callback/google` (for frontend)

#### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Configure upload presets if needed

#### PayHere Setup
1. Register at [PayHere](https://www.payhere.lk/)
2. Get Merchant ID and Merchant Secret
3. Configure webhook URLs for payment notifications

### 🏃‍♂️ Running the Application

#### Backend (Spring Boot)

1. **Clone Repository**:
```bash
git clone https://github.com/yourusername/skillworker.git
cd skillworker/SkillWorker_BackEnd
```

2. **Install Dependencies**:
```bash
./mvnw clean install
```

3. **Run Application**:
```bash
# Using Maven
./mvnw spring-boot:run

# Or using IDE
# Run SkillWorkerApplication.java main method
```

4. **Verify Backend**:
    - Backend will start on: `http://localhost:8080`
    - Health Check: `http://localhost:8080/actuator/health`

#### Frontend

1. **Navigate to Frontend**:
```bash
cd ../SkillWorker_FrontEnd
```

2. **Serve Frontend**:

   **Live Server (VS Code)**
    - Install Live Server extension
    - Right-click on `index.html` → "Open with Live Server"

3. **Access Application**:
    - Frontend: `http://localhost:5500`
    - Login with demo credentials or create new account

### 🧪 Testing the Setup

1. **Backend Health Check**:
```bash
curl http://localhost:8080/actuator/health
```

2. **API Test**:
```bash
curl http://localhost:8080/api/v1/auth/test
```

3. **Frontend Test**:
    - Open browser to `http://localhost:3000`
    - Check browser console for any errors
    - Test user registration and login

### 🔧 Development Setup

#### Hot Reload (Development Mode)

**Backend**:
```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"
```

**Frontend**:
- Use Live Server for instant reload
- Configure proxy for API calls during development

#### Database Seeding (Optional)

1. **Run Application** (creates tables)
2. **Access Admin Panel** at `http://localhost:3000/pages/admin-dashboard.html`
3. **Create Categories and Locations** through admin interface
4. **Register Test Users** for different roles

### 🐛 Troubleshooting

#### Common Issues

1. **Database Connection Error**:
    - Verify MySQL is running
    - Check database credentials
    - Ensure database exists

2. **JWT Secret Error**:
    - Ensure JWT_SECRET is at least 256 bits (32 characters)
    - Use base64 encoded string for production

3. **CORS Issues**:
    - Verify frontend URL in CORS configuration
    - Check browser network tab for blocked requests

4. **File Upload Issues**:
    - Verify Cloudinary credentials
    - Check upload preset configuration

#### Log Locations

- **Application Logs**: Console output or configured log files
- **Error Logs**: Check Spring Boot startup console
- **Browser Console**: For frontend JavaScript errors

---

## 🎥 Demo Video

Watch our comprehensive demo showcasing all features of the SkillWorker platform:

**🔗 [SkillWorker - Professional Service Platform Demo](https://youtu.be/your-demo-video-id)**

### Demo Highlights:
- 👤 User registration and authentication
- 🏠 Platform overview and navigation
- 👷‍♂️ Worker profile creation and management
- 📝 Service listing and management
- 👨‍💼 Client service discovery
- 💳 Subscription plans and payment processing
- 🛡️ Admin panel and platform management

---

## 📁 Project Structure

```
SkillWorker/
├── SkillWorker_BackEnd/                 # Spring Boot Application
│   ├── src/main/java/                   # Java Source Code
│   │   └── lk/ijse/skillworker_backend/
│   │       ├── config/                  # Configuration Classes
│   │       ├── controller/              # REST Controllers
│   │       ├── dto/                     # Data Transfer Objects
│   │       ├── entity/                  # JPA Entities
│   │       ├── exception/               # Exception Handlers
│   │       ├── repository/              # Data Repositories
│   │       ├── service/                 # Business Logic
│   │       └── util/                    # Utility Classes
│   ├── src/main/resources/              # Resources
│   │   ├── application.properties       # Main Configuration
│   │   └── application-template.properties
│   └── pom.xml                          # Maven Dependencies
│
├── SkillWorker_FrontEnd/                # Frontend Application
│   ├── pages/                           # HTML Pages
│   │   ├── admin-dashboard.html         # Admin Interface
│   │   ├── worker-dashboard.html        # Worker Dashboard
│   │   ├── client-dashboard.html        # Client Dashboard
│   │   └── ...                          # Other Pages
│   ├── js/                              # JavaScript Files
│   │   ├── util/                        # Utility Scripts
│   │   │   ├── tokenRefreshHandler.js   # JWT Management
│   │   │   └── logoutHandler.js         # Logout Functionality
│   │   └── ...                          # Page-specific Scripts
│   ├── css/                             # Stylesheets
│   ├── assets/                          # Static Assets
│   └── index.html                       # Landing Page
│
└── docs/                                # Documentation
    └── screenshots/                     # Project Screenshots
```

---

## 👥 User Roles & Permissions

### 🛡️ Administrator
- Full platform management access
- User account management
- Content moderation and approval
- Subscription and payment oversight
- Analytics and reporting
- System configuration

### 👷‍♂️ Worker
- Profile creation and management
- Service listing and advertisement
- Subscription plan management
- Client communication
- Review and rating management
- Dashboard analytics

### 👨‍💼 Client
- Service discovery and search
- Worker profile viewing
- Review and rating submission

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **OAuth 2.0 Integration**: Google social login
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Secure cross-origin requests
- **Password Encryption**: BCrypt password hashing
- **Session Management**: Automatic token refresh

---

### Key API Endpoints:

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Token refresh

#### Workers
- `GET /api/v1/worker/top-rated` - Get top-rated workers
- `POST /api/v1/worker/register` - Worker registration
- `PUT /api/v1/worker/update/{id}` - Update worker profile

#### Services
- `GET /api/v1/ads/getall` - Get all service listings
- `POST /api/v1/ads/create` - Create service listing
- `PUT /api/v1/ads/update/{id}` - Update service listing

---

## 📝 Contributing

We welcome contributions to the SkillWorker platform! Please follow these guidelines:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Commit Changes**: `git commit -m 'Add some feature'`
4. **Push to Branch**: `git push origin feature/your-feature-name`
5. **Open Pull Request**

### Development Guidelines:
- Follow Java coding conventions
- Write comprehensive tests
- Ensure responsive design
- Test across multiple browsers

---

## 📞 Support & Contact

For support, questions, or contributions:

- **Email**: skillworker@team.gmail.com
- **Developer**: Lithira Jayanaka
- **LinkedIn**: [LinkedIn Profile](https://linkedin.com/in/LithiraJayanaka)
- **GitHub**: [GitHub Profile](https://github.com/LithiraJK)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spring Boot Community** for the excellent framework
- **Bootstrap Team** for the responsive UI components
- **Font Awesome** for the comprehensive icon library
- **Cloudinary** for reliable image management
- **PayHere** for secure payment processing
- **Sri Lanka Tech Community** for inspiration and support

---

<div align="center">
  <p><strong>Built with ❤️ for the Sri Lankan professional community</strong></p>
  <p>© 2025 SkillWorker. All rights reserved.</p>
</div>
