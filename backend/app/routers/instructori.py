from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal
from datetime import date, time
from ..database import get_db
from ..models import Instructor, Atelier, Recenzie, Inregistrare, Utilizator, Participant

router = APIRouter(prefix="/instructori", tags=["Instructori"])


class AtelierSimplificat(BaseModel):
    idatelier: int
    denumire: str
    data: date
    ora: time
    pret: Decimal
    durata: int
    nrparticipanti: int
    model_config = {"from_attributes": True}


class RecenzieInstructor(BaseModel):
    rating: int
    comentariu: Optional[str]
    denumire_atelier: str
    prenume_participant: str
    nume_participant: str


class ProfilInstructorResponse(BaseModel):
    idinstructor: int
    prenume: str
    nume: str
    bio: Optional[str]
    specializare: Optional[str]
    nr_ateliere: int
    rating_mediu: Optional[float]
    ateliere: List[AtelierSimplificat]
    recenzii: List[RecenzieInstructor]


@router.get("/{id}", response_model=ProfilInstructorResponse)
def get_profil_instructor(id: int, db: Session = Depends(get_db)):
    instructor = db.query(Instructor).options(
        joinedload(Instructor.utilizator),
        joinedload(Instructor.ateliere)
    ).filter(Instructor.idinstructor == id).first()

    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor negasit")

    rows = (
        db.query(Recenzie, Atelier, Utilizator)
        .join(Inregistrare, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .join(Atelier, Inregistrare.idatelier == Atelier.idatelier)
        .join(Participant, Inregistrare.idparticipant == Participant.idparticipant)
        .join(Utilizator, Participant.idutilizator == Utilizator.idutilizator)
        .filter(Atelier.idinstructor == id)
        .all()
    )

    recenzii = [
        RecenzieInstructor(
            rating=r.rating,
            comentariu=r.comentariu,
            denumire_atelier=a.denumire,
            prenume_participant=u.prenume,
            nume_participant=u.nume,
        )
        for r, a, u in rows
    ]

    ratinguri = [r.rating for r in recenzii]
    rating_mediu = round(sum(ratinguri) / len(ratinguri), 1) if ratinguri else None

    return ProfilInstructorResponse(
        idinstructor=instructor.idinstructor,
        prenume=instructor.utilizator.prenume,
        nume=instructor.utilizator.nume,
        bio=instructor.bio,
        specializare=instructor.specializare,
        nr_ateliere=len(instructor.ateliere),
        rating_mediu=rating_mediu,
        ateliere=instructor.ateliere,
        recenzii=recenzii,
    )
