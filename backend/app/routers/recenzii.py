from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import json
import requests as http_requests
from ..database import get_db
from ..models import Recenzie, Inregistrare, Utilizator, Participant, Atelier, RezumatFeedback
from .auth import get_utilizator_curent

router = APIRouter(prefix="/recenzii", tags=["Recenzii"])

class RecenzieCreate(BaseModel):
    idinregistrare: int
    rating: int
    comentariu: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def adauga_recenzie(
    data: RecenzieCreate,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.participant:
        raise HTTPException(status_code=403, detail="Doar participantii pot adauga recenzii")

    inregistrare = db.query(Inregistrare).filter(
        Inregistrare.idinregistrare == data.idinregistrare,
        Inregistrare.idparticipant == utilizator_curent.participant.idparticipant
    ).first()
    if not inregistrare:
        raise HTTPException(status_code=404, detail="Inregistrare negasita")
    if inregistrare.status != "Participare":
        raise HTTPException(status_code=400, detail="Poti recenza doar atelierele la care ai participat efectiv")

    if db.query(Recenzie).filter(Recenzie.idinregistrare == data.idinregistrare).first():
        raise HTTPException(status_code=400, detail="Ai adaugat deja o recenzie pentru acest atelier")

    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating-ul trebuie sa fie intre 1 si 5")

    recenzie = Recenzie(
        idinregistrare=data.idinregistrare,
        rating=data.rating,
        comentariu=data.comentariu
    )
    db.add(recenzie)
    db.commit()
    return {"message": "Recenzie adaugata cu succes!"}

@router.get("/atelier/{idatelier}")
def recenzii_atelier(idatelier: int, db: Session = Depends(get_db)):
    rows = (
        db.query(Recenzie, Utilizator)
        .join(Inregistrare, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .join(Participant, Inregistrare.idparticipant == Participant.idparticipant)
        .join(Utilizator, Participant.idutilizator == Utilizator.idutilizator)
        .filter(Inregistrare.idatelier == idatelier)
        .all()
    )
    return [
        {
            "idinregistrare": r.idinregistrare,
            "rating": r.rating,
            "comentariu": r.comentariu,
            "dataora": r.dataora,
            "prenume": u.prenume,
            "nume": u.nume,
        }
        for r, u in rows
    ]

@router.get("/ale-mele")
def recenziile_mele(
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent)
):
    if not utilizator_curent.participant:
        raise HTTPException(status_code=403, detail="Doar participantii pot vedea recenziile")
    return db.query(Recenzie).join(Inregistrare).filter(
        Inregistrare.idparticipant == utilizator_curent.participant.idparticipant
    ).all()

def _build_feedback_prompt(comentarii: List[str]) -> str:
    lista = "\n".join(f"{i+1}. {c}" for i, c in enumerate(comentarii))
    return f"""Analizează următoarele comentarii primite după un workshop și generează un rezumat structurat.

Comentarii:
{lista}

Cerințe:
- Scrie doar în română.
- Bazează-te exclusiv pe comentariile primite.
- Nu inventa detalii care nu există în comentarii.
- Evidențiază ideile care apar la mai mulți participanți.

Returnează DOAR un obiect JSON valid, fără markdown, fără explicații, cu exact această structură:
{{
  "rezumat_general": "3-4 propoziții care rezumă global feedback-ul",
  "puncte_forte": ["punct 1", "punct 2", "punct 3"],
  "puncte_slabe": ["punct 1", "punct 2"],
  "sugestii": ["sugestie 1", "sugestie 2", "sugestie 3"]
}}"""

def _call_ollama(prompt: str) -> dict:
    try:
        resp = http_requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.2},
            },
            timeout=180,
        )
        resp.raise_for_status()
        raw = resp.json()["response"]
        return json.loads(raw.strip())
    except http_requests.RequestException:
        raise HTTPException(status_code=503, detail="Ollama nu este disponibil. Porneste Ollama local.")
    except (json.JSONDecodeError, KeyError):
        raise HTTPException(status_code=422, detail="Raspunsul LLM nu este JSON valid.")

@router.get("/atelier/{idatelier}/rezumat")
def get_rezumat(
    idatelier: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent),
):
    """Întoarce cel mai recent rezumat salvat pentru atelierul dat."""
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot vedea rezumatul.")
    rez = (
        db.query(RezumatFeedback)
        .filter(RezumatFeedback.idatelier == idatelier)
        .order_by(RezumatFeedback.generat_la.desc())
        .first()
    )
    if not rez:
        return None
    return {
        "idrezumat": rez.idrezumat,
        "rezumat_general": rez.rezumat_general,
        "puncte_forte": json.loads(rez.puncte_forte),
        "puncte_slabe": json.loads(rez.puncte_slabe),
        "sugestii": json.loads(rez.sugestii),
        "generat_la": rez.generat_la,
    }

@router.post("/atelier/{idatelier}/rezumat")
def genereaza_rezumat(
    idatelier: int,
    db: Session = Depends(get_db),
    utilizator_curent: Utilizator = Depends(get_utilizator_curent),
):
    """Generează și salvează un rezumat al feedback-ului folosind LLM."""
    if not utilizator_curent.instructor:
        raise HTTPException(status_code=403, detail="Doar instructorii pot genera rezumate.")

    atelier = db.query(Atelier).filter(
        Atelier.idatelier == idatelier,
        Atelier.idinstructor == utilizator_curent.instructor.idinstructor,
    ).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier negasit.")

    rows = (
        db.query(Recenzie)
        .join(Inregistrare, Recenzie.idinregistrare == Inregistrare.idinregistrare)
        .filter(Inregistrare.idatelier == idatelier)
        .all()
    )
    if not rows:
        raise HTTPException(status_code=400, detail="Nu exista recenzii pentru acest atelier.")

    comentarii = [r.comentariu for r in rows if r.comentariu and r.comentariu.strip()]
    if not comentarii:
        raise HTTPException(status_code=400, detail="Nu exista comentarii text pentru acest atelier.")

    prompt = _build_feedback_prompt(comentarii)
    data = _call_ollama(prompt)

    required = {"rezumat_general", "puncte_forte", "puncte_slabe", "sugestii"}
    if not required.issubset(data.keys()):
        raise HTTPException(status_code=422, detail="Structura JSON returnata de LLM este incompleta.")

    rez = RezumatFeedback(
        idatelier=idatelier,
        rezumat_general=data["rezumat_general"],
        puncte_forte=json.dumps(data["puncte_forte"], ensure_ascii=False),
        puncte_slabe=json.dumps(data["puncte_slabe"], ensure_ascii=False),
        sugestii=json.dumps(data["sugestii"], ensure_ascii=False),
    )
    db.add(rez)
    db.commit()
    db.refresh(rez)

    return {
        "idrezumat": rez.idrezumat,
        "rezumat_general": data["rezumat_general"],
        "puncte_forte": data["puncte_forte"],
        "puncte_slabe": data["puncte_slabe"],
        "sugestii": data["sugestii"],
        "generat_la": rez.generat_la,
    }
