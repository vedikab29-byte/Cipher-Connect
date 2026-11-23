# 🔐 Cipher Connect
### Secure Workspace | Connect • Collaborate • Communicate • Complete

Cipher Connect is a cybersecurity-focused communication and collaboration platform designed to provide a structured environment for secure user connections, messaging, and team collaboration.

The application brings communication and workspace management together, with an emphasis on authentication, controlled access, and secure application design.

## 📁 Project Structure

The project is organized into separate frontend and backend components to maintain modularity and simplify development and maintenance.

```text
Cipher-Connect/
│
├── backend/
│   └── cipher-connect-backend/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/cipherconnect/backend/
│       │       │       ├── config/
│       │       │       ├── controller/
│       │       │       ├── model/
│       │       │       ├── repository/
│       │       │       ├── security/
│       │       │       └── service/
│       │       │
│       │       └── resources/
│       │           └── application.properties
│       │
│       └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docs/
│   └── screenshots/
│       ├── login.png
│       ├── dashboard.png
│       ├── connections.png
│       └── messaging.png
│
├── README.md
└── .gitignore
```

**Directory Overview:**

- `backend/` – Contains the Java Spring Boot backend.
- `frontend/` – Contains the React frontend and user interface.
- `src/main/java/` – Contains backend application source code.
- `config/` – Contains application configuration and security configuration.
- `controller/` – Handles incoming API requests.
- `model/` – Contains application data models.
- `repository/` – Handles database operations.
- `security/` – Contains JWT and authentication-related components.
- `service/` – Contains application business logic.
- `resources/` – Contains backend configuration and resources.
- `docs/screenshots/` – Stores application screenshots.
- `pom.xml` – Maven project configuration.
- `package.json` – Frontend dependencies and scripts.

## ✨ Key Features

### 1. User Authentication
- User registration and login.
- JWT-based authentication.
- Unique Cipher ID for user identification.
- Protected application endpoints.

### 2. Connections Management
- Connect with other users using their Cipher ID or email.
- Send and manage connection requests.
- Accept or reject incoming requests.
- View connection status.

### 3. Direct Messaging
- Direct conversations between connected users.
- Message management through REST APIs.
- WebSocket/STOMP-based real-time communication implementation.

### 4. Collaboration Workspace
- Workspace-oriented collaboration structure.
- Channels for organizing discussions.
- Task management and file-sharing capabilities.

*Note: Mark features as completed in this section only when they are functional in the submitted version. Move unfinished features to the roadmap.*

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Java 21, Spring Boot |
| Database | PostgreSQL |
| Authentication | Spring Security, JWT |
| Communication | REST APIs, WebSocket, STOMP |
| Build Tool | Maven |
| Development Tools | VS Code, Git, GitHub |
 
## 🏗️ System Architecture

Cipher Connect follows a frontend-backend architecture.

1. **Frontend:** React provides the user interface and handles user interactions.
2. **Backend:** Spring Boot manages application logic, authentication, and API requests.
3. **Database:** PostgreSQL stores user accounts, connections, conversations, and messages.
4. **Security:** Spring Security and JWT provide authentication and protected API access.

## 📸 Application Screenshots

Screenshots of the application will be added below.

### Login Page
![Login Page](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Connections
![Connections](docs/screenshots/connections.png)

### Messaging
![Messaging](docs/screenshots/messaging.png)

## ⚙️ Installation and Setup

Follow these instructions to run Cipher Connect locally.

### Prerequisites

Install the following:

- Java JDK 21
- Node.js and npm
- PostgreSQL
- Apache Maven
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vedikab29-byte/Cipher-Connect.git
```

Navigate into the project:

```bash
cd Cipher-Connect
```

### 2. Database Configuration

1. Open PostgreSQL.
2. Create a database named:

```sql
CREATE DATABASE cipher_connect;
```

3. Configure your database connection in the backend's `application.properties` file.

Use your own local database credentials. Never upload passwords or private keys to GitHub.

### 3. Run the Backend

Open a terminal and navigate to:

```bash
cd backend/cipher-connect-backend
```

Compile the project:

```bash
mvn clean install
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend should run at:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

### 4. Run the Frontend

Open a second terminal and navigate to the directory containing the frontend's `package.json`.

Install dependencies:

```bash
npm install
```

Start the frontend using the development script defined in `package.json`:

```bash
npm run dev
```

If your project uses a different start script, use the corresponding command from `package.json`.

### 5. Access the Application

Open the local frontend URL displayed in your terminal.

Make sure PostgreSQL and the Spring Boot backend are running before using the application.

## 📖 User Guide

Follow these steps to explore and use Cipher Connect.

### 1. Getting Started
- Launch the frontend and backend.
- Open Cipher Connect in your browser.
- Register a new account or log in using your existing credentials.

### 2. User Identification
- Access your account and locate your unique Cipher ID.
- Share your Cipher ID with other users to establish connections.

### 3. Managing Connections
- Navigate to the Connections section.
- Search for other users using their Cipher ID or email address.
- Send connection requests.
- Accept or manage incoming connection requests.

### 4. Direct Messaging
- Open the messaging section.
- Select an available connection.
- Start a direct conversation.
- Exchange messages through the messaging interface.

### 5. Workspace Collaboration
- Explore the workspace section.
- Organize collaboration through workspaces and channels.
- Use available task management and file-sharing features.

*Note: The availability of individual features depends on the functionality implemented in the current application version.*

### 6. Logging Out
- Use the logout option to securely end your current session.

## 💡 Usage Tips

- Keep your login credentials private.
- Share your Cipher ID rather than your account password.
- Use authorized connections when communicating.
- Log out when using a shared computer.
- Never share sensitive information through an unverified account.

## 🔒 Security Considerations

- JWT-based authentication.
- Protected backend endpoints.
- Password hashing.
- Role-based access control where implemented.
- Secure handling of user credentials.
- Database-backed application data.

**Security note:** Cipher Connect is designed with secure communication principles in mind. Do not describe the application as end-to-end encrypted unless actual end-to-end message encryption has been implemented and verified.

## 🚀 Future Enhancements

- Enhanced role-based access control.
- Improved workspace and channel management.
- Secure file-sharing enhancements.
- Comprehensive audit logging.
- Additional security testing.
- Production deployment and monitoring.

## 👩‍💻 Project Information

**Project Name:** Cipher Connect  
**Project Category:** Cybersecurity / Secure Collaboration  
**Architecture:** React Frontend + Spring Boot Backend  
**Database:** PostgreSQL  
**Repository:** https://github.com/vedikab29-byte/Cipher-Connect

---

*Cipher Connect — A structured space for secure connections and collaboration.*

