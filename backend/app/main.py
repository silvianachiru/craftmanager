from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .routers import auth, ateliere, inregistrari, recenzii, categorii, teme, instructori, generate, contact, admin, materiale

app = FastAPI(title="CraftManager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ateliere.router)
app.include_router(inregistrari.router)
app.include_router(recenzii.router)
app.include_router(categorii.router)
app.include_router(teme.router)
app.include_router(instructori.router)
app.include_router(generate.router)
app.include_router(contact.router)
app.include_router(admin.router)
app.include_router(materiale.router)

@app.get("/")
def root():
    return {"message": "CraftManager API rulează!"}