from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import get_db
from ..models import Utilizator, Participant, Instructor, Administrator
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Autentificare"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# Scheme Pydantic
class RegisterSchema(BaseModel):
    nume: str
    prenume: str
    email: EmailStr
    parola: str
    nrtelefon: Optional[str] = None
    tip: str
    varsta: Optional[int] = None
    bio: Optional[str] = None
    specializare: Optional[str] = None


class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    tip: str


# Functii helper
def hash_parola(parola: str) -> str:
    return bcrypt.hashpw(parola.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verifica_parola(parola: str, hash: str) -> bool:
    return bcrypt.checkpw(parola.encode("utf-8"), hash.encode("utf-8"))

def creeaza_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_utilizator_curent(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Utilizator:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalid",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    utilizator = db.query(Utilizator).filter(Utilizator.email == email).first()
    if utilizator is None:
        raise credentials_exception
    return utilizator



def get_admin_curent(
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
) -> Utilizator:
    if not utilizator_curent.administrator:
        raise HTTPException(status_code=403, detail="Acces interzis. Doar administratorii pot accesa aceasta resursa.")
    return utilizator_curent

# Endpoint-uri
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(Utilizator).filter(Utilizator.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email deja inregistrat")

    if data.tip not in ["participant", "instructor"]:
        raise HTTPException(status_code=400, detail="Tip invalid. Alege participant sau instructor")

    utilizator = Utilizator(
        nume=data.nume,
        prenume=data.prenume,
        email=data.email,
        parola=hash_parola(data.parola),
        nrtelefon=data.nrtelefon,
    )
    db.add(utilizator)
    db.flush()

    if data.tip == "participant":
        if not data.varsta:
            raise HTTPException(status_code=400, detail="Varsta este obligatorie pentru participant")
        db.add(Participant(varsta=data.varsta, idutilizator=utilizator.idutilizator))
    else:
        db.add(Instructor(bio=data.bio, specializare=data.specializare, idutilizator=utilizator.idutilizator))

    db.commit()
    return {"message": "Cont creat cu succes!"}


@router.post("/login", response_model=TokenSchema)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    utilizator = db.query(Utilizator).filter(Utilizator.email == form.username).first()
    if not utilizator or not verifica_parola(form.password, utilizator.parola):
        raise HTTPException(status_code=401, detail="Email sau parola incorecte")

    if utilizator.administrator:
        tip = "admin"
    elif utilizator.participant:
        tip = "participant"
    else:
        tip = "instructor"
    token = creeaza_token({"sub": utilizator.email, "tip": tip})
    return {"access_token": token, "token_type": "bearer", "tip": tip}

@router.get("/me")
def get_me(utilizator_curent: Utilizator = Depends(get_utilizator_curent)):
    if utilizator_curent.administrator:
        tip = "admin"
    elif utilizator_curent.participant:
        tip = "participant"
    else:
        tip = "instructor"
    date = {
        "idutilizator": utilizator_curent.idutilizator,
        "nume": utilizator_curent.nume,
        "prenume": utilizator_curent.prenume,
        "email": utilizator_curent.email,
        "nrtelefon": utilizator_curent.nrtelefon,
        "datacrearii": utilizator_curent.datacrearii,
        "tip": tip,
    }
    if utilizator_curent.participant:
        date["varsta"] = utilizator_curent.participant.varsta
    if utilizator_curent.instructor:
        date["bio"] = utilizator_curent.instructor.bio
        date["specializare"] = utilizator_curent.instructor.specializare
    return date
