from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..database import get_db
from ..models import MesajContact

router = APIRouter(prefix="/contact", tags=["Contact"])


class MesajSchema(BaseModel):
    nume: str
    email: EmailStr
    subiect: str
    mesaj: str


@router.post("", status_code=201)
def trimite_mesaj(data: MesajSchema, db: Session = Depends(get_db)):
    mesaj = MesajContact(
        nume=data.nume,
        email=data.email,
        subiect=data.subiect,
        mesaj=data.mesaj,
    )
    db.add(mesaj)
    db.commit()
    return {"message": "Mesaj trimis cu succes!"}
