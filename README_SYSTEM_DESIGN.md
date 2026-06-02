# System Design & Architecture: BuildPro Construction Materials E-Commerce Application

This document outlines the architecture, database schema, component design, core workflows, and key technical design decisions for **BuildPro**—a full-stack e-commerce marketplace dedicated to buying and selling construction materials.

---

## 1. High-Level Architecture

BuildPro is built upon a modern, distributed **Three-Tier Architecture** consisting of a single-page React frontend, a RESTful Spring Boot backend, and a relational MySQL database, augmented with intelligent cloud integrations (Google Gemini AI, Razorpay Payment Gateway, Mapbox & OpenStreetMap Geocoding).

```mermaid
graph TD
    subgraph Client Tier [Presentation Tier - React & Vite]
        A[User/Admin Web Browser] -->|User Interaction| B[React SPA Components]
        B -->|Client-Side Routing| C[React Router DOM v7]
        B -->|HTTP Requests / Credentials| D[Axios API Client]
    end

    subgraph App Tier [Application Tier - Spring Boot & Spring Security]
        E[Spring Security Filter Chain] -->|Interceptors & JWT Filter| F[REST & MVC Controllers]
        F -->|Auth Requests| G[AuthService / UserDetailsService]
        F -->|Product Catalog / Orders| H[ProductService / OrderService / ReportsService]
        F -->|Third-Party Integrations| I[Third-Party Service Layer]
        
        I -->|REST Client| J[Google Gemini API]
        I -->|Razorpay SDK| K[Razorpay Payment API]
        I -->|Reverse Geocoding| L[OSM Nominatim / Mapbox APIs]
    end

    subgraph Data Tier [Storage Tier - MySQL]
        M[(MySQL Database)]
    end

    D <==>|Stateless JSON REST API / CORS / Cookies| E
    G & H & I <==>|Hibernate ORM / Spring Data JPA| M
```

---

## 2. Directory Structure & Component Design

The project is structured to separate concerns between frontend logic and backend services.

```text
E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/
├── pom.xml                                 # Maven backend dependency and build configuration
├── .env                                    # Centralized backend environment secrets
├── README.md                               # Project quickstart & deployment guide
├── README_SYSTEM_DESIGN.md                 # System architecture & database schema (This file)
├── src/                                    # Spring Boot Backend Source Code
│   └── main/
│       ├── java/com/example/buildpro/
│       │   ├── config/                     # Spring Security, Web MVC CORS, and JWT configurations
│       │   ├── controller/                 # REST & MVC controllers handling client endpoints
│       │   ├── dto/                        # Data Transfer Objects decoupled from JPA entities
│       │   ├── exception/                  # Global exceptions and custom error handlers
│       │   ├── model/                      # JPA Database Entities (User, Product, Order, etc.)
│       │   ├── repository/                 # Spring Data JPA data access interfaces
│       │   ├── service/                    # Business services and AI/Payment/Geolocation integrations
│       │   └── util/                       # Cryptographic, JWT token, and math utilities
│       └── resources/
│           ├── templates/                  # Thymeleaf HTML files for MVC/Admin views
│           └── application.properties       # Core Spring Boot properties loader
│
└── frontend/                               # React + Vite Frontend Codebase
    ├── package.json                        # Frontend dependencies (React 19, Axios, Tailwind CSS v4)
    ├── vite.config.js                      # Vite server configs and API dev proxies
    ├── src/
    │   ├── main.jsx                        # Entry point setting up base Axios routes and globals
    │   ├── App.jsx                         # App layout, global State Contexts, and routing table
    │   ├── index.css                       # Global styles and Tailwind utility injections
    │   ├── context/                        # Context API for user authentication and state
    │   ├── utils/                          # Frontend helpers and Axios wrapper configurations
    │   └── components/                     # Component modules
    │       ├── admin/                      # Admin-specific modules (Dashboard, lists, forms)
    │       ├── common/                     # Shared UI components (Navbar, Footer, Modals)
    │       └── [ViewName].jsx              # View components (Cart, Checkout, Home, ProductDetail, etc.)
```

---

## 3. Database Schema & Entity-Relationship Diagram (ERD)

BuildPro stores all operational data in a MySQL database. Database entities are mapped through Hibernate ORM. Relational integrity is enforced using foreign keys, cascading configurations, and custom index constraints.

```mermaid
erDiagram
    users {
        bigint id PK
        string email UK
        string password "BCrypt Hash"
        string name
        enum role "USER | ADMIN"
        tinyint is_verified "0 | 1"
        timestamp created_at
        timestamp updated_at
    }

    pending_registrations {
        string email PK
        string encoded_password
        string name
        enum role "USER | ADMIN"
        string otp_code
        datetime expires_at
    }

    otp_codes {
        bigint id PK
        bigint user_id FK
        string otp_code
        enum purpose "REGISTRATION | PASSWORD_RESET"
        datetime expires_at
        timestamp created_at
    }

    refresh_tokens {
        bigint id PK
        bigint user_id FK
        string token
        datetime expiry_date
    }

    categories {
        bigint id PK
        string name UK
        text description
        string image_url
        timestamp created_at
    }

    products {
        bigint id PK
        bigint category_id FK
        string name
        string brand
        text description
        double price
        int stock_quantity
        string image_url
        json specifications "JSON attributes"
        timestamp created_at
        timestamp updated_at
    }

    carts {
        bigint id PK
        bigint user_id FK "1-to-1 UK"
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        int quantity
        timestamp added_at
    }

    addresses {
        bigint id PK
        bigint user_id FK
        string name
        string phone
        string address_line1
        string address_line2
        string city
        string state
        string postal_code
        string country "India"
        double latitude
        double longitude
        tinyint is_default "0 | 1"
        timestamp created_at
    }

    orders {
        bigint id PK
        bigint user_id FK
        bigint address_id FK
        double total_amount
        double delivery_charge
        double discount_amount
        double final_amount
        enum status "PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED"
        timestamp order_date
        timestamp delivery_date
        string payment_method "COD | ONLINE"
        string payment_id
        string order_number
    }

    order_items {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        double price
        double subtotal
    }

    wallets {
        bigint id PK
        bigint user_id FK "1-to-1 UK"
        double balance
        timestamp created_at
        timestamp updated_at
    }

    wallet_transactions {
        bigint id PK
        bigint wallet_id FK
        double amount
        enum type "CREDIT | DEBIT"
        string description
        bigint reference_id "order_id | transfer_id"
        timestamp created_at
    }

    complaints {
        bigint id PK
        bigint user_id FK
        bigint order_id FK
        bigint product_id FK "nullable"
        string issue_type
        string description "Length 1000"
        enum status "PENDING | IN_REVIEW | RESOLVED | REJECTED"
        timestamp complaint_date
        string admin_response
    }

    users ||--o{ addresses : "registers"
    users ||--|| carts : "owns"
    users ||--|| wallets : "controls"
    users ||--o{ orders : "places"
    users ||--o{ complaints : "files"
    users ||--o{ otp_codes : "receives"
    users ||--o{ refresh_tokens : "requests"
    
    categories ||--o{ products : "groups"
    carts ||--o{ cart_items : "contains"
    products ||--o{ cart_items : "added_to"
    
    addresses ||--o{ orders : "ships_to"
    orders ||--o{ order_items : "composed_of"
    products ||--o{ order_items : "purchased_in"
    orders ||--o{ complaints : "references"
    products ||--o{ complaints : "targets"
    
    wallets ||--o{ wallet_transactions : "logs"
```

---

## 4. Key Workflows & System Workings

### 4.1. Double-Opt-In User Registration & OTP Validation
To ensure high-quality user credentials, self-registration employs a temporary staging phase prior to database persistence.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant FE as React Frontend
    participant BE as Spring Boot Backend
    participant DB as MySQL Database
    participant SMTP as SMTP Mail Server

    User->>FE: Inputs Registration (Name, Email, Password, Role)
    FE->>BE: POST /api/auth/register (JSON Payload)
    Note over BE: Validates fields & checks if email already in users table
    BE->>BE: Hashes password (BCrypt) & Generates 6-Digit OTP Code
    BE->>DB: INSERT into pending_registrations (expiry: 15m)
    BE->>SMTP: Trigger Email with OTP Code
    SMTP-->>User: Delivers Verification Email
    BE-->>FE: HTTP 200 OK (OTP Sent to Email)
    FE->>User: Renders OTP Verification Page

    User->>FE: Enters 6-Digit OTP Code
    FE->>BE: POST /api/auth/registration-verification (Email, OTP)
    BE->>DB: SELECT from pending_registrations WHERE email=?
    DB-->>BE: Staged User data & OTP
    Note over BE: Validates OTP match and expiration window
    BE->>DB: INSERT into users (is_verified = 1)
    BE->>DB: INSERT into carts (empty container)
    BE->>DB: INSERT into wallets (initial balance = 0.0)
    BE->>DB: DELETE from pending_registrations WHERE email=?
    BE-->>FE: HTTP 201 Created (Registration Successful)
    FE->>User: Redirects to /login
```

### 4.2. Intelligent Semantic Product Search (Gemini API Integration)
BuildPro utilizes natural language models to process search requests, making search results highly semantic and tolerant of phrasing variations.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant FE as React Frontend
    participant BE as Spring Boot Backend
    participant GemService as GeminiSearchService
    participant GemAPI as Google Gemini API
    participant DB as MySQL Database

    User->>FE: Types search phrase (e.g. "strong cement for foundation")
    FE->>BE: GET /products/search?query=...
    BE->>DB: SELECT * FROM products (Get active catalog)
    DB-->>BE: Catalog List (ProductDTO items)
    BE->>GemService: searchProducts(query, productsCatalog)
    Note over GemService: Serializes catalog to JSON & prepares semantic prompt
    GemService->>GemAPI: POST /models/gemini-2.5-flash:generateContent?key=...
    Note over GemAPI: Matches queries & ranks product IDs
    GemAPI-->>GemService: Raw JSON Array (e.g., "[3, 1, 8]")
    GemService-->>BE: Ordered List of matching Product IDs [3, 1, 8]
    BE->>DB: SELECT * FROM products WHERE id IN (3, 1, 8)
    DB-->>BE: Full product entities
    BE->>BE: Sorts database results by Gemini's matching rank order
    BE-->>FE: Return sorted Product list (JSON)
    FE->>User: Renders semantically matched products
```

### 4.3. Interactive AI Shop Assistant (Gemini Navigation Chatbot)
The assistant helps users find products, navigate pages, and resolve queries by acting on navigation directives.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant FE as React Frontend
    participant BE as Spring Boot Backend
    participant GemService as GeminiService
    participant GemAPI as Google Gemini API

    User->>FE: Type message (e.g. "nenu cart chudali" / "show me the checkout")
    FE->>BE: POST /api/chat (Payload: "message")
    BE->>GemService: getChatResponse(userMessage)
    Note over GemService: Wraps message in System Rules Prompt.<br/>Rules require detecting local languages/transliterations (like Hinglish, transliterated Telugu),<br/>translating intent to app routes, and embedding navigation tags.
    GemService->>GemAPI: POST /models/gemini-2.5-flash:generateContent
    GemAPI-->>GemService: "Sure, let me take you to your shopping cart! [[NAVIGATE: /cart]]"
    GemService-->>BE: Response String
    BE-->>FE: HTTP 200 OK (Response JSON)
    Note over FE: Regular expression check parses [[NAVIGATE: <url>]]
    FE->>FE: React Router DOM executes programmatic redirect to /cart
    FE->>User: Displays Cart page + conversational text answer
```

### 4.4. Accurate Indian Reverse Geocoding Integration
BuildPro provides a location-detection button that reverse-geocodes GPS coordinates into formatted Indian addresses.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant FE as React Frontend
    participant BE as Spring Boot Backend
    participant LocService as IndianLocationService
    participant OSM as OpenStreetMap Nominatim
    participant Mapbox as Mapbox Places API

    User->>FE: Clicks "Detect Current Location"
    FE->>FE: Navigator.geolocation extracts (latitude, longitude)
    FE->>BE: GET /api/location/address?latitude=...&longitude=...
    BE->>LocService: getAddressFromCoordinates(lat, lon)
    
    alt Route 1: Try OSM Nominatim (Filtered for India only)
        LocService->>OSM: GET /reverse?format=json&lat=...&lon=...&countrycodes=in
        OSM-->>LocService: Address JSON
        Note over LocService: Validates state and 6-digit Indian PIN Code format
    end

    alt Route 2 (Fallback): Try Mapbox API (If OSM fails)
        LocService->>Mapbox: GET /geocoding/v5/mapbox.places/...&country=IN
        Mapbox-->>LocService: Address JSON
    end
    
    Note over LocService: Converts nested administrative keys to standard: Line1, City, State, Pin Code
    LocService-->>BE: Clean Address Map
    BE-->>FE: JSON Address Object
    FE->>User: Autofills Address Forms with formatted details
```

### 4.5. Cart Checkout & Razorpay Payment Lifecycle
Supports cash-on-delivery (COD) and secure payment validation using signature checks.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant FE as React Frontend
    participant BE as Spring Boot Backend
    participant RPaySDK as Razorpay API Client
    participant DB as MySQL Database

    User->>FE: Clicks "Pay Online"
    FE->>BE: POST /payment/create-razorpay-order?userId=...
    Note over BE: Computes Total + 5% delivery charge - 15% discount (if >1000 INR)
    BE->>RPaySDK: Instantiate Razorpay Order (Paise conversion)
    RPaySDK-->>BE: Razorpay Order ID
    BE-->>FE: Order details (keyId, orderId, amount)
    FE->>User: Opens Razorpay Native Payment Modal
    User->>FE: Completes Payment Transaction
    FE->>BE: POST /payment/process (userId, addressId, "online", paymentId, orderId, signature)
    Note over BE: HMAC-SHA256 verification: computes signature using (orderId + "|" + paymentId) + local Secret
    
    alt Verification Success
        BE->>DB: INSERT into orders (status = 'CONFIRMED', payment_id = paymentId)
        BE->>DB: INSERT into order_items (copy from cart)
        BE->>DB: DELETE from cart_items (clears cart)
        BE-->>FE: Return JSON success response
        FE->>User: Shows "Payment Successful" receipt screen
    else Verification Failed
        BE-->>FE: Return HTTP 400 Bad Request
        FE->>User: Shows Payment failure warning
    end
```

---

## 5. Architectural Design Patterns & Principles

### 5.1. Stateless JWT Token Authentication
The system uses **Spring Security** combined with a custom filter to handle JSON Web Tokens (JWT) in a stateless setup, which eliminates the need for HTTP sessions.
- **`JwtAuthenticationFilter.java`**: Extracts the bearer token from incoming HTTP authorization headers (or HTTP-only cookies), validates the token signature, checks expiration, parses user details, and sets the Security context.
- **Stateless Session Policy**: Configured in `SecurityConfig.java` to prevent session creation on the server:
  `SessionCreationPolicy.STATELESS`.
- **CORS Policies**: Explicitly defined to permit credentials (`allowCredentials(true)`) for production and local environments (`http://localhost:5173`) while preventing duplicate origin errors.

### 5.2. Separation of Concerns (SoC) via Controllers and DTOs
- Database models (JPA `@Entity` classes) are decoupled from network transfer payloads to prevent performance issues (like infinite recursion in Hibernate relationships) and ensure data security.
- Data Transfer Objects (DTOs), such as `ProductDTO.java` and `OrderDTO.java`, carry structured fields between API endpoints.
- Thymeleaf controllers (handling administrative views under `/admin/**`) and RESTful Controllers (`/api/**`) are separated to partition web routing from client JSON endpoints.

### 5.3. Defensive Transactional Wallet Management
The application implements internal wallet features (`Wallet.java`) to log credit/debit transaction records (`WalletTransaction.java`). Wallet updates are marked as transactional (`@Transactional`) to prevent balance drift during checkout or refunds.

### 5.4. Geocoding Resiliency Pattern
The `IndianLocationService.java` reverse-geocodes locations through a cascading backup pattern:
$$\text{OSM Nominatim} \longrightarrow \text{Here Maps} \longrightarrow \text{Mapbox API} \longrightarrow \text{Google Geocoding} \longrightarrow \text{Internal Geolocation Fallback}$$
This sequence ensures reliability even if third-party APIs encounter outages or quota limits.

---

## 6. Recommendations for Scaling & Deployment

### 6.1. Containerization (Docker Architecture Setup)
To deploy BuildPro consistently, containerize the application using the following Docker setup:

```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    container_name: buildpro-db
    restart: always
    environment:
      MYSQL_DATABASE: buildpro_db
      MYSQL_ROOT_PASSWORD: root_production_password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: buildpro-backend
    restart: always
    ports:
      - "8081:8081"
    environment:
      - DB_URL=jdbc:mysql://database:3306/buildpro_db?useSSL=false&allowPublicKeyRetrieval=true
      - DB_USERNAME=root
      - DB_PASSWORD=root_production_password
    depends_on:
      - database

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: buildpro-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db_data:
```

### 6.2. Production Scaling Improvements
1. **Flyway/Liquibase Migrations**: Replace automatic Hibernate schema updates (`spring.jpa.hibernate.ddl-auto=update`) with tool-managed migrations like Flyway to track database changes safely in production.
2. **Distributed Cache (Redis)**: Cache slow operations, such as Gemini semantic searches and product catalog lookups, in a Redis instance to reduce external API costs and database read volume.
3. **Connection Pooling**: Tweak HikariCP database pool parameters (`maximum-pool-size`, `minimum-idle`) in `application.properties` to handle increased backend transaction volumes.
4. **Nginx Reverse Proxy & SSL**: Deploy Nginx as a reverse proxy in front of the frontend containers to terminate SSL, compress assets (gzip/brotli), and handle load balancing.
