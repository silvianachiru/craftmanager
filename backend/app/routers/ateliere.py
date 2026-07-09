from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from typing import Optional, List
from datetime import date, time
from pydantic import BaseModel
from decimal import Decimal
from ..database import get_db
from ..models import Atelier, Tema, Locatie, Instructor, Utilizator
from .auth import get_utilizator_curent

router = APIRouter(prefix="/ateliere", tags=["Ateliere"])

class AtelierCreate(BaseModel):
    denumire: str
    descriere: Optional[str] = None
    nivel: str = "Incepator"
    pret: float
    varstamin: int
    varstamax: int
    durata: int
    data: date
    ora: time
    idtema: int
    idlocatie: int

class LocatieResponse(BaseModel):
    idlocatie: int
    nume: str
    adresa: str
    oras: str
    capacitate: int
    model_config = {"from_attributes": True}

class UtilizatorSimplificat(BaseModel):
    nume: str
    prenume: str
    model_config = {"from_attributes": True}

class InstructorResponse(BaseModel):
    idinstructor: int
    bio: Optional[str]
    specializare: Optional[str]
    utilizator: Optional[UtilizatorSimplificat] = None
    model_config = {"from_attributes": True}

class TemaResponse(BaseModel):
    idtema: int
    denumire: str
    model_config = {"from_attributes": True}

class AtelierResponse(BaseModel):
    idatelier: int
    denumire: str
    descriere: Optional[str]
    nivel: str = "Incepator"
    pret: Decimal
    varstamin: int
    varstamax: int
    durata: int
    data: date
    ora: time
    nrparticipanti: int
    idtema: int
    idlocatie: int
    idinstructor: int
    materiale_salvate: bool = False
    nr_inscrisi: int = 0
    locatie: Optional[LocatieResponse] = None
    instructor: Optional[InstructorResponse] = None
    tema: Optional[TemaResponse] = None
    model_config = {"from_attributes": True}

def query_cu_relatii(db: Session):
    return db.query(Atelier).options(
        joinedload(Atelier.locatie),
        joinedload(Atelier.instructor).joinedload(Instructor.utilizator),
        joinedload(Atelier.tema)
    )

@router.get("/toate-ale-mele/", response_model=List[AtelierResponse])
def get_toate_atelierele_mele(
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot accesa acest endpoint")
    return query_cu_relatii(db).filter(
        Atelier.idinstructor == utilizator_curent.instructor.idinstructor
    ).order_by(Atelier.data.desc()).all()

@router.get("/", response_model=List[AtelierResponse])
def get_ateliere(
    categorie: Optional[int] = Query(None),
    pret_min: Optional[float] = Query(None),
    pret_max: Optional[float] = Query(None),
    data: Optional[date] = Query(None),
    varsta: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = query_cu_relatii(db)
    query = query.filter(text("atelier.data + atelier.ora > NOW()"))
    if pret_min is not None:
        query = query.filter(Atelier.pret >= pret_min)
    if pret_max is not None:
        query = query.filter(Atelier.pret <= pret_max)
    if data is not None:
        query = query.filter(Atelier.data == data)
    if varsta is not None:
        query = query.filter(Atelier.varstamin <= varsta, Atelier.varstamax >= varsta)
    if categorie is not None:
        query = query.join(Tema).filter(Tema.idcategorie == categorie)
    return query.all()

@router.get("/{id}", response_model=AtelierResponse)
def get_atelier(id: int, db: Session = Depends(get_db)):
    atelier = query_cu_relatii(db).filter(Atelier.idatelier == id).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit")
    return atelier

@router.post("/", response_model=AtelierResponse, status_code=status.HTTP_201_CREATED)
def create_atelier(
    data: AtelierCreate,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot crea ateliere")

    atelier = Atelier(
        **data.model_dump(),
        idinstructor=utilizator_curent.instructor.idinstructor
    )
    db.add(atelier)
    db.commit()
    db.refresh(atelier)
    return query_cu_relatii(db).filter(Atelier.idatelier == atelier.idatelier).first()

@router.put("/{id}", response_model=AtelierResponse)
def update_atelier(
    id: int,
    data: AtelierCreate,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    atelier = db.query(Atelier).filter(Atelier.idatelier == id).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit")
    if atelier.idinstructor != utilizator_curent.instructor.idinstructor:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea sa modifici acest atelier")

    for key, value in data.model_dump().items():
        setattr(atelier, key, value)

    db.commit()
    return query_cu_relatii(db).filter(Atelier.idatelier == id).first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_atelier(
    id: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    atelier = db.query(Atelier).filter(Atelier.idatelier == id).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit")
    if atelier.idinstructor != utilizator_curent.instructor.idinstructor:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea sa stergi acest atelier")
    if any(i.status != 'Anulare' for i in atelier.inregistrari):
        raise HTTPException(status_code=400, detail="Atelierul are participanti inscrisi si nu poate fi sters.")

    db.delete(atelier)
    db.commit()