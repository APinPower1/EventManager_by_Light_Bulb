# Event Registration & Capacity Manager

A full-stack event management platform with role-based access control, seat capacity enforcement, and a clean React frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| Auth | JWT (python-jose + passlib/bcrypt) |
| Frontend | React + Vite + Tailwind CSS v4 |
| File Uploads | FastAPI static file serving |

---

## Features

### Authentication
- Signup and login with JWT tokens
- Roles: **admin**, **organizer**, **user**
- Role stored in JWT payload and localStorage

### Role-Based Access Control
| Action | Admin | Organizer | User |
|---|---|---|---|
| Create events | ✅ | ✅ | ❌ |
| Edit own events | ✅ | ✅ | ❌ |
| Delete any event | ✅ | ❌ | ❌ |
| Delete own events | ✅ | ✅ | ❌ |
| Register for events | ✅ | ✅ | ✅ |
| Assign roles | ✅ | ❌ | ❌ |

### Event Management
- Create events with title, description, date, time, location, seats, cost, category, contact number, and poster image
- Edit and cancel events
- Category dropdown (Tech, Music, Sports, Arts, Business, Food, Health, Education, Other)
- Poster image upload with preview
- Google Maps link on event detail page

### Capacity Enforcement
- No overbooking — returns `409 Conflict` when full
- Duplicate registration prevention — returns `409 Conflict`
- Cancellation restores seat count
- Event status auto-updates to `sold_out` when full, back to `active` on cancellation

### Registration
- Register and cancel for events
- View all your registered events with booking IDs in "My Events"

### Filtering & Sorting
- Search by event title
- Filter by category
- Filter by availability (available seats only)
- Sort by date (nearest first / furthest first)

### Admin Panel
- Assign or change user roles by email
- Accessible only to admins via `/admin`

---

## Project Structure

```
Magic_Hackathon-/
├── event-manager/          # Backend
│   ├── routers/
│   │   ├── auth.py         # Signup, login, role assignment
│   │   ├── events.py       # Event CRUD with role checks
│   │   └── registrations.py # Register, cancel, view registrants
│   ├── models.py           # SQLAlchemy models
│   ├── database.py         # DB session and engine
│   ├── main.py             # App entry point, CORS, file uploads
│   └── .env                # Secrets (not committed)
│
└── event-frontend/         # Frontend
    └── src/
        ├── pages/
        │   ├── EventsPage.jsx
        │   ├── EventDetailPage.jsx
        │   ├── CreateEventPage.jsx
        │   ├── EditEventPage.jsx
        │   ├── MyRegistrationsPage.jsx
        │   ├── AdminPage.jsx
        │   ├── LoginPage.jsx
        │   └── SignupPage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── EventCard.jsx
        └── api.js
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- uv (Python package manager)

### Backend

```bash
cd event-manager

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# Install dependencies
uv add fastapi uvicorn sqlalchemy python-dotenv "pydantic[email]" "python-jose[cryptography]" "passlib[bcrypt]" "bcrypt==4.0.1" python-multipart

# Create .env file
echo SUPABASE_URL=not_used > .env
echo JWT_SECRET=your_secret_here >> .env

# Run the server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd event-frontend

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create account |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Get current user |
| PUT | `/auth/assign-role` | Admin only | Assign role by email |

### Events
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/events/` | Public | List all events (supports `?search=`, `?category=`, `?available=true`, `?date=`) |
| GET | `/events/{id}` | Public | Get single event |
| POST | `/events/` | Admin / Organizer | Create event |
| PUT | `/events/{id}` | Admin / Own organizer | Edit event |
| DELETE | `/events/{id}` | Admin / Own organizer | Cancel event |

### Registrations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/registrations/my` | Authenticated | Get your registrations |
| POST | `/registrations/{event_id}` | Authenticated | Register for event |
| DELETE | `/registrations/{event_id}` | Authenticated | Cancel registration |
| GET | `/registrations/{event_id}` | Organizer / Admin | View registrants |

### Uploads
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload event poster image |

---

## First-Time Admin Setup

After running the backend and signing up, set your account as admin:

```bash
# In the event-manager folder with venv active
python
```

```python
from database import SessionLocal
from models import User
db = SessionLocal()
user = db.query(User).filter(User.email == "your@email.com").first()
user.role = "admin"
db.commit()
print(user.name, user.role)
exit()
```

---

Team Light_Bulb
APinPower1
Darkhor4804G
garryvino
jacobsthomas171-cmd