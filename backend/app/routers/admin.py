from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from sqlalchemy import func
from ..models import Utilizator, Participant, Instructor, Atelier, MesajContact, Tema, Categorie, Locatie, Inregistrare, Recenzie
from .auth import get_admin_curent, anonimizeaza_cont

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/utilizatori")
def get_utilizatori(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    utilizatori = db.query(Utilizator).filter(Utilizator.sters == False).all()
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
    if not utilizator or utilizator.sters:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit.")

    # Anonimizare: datele personale sunt eliminate, dar contul, recenziile si atelierele raman.
    # Ridica 400 daca instructorul are ateliere active sau participantul are inscrieri active.
    anonimizeaza_cont(utilizator, db)
    return {"message": "Cont sters. Recenziile au fost pastrate."}


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


@router.get("/statistici")
def get_statistici(db: Session = Depends(get_db), _=Depends(get_admin_curent)):
    total_utilizatori = db.query(Utilizator).filter(Utilizator.sters == False).count()
    total_ateliere = db.query(Atelier).count()
    total_inscrieri = db.query(Inregistrare).filter(Inregistrare.status == 'Inscriere').count()
    total_participari = db.query(Inregistrare).filter(Inregistrare.status == 'Participare').count()
    total_recenzii = db.query(Recenzie).count()

    instructori = (
        db.query(
            Utilizator.prenume,
            Utilizator.nume,
            func.count(func.distinct(Atelier.idatelier)).label("nr_ateliere"),
            func.coalesce(func.round(func.avg(Recenzie.rating), 2), 0).label("rating_mediu"),
            func.count(func.distinct(Recenzie.idrecenzie)).label("nr_recenzii"),
            func.count(Inregistrare.idinregistrare).filter(Inregistrare.status == 'Participare').label("total_participanti"),
        )
        .join(Instructor, Instructor.idutilizator == Utilizator.idutilizator)
        .outerjoin(Atelier, Atelier.idinstructor == Instructor.idinstructor)
        .outerjoin(Inregistrare, Inregistrare.idatelier == Atelier.idatelier)
        .outerjoin(Recenzie, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .group_by(Utilizator.prenume, Utilizator.nume)
        .order_by(func.count(func.distinct(Atelier.idatelier)).desc())
        .all()
    )

    top_ateliere = (
        db.query(
            Atelier.idatelier,
            Atelier.denumire,
            Atelier.data,
            Utilizator.prenume,
            Utilizator.nume,
            func.count(Inregistrare.idinregistrare).filter(Inregistrare.status != 'Anulare').label("nr_inscrisi"),
            func.coalesce(func.round(func.avg(Recenzie.rating), 1), 0).label("rating_mediu"),
        )
        .join(Instructor, Atelier.idinstructor == Instructor.idinstructor)
        .join(Utilizator, Instructor.idutilizator == Utilizator.idutilizator)
        .outerjoin(Inregistrare, Inregistrare.idatelier == Atelier.idatelier)
        .outerjoin(Recenzie, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .group_by(Atelier.idatelier, Atelier.denumire, Atelier.data, Utilizator.prenume, Utilizator.nume)
        .order_by(func.count(Inregistrare.idinregistrare).filter(Inregistrare.status != 'Anulare').desc())
        .limit(5)
        .all()
    )

    top_ateliere_rating = (
        db.query(
            Atelier.idatelier,
            Atelier.denumire,
            Atelier.data,
            Utilizator.prenume,
            Utilizator.nume,
            func.count(Recenzie.idrecenzie).label("nr_recenzii"),
            func.round(func.avg(Recenzie.rating), 1).label("rating_mediu"),
        )
        .join(Instructor, Atelier.idinstructor == Instructor.idinstructor)
        .join(Utilizator, Instructor.idutilizator == Utilizator.idutilizator)
        .join(Inregistrare, Inregistrare.idatelier == Atelier.idatelier)
        .join(Recenzie, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .group_by(Atelier.idatelier, Atelier.denumire, Atelier.data, Utilizator.prenume, Utilizator.nume)
        .having(func.count(Recenzie.idrecenzie) > 0)
        .order_by(func.avg(Recenzie.rating).desc(), func.count(Recenzie.idrecenzie).desc())
        .limit(5)
        .all()
    )

    return {
        "general": {
            "total_utilizatori": total_utilizatori,
            "total_ateliere": total_ateliere,
            "total_inscrieri": total_inscrieri,
            "total_participari": total_participari,
            "total_recenzii": total_recenzii,
        },
        "instructori": [
            {
                "nume": f"{r.prenume} {r.nume}",
                "nr_ateliere": r.nr_ateliere,
                "rating_mediu": float(r.rating_mediu),
                "nr_recenzii": r.nr_recenzii,
                "total_participanti": r.total_participanti,
            }
            for r in instructori
        ],
        "top_ateliere": [
            {
                "idatelier": r.idatelier,
                "denumire": r.denumire,
                "data": r.data,
                "instructor": f"{r.prenume} {r.nume}",
                "nr_inscrisi": r.nr_inscrisi,
                "rating_mediu": float(r.rating_mediu),
            }
            for r in top_ateliere
        ],
        "top_ateliere_rating": [
            {
                "idatelier": r.idatelier,
                "denumire": r.denumire,
                "instructor": f"{r.prenume} {r.nume}",
                "nr_recenzii": r.nr_recenzii,
                "rating_mediu": float(r.rating_mediu),
            }
            for r in top_ateliere_rating
        ],
    }
