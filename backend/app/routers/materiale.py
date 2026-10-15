from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from sqlalchemy import func
from ..models import Materiale, Utilizare, Atelier, Instructor, Inregistrare
from .auth import get_utilizator_curent

router = APIRouter(prefix="/materiale", tags=["Materiale"])

class MaterialSchema(BaseModel):
    denumire: str
    pret: float

class MaterialUpdateSchema(BaseModel):
    denumire: Optional[str] = None
    pret: Optional[float] = None

class UtilizareSchema(BaseModel):
    idmaterial: int
    cantitate: int

def get_instructor(utilizator, db):
    instructor = db.query(Instructor).filter(Instructor.idutilizator == utilizator.idutilizator).first()
    if not instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot gestiona materialele.")
    return instructor

@router.get("")
def get_materiale_instructor(db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    materiale = db.query(Materiale).filter(Materiale.idinstructor == instructor.idinstructor).order_by(Materiale.denumire).all()
    return [{"idmaterial": m.idmaterial, "denumire": m.denumire, "pret": float(m.pret)} for m in materiale]

@router.post("", status_code=201)
def adauga_material(data: MaterialSchema, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    if db.query(Materiale).filter(Materiale.denumire == data.denumire, Materiale.idinstructor == instructor.idinstructor).first():
        raise HTTPException(status_code=400, detail="Materialul exista deja.")
    m = Materiale(denumire=data.denumire, pret=data.pret, idinstructor=instructor.idinstructor)
    db.add(m)
    db.commit()
    db.refresh(m)
    return {"idmaterial": m.idmaterial, "denumire": m.denumire, "pret": float(m.pret)}

@router.patch("/{idmaterial}")
def update_material(idmaterial: int, data: MaterialUpdateSchema, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    m = db.query(Materiale).filter(Materiale.idmaterial == idmaterial, Materiale.idinstructor == instructor.idinstructor).first()
    if not m:
        raise HTTPException(status_code=404, detail="Materialul nu a fost gasit.")
    if data.denumire is not None:
        m.denumire = data.denumire
    if data.pret is not None:
        m.pret = data.pret
    db.commit()
    return {"idmaterial": m.idmaterial, "denumire": m.denumire, "pret": float(m.pret)}

@router.delete("/{idmaterial}")
def sterge_material(idmaterial: int, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    m = db.query(Materiale).filter(Materiale.idmaterial == idmaterial, Materiale.idinstructor == instructor.idinstructor).first()
    if not m:
        raise HTTPException(status_code=404, detail="Materialul nu a fost gasit.")
    if m.utilizari:
        raise HTTPException(status_code=400, detail="Materialul este folosit in ateliere si nu poate fi sters.")
    db.delete(m)
    db.commit()
    return {"message": "Material sters."}

@router.get("/atelier/{idatelier}")
def get_materiale_atelier(idatelier: int, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier, Atelier.idinstructor == instructor.idinstructor).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    utilizari = db.query(Utilizare).filter(Utilizare.idatelier == idatelier).all()
    return [{
        "idutilizare": u.idutilizare,
        "idmaterial": u.idmaterial,
        "denumire": u.material.denumire,
        "pret": float(u.material.pret),
        "cantitate": int(u.cantitate),
        "total": round(float(u.material.pret) * float(u.cantitate), 2),
    } for u in utilizari]

@router.post("/atelier/{idatelier}", status_code=201)
def asociaza_material(idatelier: int, data: UtilizareSchema, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier, Atelier.idinstructor == instructor.idinstructor).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    if db.query(Utilizare).filter(Utilizare.idatelier == idatelier, Utilizare.idmaterial == data.idmaterial).first():
        raise HTTPException(status_code=400, detail="Materialul este deja asociat acestui atelier.")
    if data.cantitate < 1:
        raise HTTPException(status_code=400, detail="Cantitatea trebuie sa fie cel putin 1.")
    db.add(Utilizare(idatelier=idatelier, idmaterial=data.idmaterial, cantitate=data.cantitate))
    db.commit()
    return {"message": "Material asociat."}

@router.delete("/atelier/{idatelier}/{idutilizare}")
def sterge_asociere(idatelier: int, idutilizare: int, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier, Atelier.idinstructor == instructor.idinstructor).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    u = db.query(Utilizare).filter(Utilizare.idutilizare == idutilizare).first()
    if not u:
        raise HTTPException(status_code=404, detail="Asocierea nu a fost gasita.")
    db.delete(u)
    db.commit()
    return {"message": "Material eliminat."}

@router.post("/atelier/{idatelier}/salveaza")
def salveaza_materiale(idatelier: int, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier, Atelier.idinstructor == instructor.idinstructor).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    atelier.materiale_salvate = True
    db.commit()
    return {"materiale_salvate": True}

@router.post("/atelier/{idatelier}/editeaza")
def editeaza_materiale(idatelier: int, db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier, Atelier.idinstructor == instructor.idinstructor).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelierul nu a fost gasit.")
    atelier.materiale_salvate = False
    db.commit()
    return {"materiale_salvate": False}

@router.get("/raport-financiar")
def raport_financiar(db: Session = Depends(get_db), utilizator=Depends(get_utilizator_curent)):
    instructor = get_instructor(utilizator, db)
    iid = instructor.idinstructor

    from sqlalchemy import cast, DateTime, text
    from datetime import datetime
    now = datetime.now()

    def filtru_incheiate(q):
        return q.filter(Atelier.idinstructor == iid).filter(
            func.cast(func.concat(Atelier.data, ' ', Atelier.ora), DateTime) < now
        )

    total_cheltuit = db.query(
        func.coalesce(func.sum(Utilizare.cantitate * Materiale.pret), 0)
    ).join(Materiale, Utilizare.idmaterial == Materiale.idmaterial)     .join(Atelier, Utilizare.idatelier == Atelier.idatelier)     .filter(Atelier.idinstructor == iid)     .filter(func.cast(func.concat(Atelier.data, ' ', Atelier.ora), DateTime) < now).scalar()

    total_castigat = db.query(
        func.coalesce(func.sum(Atelier.pret), 0)
    ).join(Inregistrare, Atelier.idatelier == Inregistrare.idatelier)     .filter(Atelier.idinstructor == iid)     .filter(Inregistrare.status == 'Participare')     .filter(func.cast(func.concat(Atelier.data, ' ', Atelier.ora), DateTime) < now).scalar()

    ateliere = db.query(Atelier).filter(Atelier.idinstructor == iid)        .filter(func.cast(func.concat(Atelier.data, ' ', Atelier.ora), DateTime) < now)        .order_by(Atelier.data.desc()).all()
    detalii = []
    for a in ateliere:
        cheltuit_atelier = db.query(
            func.coalesce(func.sum(Utilizare.cantitate * Materiale.pret), 0)
        ).join(Materiale, Utilizare.idmaterial == Materiale.idmaterial)         .filter(Utilizare.idatelier == a.idatelier).scalar()

        castigat_atelier = db.query(
            func.count(Inregistrare.idinregistrare)
        ).filter(Inregistrare.idatelier == a.idatelier)         .filter(Inregistrare.status == 'Participare').scalar()

        castigat_atelier_val = float(castigat_atelier) * float(a.pret)

        detalii.append({
            "idatelier": a.idatelier,
            "denumire": a.denumire,
            "data": str(a.data),
            "pret": float(a.pret),
            "nr_participanti": castigat_atelier,
            "castigat": round(castigat_atelier_val, 2),
            "cheltuit": round(float(cheltuit_atelier), 2),
            "profit": round(castigat_atelier_val - float(cheltuit_atelier), 2),
        })

    total_c = float(total_cheltuit)
    total_k = float(total_castigat)
    return {
        "total_castigat": round(total_k, 2),
        "total_cheltuit": round(total_c, 2),
        "profit_net": round(total_k - total_c, 2),
        "ateliere": detalii,
    }
