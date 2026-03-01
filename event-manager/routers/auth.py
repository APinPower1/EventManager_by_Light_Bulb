from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
import os
from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "fallbacksecret")
ALGORITHM = "HS256"

# --- Schemas ---
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Routes ---
@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    hashed = pwd_context.hash(data.password)
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hashed,
        phone=data.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Account created successfully", "user_id": user.id}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = jwt.encode({"sub": str(user.id), "email": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}