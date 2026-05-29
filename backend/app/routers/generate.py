import json
import re
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/generate", tags=["Generare"])

MAX_ATTEMPTS = 3

INFINITIVE_VERBS = [
    "analiza",
    "aplica",
    "compara",
    "construi",
    "crea",
    "descoperi",
    "dezvolta",
    "edita",
    "evalua",
    "exersa",
    "explora",
    "folosi",
    "identifica",
    "intelege",
    "invata",
    "observa",
    "organiza",
    "planifica",
    "prezenta",
    "realiza",
    "redacta",
    "selecta",
    "utiliza",
]

BANNED_PHRASES = [
    "vom descoperi impreuna",
    "secretele succesului",
    "inaintam",
]


class GenerateRequest(BaseModel):
    denumire: str
    categorie: str
    tema: str
    nivel: str = "Incepator"
    durata: int
    varstamin: int
    varstamax: int


def extract_json(text):
    text = text.strip()
    if not text:
        raise ValueError("empty_response")
    return json.loads(text)


def normalize_text(text):
    text = text.lower()
    replacements = str.maketrans({
        "ă": "a",
        "â": "a",
        "î": "i",
        "ș": "s",
        "ş": "s",
        "ț": "t",
        "ţ": "t",
    })
    return text.translate(replacements)


def count_words(text):
    return len(re.findall(r"\b\w+\b", text, flags=re.UNICODE))


def count_sentences(text):
    text = text.strip()
    if not text:
        return 0
    sentences = re.findall(r"[^.!?]+[.!?]", text)
    if sentences:
        return len(sentences)
    return 1


def objective_starts_with_infinitive(text):
    words = re.findall(r"\b[\wăâîșşțţ-]+\b", text.strip(), flags=re.UNICODE)
    if not words:
        return False
    first_word = normalize_text(words[0])
    if first_word == "a" and len(words) > 1:
        first_word = normalize_text(words[1])
    elif first_word != "a":
        return False
    return first_word in INFINITIVE_VERBS


def validate_generated_content(data):
    reasons = []

    if not isinstance(data, dict):
        return False, ["invalid_schema"]

    if "description" not in data:
        reasons.append("missing_field_description")
    elif not isinstance(data["description"], str):
        reasons.append("wrong_type_description")
    elif not data["description"].strip():
        reasons.append("empty_description")
    elif count_words(data["description"]) < 80:
        reasons.append("too_short_description")

    if "objectives" not in data:
        reasons.append("missing_field_objectives")
    elif not isinstance(data["objectives"], list):
        reasons.append("wrong_type_objectives")
    else:
        objectives = data["objectives"]
        if len(objectives) != 3:
            reasons.append("wrong_objectives_count")
        for item in objectives:
            if not isinstance(item, str):
                reasons.append("wrong_type_objective_item")
                break
        if not reasons or "wrong_type_objective_item" not in reasons:
            for item in objectives:
                cleaned = item.strip()
                if not cleaned:
                    reasons.append("empty_objective")
                    continue
                if count_words(cleaned) > 12:
                    reasons.append("objective_too_long")
                if not objective_starts_with_infinitive(cleaned):
                    reasons.append("objective_not_infinitive")

    if "targetText" not in data:
        reasons.append("missing_field_targetText")
    elif not isinstance(data["targetText"], str):
        reasons.append("wrong_type_targetText")
    elif not data["targetText"].strip():
        reasons.append("empty_targetText")
    else:
        sentence_count = count_sentences(data["targetText"])
        if sentence_count < 1 or sentence_count > 2:
            reasons.append("wrong_targetText_sentence_count")

    all_text = []
    for key in ["description", "targetText"]:
        value = data.get(key)
        if isinstance(value, str):
            all_text.append(value)
    objectives = data.get("objectives")
    if isinstance(objectives, list):
        for item in objectives:
            if isinstance(item, str):
                all_text.append(item)

    normalized_text = normalize_text(" ".join(all_text))
    for phrase in BANNED_PHRASES:
        if phrase in normalized_text:
            reasons.append("banned_phrase")
            break

    reasons = list(dict.fromkeys(reasons))
    return len(reasons) == 0, reasons


def generate_with_ollama(prompt):
    response = requests.post(
        "http://127.0.0.1:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2
            }
        },
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["response"]


def build_prompt(req):
    durata_text = f"{req.durata // 60} ore" if req.durata >= 60 else f"{req.durata} minute"
    public = f"{req.varstamin}–{req.varstamax} ani"
    return f"""
Generează conținut pentru un workshop pe baza datelor de mai jos.

Titlu: {req.denumire}
Categorie: {req.categorie}
Temă: {req.tema}
Nivel: {req.nivel}
Durată: {durata_text}
Public țintă: {public}

Cerințe de conținut:
1. Scrie o descriere clară, naturală și corectă gramatical, de minimum 80 de cuvinte.
2. Include EXACT 3 obiective de învățare.
3. Scrie un text scurt despre publicul țintă, de 1-2 propoziții.

Cerințe de stil:
- Scrie numai în română.
- Folosește un stil neutru, natural, clar.
- Folosește formulări simple, naturale și precise.
- Păstrează aceeași persoană gramaticală în tot textul.
- Folosește numai persoana a III-a plural sau numai formulări impersonale.
- Nu folosi formulări figurate sau motivaționale.
- Nu folosi metafore.
- Folosește verbe simple și clare, de tipul: învăța, exersa, aplica, crea, analiza, descoperi.
- Nu folosi anglicisme inutile.
- Nu folosi cuvinte inventate, acorduri greșite sau construcții nefirești.
- Nu repeta inutil aceeași idee.
- Nu folosi expresii precum „vom descoperi împreună", „secretele succesului", „înaintăm".
- Fiecare obiectiv trebuie să înceapă cu un verb la infinitiv.
- Fiecare obiectiv trebuie să fie scurt, clar și paralel sintactic cu celelalte obiective.

Cerințe de format:
- Răspunsul trebuie să fie DOAR JSON valid.
- Nu include markdown, explicații, comentarii sau text înainte/după JSON.
- Respectă exact această schemă:

Schema:
{{
  "description": "...",
  "objectives": ["...", "...", "..."],
  "targetText": "..."
}}

Returnează un singur obiect JSON valid.
Nu adăuga text înainte sau după JSON.
Nu adăuga explicații.
"""


def build_retry_prompt(req, reasons):
    reasons_text = ", ".join(reasons)
    return build_prompt(req) + f"""

Răspunsul anterior a fost invalid.
Corectează următoarele probleme: {reasons_text}.

Instrucțiuni suplimentare:
- Descrierea trebuie să aibă cel puțin 80 de cuvinte complete.
- Scrie o descriere puțin mai lungă decât minimul, ca să nu fie respinsă.
- Obiectivele trebuie să înceapă la infinitiv, de exemplu:
  "a invata notiuni de baza"
  "a exersa folosirea materialelor"
  "a realiza o lucrare simpla"
- Nu folosi forme ca: "vor invata", "sa creeze", "descopera".
- Păstrează exact 3 obiective.
- Returnează din nou doar JSON valid.
"""


@router.post("/descriere")
def generate_descriere(req: GenerateRequest):
    prompt = build_prompt(req)
    last_errors = []

    for attempt in range(MAX_ATTEMPTS):
        try:
            raw = generate_with_ollama(prompt)
        except requests.RequestException:
            raise HTTPException(status_code=503, detail="Ollama nu este disponibil. Porneste Ollama local.")

        try:
            data = extract_json(raw)
        except (ValueError, json.JSONDecodeError):
            last_errors = ["invalid_json"]
            prompt = build_retry_prompt(req, last_errors)
            continue

        valid, reasons = validate_generated_content(data)
        if valid:
            return data

        last_errors = reasons
        prompt = build_retry_prompt(req, reasons)

    raise HTTPException(
        status_code=422,
        detail=f"Nu s-a putut genera o descriere valida dupa {MAX_ATTEMPTS} incercari: {', '.join(last_errors)}"
    )
