# CraftManager

Aplicație web pentru managementul atelierelor creative.
Lucrare de licență · Chiru Silviana · 2026

Necesită: PostgreSQL, Python 3.11+, Node.js 18+ și Ollama cu `llama3` pentru funcțiile AI.

## 1. Baza de date

```bash
psql -U postgres -c "CREATE DATABASE silvianachiru;"
psql -U postgres -d silvianachiru -f craftmanager_db.sql
```

Datele de conectare trebuie să corespundă cu `DATABASE_URL` din `backend/.env`.

## 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicația: `http://localhost:5173`

## Conturi de test

| Rol | Email | Parolă |
|-----|-------|--------|
| Administrator | admin@craftmanager.ro | admin123 |
| Instructor | instructor@test.com | test123 |
| Participant | adresa@gmail.com | olarit |
# craftmanager
