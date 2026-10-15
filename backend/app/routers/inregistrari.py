from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from datetime import datetime
from ..database import get_db
from ..models import Inregistrare, Atelier, Participant, Utilizator
from .auth import get_utilizator_curent

router = APIRouter(prefix="/inregistrari", tags=["Inregistrari"])

class InregistrareCreate(BaseModel):
    idatelier: int

@router.post("/", status_code=status.HTTP_201_CREATED)
def inscriere(
    data: InregistrareCreate,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.participant:
        raise HTTPException(status_code=403, detail="Doar participantii se pot inscrie")

    atelier = db.query(Atelier).filter(Atelier.idatelier == data.idatelier).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit")
    if datetime.combine(atelier.data, atelier.ora) <= datetime.now():
        raise HTTPException(status_code=400, detail="Nu te poti inscrie la un atelier care a avut deja loc")
    nr_inscrisi = db.query(Inregistrare).filter(
        Inregistrare.idatelier == atelier.idatelier,
        Inregistrare.status == 'Inscriere'
    ).count()
    if atelier.locatie and nr_inscrisi >= atelier.locatie.capacitate:
        raise HTTPException(status_code=400, detail="Atelierul este complet. Nu mai sunt locuri disponibile.")

    exista = db.query(Inregistrare).filter(
        Inregistrare.idparticipant == utilizator_curent.participant.idparticipant,
        Inregistrare.idatelier == data.idatelier
    ).first()

    if exista:
        if exista.status == 'Anulare':
            exista.status = 'Inscriere'
            db.commit()
            return {"message": "Reinscris cu succes!"}
        raise HTTPException(status_code=400, detail="Esti deja inscris la acest atelier")

    inregistrare = Inregistrare(
        idparticipant=utilizator_curent.participant.idparticipant,
        idatelier=data.idatelier,
        status="Inscriere"
    )
    db.add(inregistrare)
    db.commit()
    return {"message": "Inscris cu succes!"}

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def anulare(
    id: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    inregistrare = db.query(Inregistrare).filter(Inregistrare.idinregistrare == id).first()
    if not inregistrare:
        raise HTTPException(status_code=404, detail="Inregistrare negasita")
    if inregistrare.idparticipant != utilizator_curent.participant.idparticipant:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea sa anulezi aceasta inscriere")

    atelier = db.query(Atelier).filter(Atelier.idatelier == inregistrare.idatelier).first()
    zile_ramase = (atelier.data - datetime.now().date()).days
    if zile_ramase < 10:
        raise HTTPException(
            status_code=400,
            detail="Anularea nu mai este posibila. Inscrierea poate fi anulata cu cel putin 10 zile inainte de atelier."
        )

    inregistrare.status = "Anulare"
    db.commit()

@router.get("/ale-mele")
def inregistrarile_mele(
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.participant:
        raise HTTPException(status_code=403, detail="Doar participantii au inscrieri")

    return db.query(Inregistrare).options(
        joinedload(Inregistrare.atelier).joinedload(Atelier.locatie)
    ).filter(
        Inregistrare.idparticipant == utilizator_curent.participant.idparticipant
    ).all()

@router.get("/atelier/{idatelier}")
def participanti_atelier(
    idatelier: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot vedea participantii")

    atelier = db.query(Atelier).filter(Atelier.idatelier == idatelier).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit")
    if atelier.idinstructor != utilizator_curent.instructor.idinstructor:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea sa vezi participantii acestui atelier")

    inregistrari = db.query(Inregistrare).options(
        joinedload(Inregistrare.participant).joinedload(Participant.utilizator)
    ).filter(
        Inregistrare.idatelier == idatelier,
        Inregistrare.status == 'Inscriere'
    ).all()

    return [
        {
            "idinregistrare": i.idinregistrare,
            "status": i.status,
            "datainscriere": i.datainscriere,
            "nume": i.participant.utilizator.nume if i.participant and i.participant.utilizator else "",
            "prenume": i.participant.utilizator.prenume if i.participant and i.participant.utilizator else "",
        }
        for i in inregistrari
    ]

@router.put("/{id}/participare", status_code=200)
def marcare_participare(
    id: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot marca participarea")

    inregistrare = db.query(Inregistrare).filter(Inregistrare.idinregistrare == id).first()
    if not inregistrare:
        raise HTTPException(status_code=404, detail="Inregistrare negasita")

    atelier = db.query(Atelier).filter(Atelier.idatelier == inregistrare.idatelier).first()
    if atelier.idinstructor != utilizator_curent.instructor.idinstructor:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea sa modifici aceasta inscriere")

    if inregistrare.status == 'Participare':
        raise HTTPException(status_code=400, detail="Participarea a fost deja marcata")
    if inregistrare.status != 'Inscriere':
        raise HTTPException(status_code=400, detail="Inscrierea a fost anulata si nu poate fi marcata ca participare")

    inregistrare.status = "Participare"
    atelier.nrparticipanti += 1
    db.commit()
    return {"message": "Participare marcata cu succes!"}
