import re
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import get_db
from ..models import Utilizator, Participant, Instructor, Administrator, Atelier, Inregistrare
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


class UpdateProfilSchema(BaseModel):
    nume: Optional[str] = None
    prenume: Optional[str] = None
    nrtelefon: Optional[str] = None
    varsta: Optional[int] = None
    bio: Optional[str] = None
    specializare: Optional[str] = None


class SchimbaParolaSchema(BaseModel):
    parola_veche: str
    parola_noua: str


# Functii helper
def hash_parola(parola: str) -> str:
    return bcrypt.hashpw(parola.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verifica_parola(parola: str, hash: str) -> bool:
    return bcrypt.checkpw(parola.encode("utf-8"), hash.encode("utf-8"))


# Validari de format (regex) folosite la inregistrare si editare profil
REGEX_TELEFON = re.compile(r"^(\+40|0)7[0-9]{8}$")   # mobil: 07 sau +407 urmat de 8 cifre
REGEX_NUME = re.compile(r"^(?:[^\W\d_]|[ \-])+$")     # doar litere, spatii si cratima

def valideaza_nume(valoare: str, camp: str):
    if not REGEX_NUME.match((valoare or "").strip()):
        raise HTTPException(status_code=400, detail=f"{camp} poate contine doar litere.")

def valideaza_telefon(nrtelefon):
    if nrtelefon and not REGEX_TELEFON.match(nrtelefon.strip()):
        raise HTTPException(status_code=400, detail="Numarul de telefon trebuie sa fie un numar de mobil valid (07 sau +407 urmat de 8 cifre).")

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


def anonimizeaza_cont(utilizator: Utilizator, db: Session):
    """Verifica regulile de business si anonimizeaza contul, pastrand recenziile si atelierele."""
    if utilizator.instructor:
        are_ateliere_active = db.query(Atelier).filter(
            Atelier.idinstructor == utilizator.instructor.idinstructor,
            text("atelier.data + atelier.ora > NOW()")
        ).first()
        if are_ateliere_active:
            raise HTTPException(status_code=400, detail="Contul nu poate fi sters cat timp ai ateliere viitoare programate.")

    if utilizator.participant:
        are_inscrieri_active = db.query(Inregistrare).join(
            Atelier, Inregistrare.idatelier == Atelier.idatelier
        ).filter(
            Inregistrare.idparticipant == utilizator.participant.idparticipant,
            Inregistrare.status == "Inscriere",
            text("atelier.data + atelier.ora > NOW()")
        ).first()
        if are_inscrieri_active:
            raise HTTPException(status_code=400, detail="Contul nu poate fi sters cat timp ai inscrieri active la ateliere viitoare.")

    utilizator.sters = True
    utilizator.prenume = "Utilizator"
    utilizator.nume = "sters"
    utilizator.email = f"sters_{utilizator.idutilizator}@craftmanager.local"
    utilizator.nrtelefon = None
    utilizator.parola = hash_parola(secrets.token_urlsafe(16))
    if utilizator.instructor:
        utilizator.instructor.bio = None
        utilizator.instructor.specializare = None
    db.commit()

# Endpoint-uri
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(Utilizator).filter(Utilizator.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email deja inregistrat")

    if data.tip not in ["participant", "instructor"]:
        raise HTTPException(status_code=400, detail="Tip invalid. Alege participant sau instructor")

    valideaza_nume(data.nume, "Numele")
    valideaza_nume(data.prenume, "Prenumele")
    valideaza_telefon(data.nrtelefon)

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
    if not utilizator or utilizator.sters or not verifica_parola(form.password, utilizator.parola):
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


@router.put("/me")
def update_profil(
    data: UpdateProfilSchema,
    utilizator_curent: Utilizator = Depends(get_utilizator_curent),
    db: Session = Depends(get_db)
):
    if data.nume is not None:
        valideaza_nume(data.nume, "Numele")
        utilizator_curent.nume = data.nume
    if data.prenume is not None:
        valideaza_nume(data.prenume, "Prenumele")
        utilizator_curent.prenume = data.prenume
    if data.nrtelefon is not None:
        valideaza_telefon(data.nrtelefon)
        utilizator_curent.nrtelefon = data.nrtelefon

    if utilizator_curent.participant and data.varsta is not None:
        if data.varsta < 1 or data.varsta > 120:
            raise HTTPException(status_code=400, detail="Varsta trebuie sa fie intre 1 si 120 de ani.")
        utilizator_curent.participant.varsta = data.varsta

    if utilizator_curent.instructor:
        if data.bio is not None:
            utilizator_curent.instructor.bio = data.bio
        if data.specializare is not None:
            utilizator_curent.instructor.specializare = data.specializare

    db.commit()
    return {"message": "Profil actualizat cu succes."}


@router.put("/me/parola")
def schimba_parola(
    data: SchimbaParolaSchema,
    utilizator_curent: Utilizator = Depends(get_utilizator_curent),
    db: Session = Depends(get_db)
):
    if not verifica_parola(data.parola_veche, utilizator_curent.parola):
        raise HTTPException(status_code=400, detail="Parola veche este incorecta.")
    if len(data.parola_noua) < 6:
        raise HTTPException(status_code=400, detail="Parola noua trebuie sa aiba minim 6 caractere.")
    utilizator_curent.parola = hash_parola(data.parola_noua)
    db.commit()
    return {"message": "Parola schimbata cu succes."}


@router.delete("/me")
def sterge_cont(
    utilizator_curent: Utilizator = Depends(get_utilizator_curent),
    db: Session = Depends(get_db)
):
    if utilizator_curent.administrator:
        raise HTTPException(status_code=400, detail="Contul de administrator nu poate fi sters din aceasta pagina.")
    anonimizeaza_cont(utilizator_curent, db)
    return {"message": "Cont sters cu succes."}
