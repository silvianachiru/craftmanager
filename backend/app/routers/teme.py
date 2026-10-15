from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Tema, Locatie, Categorie

router = APIRouter()

class LocatieCreate(BaseModel):
    nume: str
    adresa: str
    oras: str
    capacitate: int

@router.get("/teme/")
def get_teme(db: Session = Depends(get_db)):
    teme = db.query(Tema).join(Categorie).all()
    return [
        {
            "idtema": t.idtema,
            "denumire": t.denumire,
            "idcategorie": t.idcategorie,
            "categorie": t.categorie.denumire
        }
        for t in teme
    ]

@router.get("/locatii/")
def get_locatii(db: Session = Depends(get_db)):
    return db.query(Locatie).all()

@router.post("/locatii/", status_code=201)
def create_locatie(data: LocatieCreate, db: Session = Depends(get_db)):
    existenta = db.query(Locatie).filter(
        Locatie.nume == data.nume,
        Locatie.adresa == data.adresa,
        Locatie.oras == data.oras
    ).first()
    if existenta:
        if existenta.capacitate != data.capacitate:
            existenta.capacitate = data.capacitate
            db.commit()
            db.refresh(existenta)
        return existenta
    
    locatie = Locatie(**data.model_dump())
    db.add(locatie)
    db.commit()
    db.refresh(locatie)
    return locatie

@router.get("/locatii/{id}")
def get_locatie(id: int, db: Session = Depends(get_db)):
    locatie = db.query(Locatie).filter(Locatie.idlocatie == id).first()
    if not locatie:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Locatie negasita")
    return locatie