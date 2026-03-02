from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from database import get_db
from models import Event, User, Registration
from .auth import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

router = APIRouter(prefix="/events", tags=["Events"])

# --- Auth helper ---
def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Schemas ---
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    location: str
    total_seats: int
    cost: int = 0
    contact_number: Optional[str] = None
    poster_url: Optional[str] = None
    category: Optional[str] = None

# --- Routes ---
@router.get("/")
def list_events(
    db: Session = Depends(get_db),
    date: Optional[datetime] = Query(None),
    available: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Event).filter(Event.status != "cancelled")
    if date:
        query = query.filter(Event.date >= date)
    if available:
        query = query.filter(Event.seats_remaining > 0)
    if category:
        query = query.filter(Event.category == category)
    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))
    return query.all()

@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", status_code=201)
def create_event(
    data: EventCreate,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user = get_current_user(token, db)
    if user.role not in ("admin", "organizer"):
        raise HTTPException(status_code=403, detail="Only admins and organizers can create events")
    event = Event(
        **data.model_dump(),
        seats_remaining=data.total_seats,
        organizer_id=user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{event_id}")
def update_event(
    event_id: int,
    data: EventCreate,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Admin can edit any event, organizer only their own
    if user.role == "admin":
        pass
    elif user.role == "organizer" and event.organizer_id == user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")

    registered_count = db.query(Registration).filter(Registration.event_id == event_id).count()
    if data.total_seats < registered_count:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reduce seats below current registration count ({registered_count})"
        )

    for key, value in data.model_dump().items():
        setattr(event, key, value)

    event.seats_remaining = data.total_seats - registered_count
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
def cancel_event(
    event_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Admin can cancel any event, organizer only their own
    if user.role == "admin":
        pass
    elif user.role == "organizer" and event.organizer_id == user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this event")

    event.status = "cancelled"
    db.commit()
    return {"message": "Event cancelled"}
