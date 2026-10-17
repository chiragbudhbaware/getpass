# GatePass — Event Management & QR Check-In

A web-based event management application built during a Build-a-thon organized by the **ACM Student Chapter, Pune Vidyarthi Griha's College of Engineering, Technology and Management**.

GatePass simplifies event attendee registration and entry management through QR-code-based passes and check-in.

## 🚀 Live Demo

- **Frontend:** https://getpass-eta.vercel.app
- **Backend API:** https://getpass-backend-rzq2.onrender.com
- **API Documentation:** https://getpass-backend-rzq2.onrender.com/docs

## ✨ Features

- **Attendee Registration:** Register attendees with their name and email address.
- **QR Code Passes:** Generate QR-code-based passes for registered attendees.
- **QR Scanner:** Scan attendee passes for event entry.
- **Manual Check-In:** Check in attendees through the application.
- **Dashboard Statistics:** View total registrations, checked-in attendees, and remaining attendees.
- **Duplicate Prevention:** Prevent an attendee from checking in more than once.
- **REST API:** Communicate with the backend through FastAPI endpoints.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios
- QRCode React
- HTML5 QR Code
- Lucide React

### Backend
- Python
- FastAPI
- SQLite
- Uvicorn

### Deployment
- Vercel — Frontend
- Render — Backend

## 📁 Project Structure

```text
gatepass/
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

## ⚙️ Run Locally

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/chiragbudhbaware/gatepass.git
cd gatepass
```

### 2. Start the backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies and start FastAPI:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run at `http://127.0.0.1:8000`.

Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend welcome endpoint |
| GET | `/health` | Health check |
| POST | `/api/attendees` | Register an attendee |
| GET | `/api/attendees` | Retrieve attendees |
| GET | `/api/stats` | Retrieve dashboard statistics |
| POST | `/api/check-in` | Check in an attendee |

## 🧪 Testing the Application

1. Open GatePass.
2. Register an attendee using a name and email address.
3. View the generated QR pass.
4. Open the check-in section and scan the QR code.
5. Verify that the dashboard statistics update.
6. Attempt to check in the same attendee again to verify duplicate prevention.

## 🌐 Deployment

The frontend is deployed on Vercel, while the FastAPI backend is deployed on Render.

The frontend connects to the backend using the `VITE_API_URL` environment variable.

**Note:** The backend currently uses SQLite. On Render's free service, local database files are not guaranteed to persist across service restarts or redeployments. Configure persistent storage or a managed database if permanent attendee records are required.

## 👥 Acknowledgement

Developed as part of a Build-a-thon organized by the **ACM Student Chapter, Pune Vidyarthi Griha's College of Engineering, Technology and Management**.

---

*GatePass — Simplifying event registration and entry management.*
