from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Utilizator, Participant, Instructor, Atelier, MesajContact, Tema, Categorie, Locatie
from .auth import get_admin_curent

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/utilizatori")
def get_utilizatori(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    utilizatori = db.query(Utilizator).all()
    rezultat = []
    for u in utilizatori:
        if u.administrator:
            tip = "admin"
        elif u.participant:
            tip = "participant"
        else:
            tip = "instructor"
        rezultat.append({
            "idutilizator": u.idutilizator,
            "nume": u.nume,
            "prenume": u.prenume,
            "email": u.email,
            "nrtelefon": u.nrtelefon,
            "datacrearii": u.datacrearii,
            "tip": tip,
        })
    return rezultat


@router.delete("/utilizatori/{id}")
def sterge_utilizator(id: int, db: Session = Depends(get_db), admin=Depends(get_admin_curent)):
    if id == admin.idutilizator:
        raise HTTPException(status_code=400, detail="Nu iti poti sterge propriul cont.")
    utilizator = db.query(Utilizator).filter(Utilizator.idutilizator == id).first()
    if not utilizator:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit.")
    db.delete(utilizator)
    db.commit()
    return {"message": "Utilizator sters."}


@router.get("/ateliere")
def get_ateliere(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    ateliere = db.query(Atelier).all()
    return [{
        "idatelier": a.idatelier,
        "denumire": a.denumire,
        "data": a.data,
        "ora": a.ora,
        "pret": float(a.pret),
        "nrparticipanti": a.nrparticipanti,
        "tema": a.tema.denumire if a.tema else None,
        "categorie": a.tema.categorie.denumire if a.tema and a.tema.categorie else None,
        "locatie": a.locatie.oras if a.locatie else None,
        "instructor": f"{a.instructor.utilizator.prenume} {a.instructor.utilizator.nume}" if a.instructor else None,
    } for a in ateliere]


@router.delete("/ateliere/{id}")
def sterge_atelier(id: int, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    atelier = db.query(Atelier).filter(Atelier.idatelier == id).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    db.delete(atelier)
    db.commit()
    return {"message": "Atelier sters."}


@router.get("/mesaje")
def get_mesaje(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    mesaje = db.query(MesajContact).order_by(MesajContact.dataora.desc()).all()
    return [{
        "idmesaj": m.idmesaj,
        "nume": m.nume,
        "email": m.email,
        "subiect": m.subiect,
        "mesaj": m.mesaj,
        "dataora": m.dataora,
        "citit": m.citit,
    } for m in mesaje]


@router.patch("/mesaje/{id}/citit")
def marcheaza_citit(id: int, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    mesaj = db.query(MesajContact).filter(MesajContact.idmesaj == id).first()
    if not mesaj:
        raise HTTPException(status_code=404, detail="Mesajul nu a fost gasit.")
    mesaj.citit = True
    db.commit()
    return {"message": "Marcat ca citit."}


@router.delete("/mesaje/{id}")
def sterge_mesaj(id: int, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    mesaj = db.query(MesajContact).filter(MesajContact.idmesaj == id).first()
    if not mesaj:
        raise HTTPException(status_code=404, detail="Mesajul nu a fost gasit.")
    db.delete(mesaj)
    db.commit()
    return {"message": "Mesaj sters."}


# ── Categorii ──────────────────────────────────────────────
class CategorieSchema(BaseModel):
    denumire: str

class TemaSchema(BaseModel):
    denumire: str
    idcategorie: int

@router.get("/categorii")
def get_categorii(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    categorii = db.query(Categorie).order_by(Categorie.denumire).all()
    return [{
        "idcategorie": c.idcategorie,
        "denumire": c.denumire,
        "teme": [{"idtema": t.idtema, "denumire": t.denumire} for t in c.teme],
    } for c in categorii]

@router.post("/categorii", status_code=201)
def adauga_categorie(data: CategorieSchema, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    if db.query(Categorie).filter(Categorie.denumire == data.denumire).first():
        raise HTTPException(status_code=400, detail="Categoria exista deja.")
    db.add(Categorie(denumire=data.denumire))
    db.commit()
    return {"message": "Categorie adaugata."}

@router.delete("/categorii/{id}")
def sterge_categorie(id: int, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    cat = db.query(Categorie).filter(Categorie.idcategorie == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria nu a fost gasita.")
    if cat.teme:
        raise HTTPException(status_code=400, detail="Sterge mai intai temele din aceasta categorie.")
    db.delete(cat)
    db.commit()
    return {"message": "Categorie stearsa."}

@router.post("/teme", status_code=201)
def adauga_tema(data: TemaSchema, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    if db.query(Tema).filter(Tema.denumire == data.denumire, Tema.idcategorie == data.idcategorie).first():
        raise HTTPException(status_code=400, detail="Tema exista deja in aceasta categorie.")
    db.add(Tema(denumire=data.denumire, idcategorie=data.idcategorie))
    db.commit()
    return {"message": "Tema adaugata."}

@router.delete("/teme/{id}")
def sterge_tema(id: int, db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    tema = db.query(Tema).filter(Tema.idtema == id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema nu a fost gasita.")
    if tema.ateliere:
        raise HTTPException(status_code=400, detail="Exista ateliere asociate acestei teme.")
    db.delete(tema)
    db.commit()
    return {"message": "Tema stearsa."}
