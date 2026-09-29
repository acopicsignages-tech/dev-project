# 🏛️ Gruha Lakshmi Scheme - PDF Sanction Order Generator

An open-source, full-stack web application designed for the Karnataka Government **Gruha Lakshmi Scheme (ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ)**. It provides phone-number-based beneficiary authentication, dynamic high-fidelity PDF generation with Kannada & English typography, dynamic QR code verification, and a secure **Admin Management Portal** to configure allowed login phone numbers and export download audit logs to CSV.

---

## ✨ Features

- **📱 Phone-Number Whitelist Authentication**:
  - Only pre-registered/whitelisted mobile numbers can log in and generate their sanction orders.
  - 24-hour secure UUID session token handling.
- **📄 Dynamic High-Fidelity PDF Generation**:
  - Direct PDF overlay using **Apache PDFBox 3.x**.
  - Renders official Kannada fonts (**Nirmala UI / Nirmala UI Bold**) and English (**Segoe UI**).
  - Dynamic QR code generation containing verified beneficiary data.
- **🔐 Admin Management Portal**:
  - PIN-protected control center (default: `admin123`).
  - **Whitelist Management**: Add, search, and revoke/remove allowed phone numbers with real-time sync.
  - **Download Audit Trail**: Records beneficiary name, ration card number, sanction date, IP, and timestamp for every PDF generated.
  - **Instant CSV Export**: Export whitelisted users or full download history to Excel-compatible CSV with UTF-8 BOM encoding.
- **⚡ Modern Responsive UI**:
  - Built with **React 18 + Vite**, **Lucide Icons**, and custom CSS.
  - Supports live English-to-Kannada phonetic transliteration.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.5, Spring Data JPA, Flyway, Apache PDFBox 3.0.4, ZXing
- **Frontend**: React 18, Vite 5, Lucide React
- **Database**: PostgreSQL 15+
- **Containerization**: Docker (multi-stage build), Docker Compose

---

## 🚀 Quick Start with Docker (Recommended)

Run the entire application and PostgreSQL database with a single command:

```bash
docker compose up --build
```

Access the application in your browser:
- **Web Portal**: [http://localhost:8082](http://localhost:8082)
- **Admin Portal**: Click **"Admin Portal"** in the top navigation (PIN: `admin123`).

---

## 💻 Local Development Setup

### Prerequisites
- **Java 17+** (JDK)
- **Node.js 18+** & npm
- **Maven 3.8+**
- **PostgreSQL 14+** running locally

### 1. Database Setup
Create the PostgreSQL database:
```sql
CREATE DATABASE phone_download;
```

### 2. Frontend Build
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Backend Run
```bash
mvn clean compile
mvn spring-boot:run
```

The server will start on port `8082`.

---

## ☁️ Free Cloud Deployment (1-Click)

### Option 1: Render.com (Recommended)
1. Fork or push this repository to your GitHub account.
2. Sign up at [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect this GitHub repository. Render will automatically detect `render.yaml` and provision:
   - A free PostgreSQL database.
   - The Dockerized web application with automatic deployments on git push.

### Option 2: Railway.app
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Add a PostgreSQL plugin.
4. Set environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://${{Postgres.HOST}}:${{Postgres.PORT}}/${{Postgres.DATABASE}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{Postgres.USER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{Postgres.PASSWORD}}`
   - `ADMIN_PIN`: Your chosen secret PIN
   - `PORT`: `8080`

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Web server port | `8082` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/phone_download` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `ADMIN_PIN` | Secret PIN to access the Admin Control Center | `admin123` |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
