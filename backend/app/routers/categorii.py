from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Categorie, Tema

router = APIRouter(prefix="/categorii", tags=["Categorii"])

@router.get("/")
def get_categorii(db: Session = Depends(get_db)):
    return db.query(Categorie).all()

@router.get("/{id}/teme")
def get_teme_categorie(id: int, db: Session = Depends(get_db)):
    return db.query(Tema).filter(Tema.idcategorie == id).all()