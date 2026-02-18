# MedLink - Healthcare Management System

## 📖 Project Description
MedLink is a comprehensive healthcare management platform designed to streamline interactions between patients and healthcare providers. It features a secure authentication system, user profile management, and a dashboard for accessing medical services. The system is built with a decoupled architecture using a Spring Boot REST API for the backend and a React-based frontend.

## 🛠 Technologies Used

### Backend
* **Framework:** Spring Boot 3.x
* **Language:** Java 17+
* **Database:** MySQL
* **Security:** Spring Security + JWT (JSON Web Tokens)
* **Build Tool:** Maven

### Frontend (Web)
* **Framework:** React.js
* **Build Tool:** Vite
* **Styling:** CSS / CSS Modules
* **HTTP Client:** Fetch API / Axios

### Mobile (Future Scope)
* **Framework:** React Native / Flutter (To be implemented)

---

## 🚀 Steps to Run the Application

### 1. Prerequisites
Ensure you have the following installed:
* Java Development Kit (JDK) 17 or newer
* Node.js (v18+) & npm
* MySQL Server (via XAMPP/WAMP or Standalone)

---

### 2. Backend Setup (Spring Boot)
The backend runs on port `8080`.

1.  **Configure Database:**
    * Create a database named `medlink_db` in MySQL.
    * Open `backend/src/main/resources/application.properties`.
    * Update `spring.datasource.username` and `spring.datasource.password` with your MySQL credentials.

2.  **Run the Application:**
    Navigate to the backend directory and run the following command:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
    *(On Windows, you can also use `mvnw.cmd spring-boot:run`)*

3.  **Verify:**
    The server should start at `http://localhost:8080`.

---

### 3. Web App Setup (React + Vite)
The web application runs on port `5173`.

1.  **Navigate to the Web Directory:**
    ```bash
    cd web
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Access the App:**
    Open your browser and visit `http://localhost:5173`.

---

### 4. Mobile App Setup
*(Note: The mobile implementation is currently in development. Below are the standard instructions for the future module).*

1.  **Navigate to the Mobile Directory:**
    ```bash
    cd mobile
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run on Emulator/Device:**
    * **Android:**
        ```bash
        npm run android
        ```
    * **iOS:**
        ```bash
        npm run ios
        ```

---

## 📡 List of API Endpoints
The backend exposes the following REST API endpoints.

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user account. | `{"email": "...", "password": "...", "role": "USER"}` |
| **POST** | `/api/auth/login` | Login and receive a JWT token. | `{"email": "...", "password": "..."}` |
| **POST** | `/api/auth/logout` | Invalidate the current session. | *(None)* |

### User Profile (Protected)
*Headers required: `Authorization: Bearer <your_token>`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/users/me` | Get current user details. |