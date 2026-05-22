# BuildPro - Construction Materials E-Commerce Application

BuildPro is a premium, full-stack e-commerce web application designed for buying and selling construction materials. The application is built using a Java Spring Boot backend and a React + Vite frontend.

---

## 📂 Project Directory Structure

```text
E-commerce-Website-for-Construction-Materials/
├── .env                              # Environment configuration (DB, API Keys, etc.)
├── pom.xml                           # Maven dependencies and build configuration
├── README.md                         # Project setup & deployment documentation
├── src/                              # Spring Boot Backend Source Code
│   ├── main/
│   │   ├── java/com/example/buildpro/
│   │   │   ├── config/               # Security, MVC, and Filter Configurations
│   │   │   ├── controller/           # REST & MVC Controllers (CORS-free, globally handled)
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── model/                # JPA Database Entities
│   │   │   ├── repository/           # Spring Data JPA Repositories
│   │   │   └── service/              # Core Business Logic & Third-Party Integrations
│   │   └── resources/
│   │       ├── templates/            # Thymeleaf templates (for admin/MVC views)
│   │       └── application.properties # Spring configuration loader
├── frontend/                         # React Frontend Source Code
│   ├── src/
│   │   ├── components/               # Reusable UI Components
│   │   ├── context/                  # Auth and State Management Contexts
│   │   ├── main.jsx                  # React Entry point (dynamic Production Axios routing)
│   │   └── App.jsx                   # Main layout and routing table
│   ├── package.json                  # Node.js dependencies and scripts
│   ├── vite.config.js                # Vite dev server and proxy config
│   └── README.md                     # Frontend specific notes
```

---

## 🛠️ Environment Configuration (`.env`)

The backend loads configuration values dynamically using `spring-dotenv`. Create a `.env` file in the **project root directory** with the following keys:

```ini
# Database Settings
DB_URL=jdbc:mysql://localhost:3306/buildpro_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password

# Email Settings (for registration and OTP verification)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password

# Swagger OpenAPI Docs Settings
API_DOCS_PATH=/v3/api-docs
SWAGGER_UI_PATH=/swagger-ui.html
SWAGGER_TAG_SORTER=alpha
SWAGGER_OPERATION_SORTER=alpha

# Third-Party API Keys
GEMINI_API_KEY=your_google_gemini_api_key
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

---

## 🚀 Local Setup & Running Instructions

### 1. Database Setup
1. Ensure MySQL is running on your machine.
2. The backend is configured to automatically create the database `buildpro_db` if it does not exist (see `DB_URL` configuration above).

### 2. Running the Backend (Spring Boot)
Open a terminal in the root directory:
```bash
# Compile and package the application
mvn clean compile

# Run the Spring Boot application
mvn spring-boot:run
```
The backend server runs on **port `8081`** by default.

### 3. Running the Frontend (React + Vite)
Open a separate terminal, navigate to the `frontend/` directory, and run:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the local development server
npm run dev
```
The frontend dev server runs on **port `5173`** and uses a Vite proxy to forward API requests to the backend.

---

## 🌐 CORS & Connection Architecture

The application is designed to support seamless communication between the client and server across different environments:

1. **Global CORS Handling**:
   CORS is managed globally at the application level in `WebConfig.java` and `SecurityConfig.java`. 
   - Wildcards are allowed dynamically using `.allowedOriginPatterns("*")`.
   - Credentials (cookies, Authorization headers, session cookies) are enabled globally with `.allowCredentials(true)`.
   - *Note*: Individual `@CrossOrigin` annotations on controllers have been removed to avoid runtime origin conflicts with credential permissions.

2. **Axios Client Setup (`main.jsx`)**:
   Axios is configured to dynamically route API calls depending on the environment:
   ```javascript
   axios.defaults.withCredentials = true;
   axios.defaults.baseURL = import.meta.env.PROD 
     ? `http://${window.location.hostname}:8081` 
     : '';
   ```
   - **In Development**: Requests use relative paths (e.g. `/api/auth/me`) which are proxied via the Vite server on port `5173` to `http://localhost:8081`.
   - **In Production**: Requests are automatically prefixed with the client's hostname and port `8081` (e.g., `http://100.31.92.229:8081`), ensuring direct communication with the backend.

---

## 🚢 Deployment Guide (EC2 & Production)

To deploy the application to a production server (such as AWS EC2):

### 1. Build and Package the Backend
In the project root, run:
```bash
mvn clean package -DskipTests
```
This generates a runnable JAR inside the `target/` directory:
- `target/buildpro-0.0.1-SNAPSHOT.jar`

Copy this JAR to the server, ensure a `.env` file containing production credentials is in the same directory as the JAR, and run:
```bash
java -jar buildpro-0.0.1-SNAPSHOT.jar
```

### 2. Build and Deploy the Frontend
In the `frontend/` directory, run:
```bash
npm run build
```
This compiles the React assets into the `frontend/dist/` directory.

Copy the contents of `dist/` to the static files directory of your web server (e.g. `/var/www/html` for Nginx or Apache) on your EC2 instance.
Nginx should be configured to serve these static files on **port `80`**.
