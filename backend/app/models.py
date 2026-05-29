from sqlalchemy import (
    BigInteger, Boolean, CheckConstraint, Column, Date,
    ForeignKey, Integer, Numeric, String, Text, Time,
    TIMESTAMP, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Utilizator(Base):
    __tablename__ = "utilizator"
    idutilizator = Column(BigInteger, primary_key=True, autoincrement=True)
    nume = Column(String(200), nullable=False)
    prenume = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    parola = Column(String(200), nullable=False)
    nrtelefon = Column(String(15), nullable=True)
    datacrearii = Column(TIMESTAMP, nullable=False, server_default=func.now())
    participant = relationship("Participant", back_populates="utilizator", uselist=False)
    instructor = relationship("Instructor", back_populates="utilizator", uselist=False)
    administrator = relationship("Administrator", back_populates="utilizator", uselist=False)


class Participant(Base):
    __tablename__ = "participant"
    idparticipant = Column(BigInteger, primary_key=True, autoincrement=True)
    varsta = Column(Integer, nullable=False)
    idutilizator = Column(BigInteger, ForeignKey("utilizator.idutilizator", ondelete="CASCADE"), nullable=False, unique=True)
    utilizator = relationship("Utilizator", back_populates="participant")
    inregistrari = relationship("Inregistrare", back_populates="participant")
    __table_args__ = (
        CheckConstraint("varsta BETWEEN 1 AND 120", name="ck_participant_varsta"),
    )


class Instructor(Base):
    __tablename__ = "instructor"
    idinstructor = Column(BigInteger, primary_key=True, autoincrement=True)
    bio = Column(String(500), nullable=True)
    specializare = Column(String(200), nullable=True)
    idutilizator = Column(BigInteger, ForeignKey("utilizator.idutilizator", ondelete="CASCADE"), nullable=False, unique=True)
    utilizator = relationship("Utilizator", back_populates="instructor")
    ateliere = relationship("Atelier", back_populates="instructor")


class Locatie(Base):
    __tablename__ = "locatie"
    idlocatie = Column(BigInteger, primary_key=True, autoincrement=True)
    nume = Column(String(200), nullable=False)
    adresa = Column(String(300), nullable=False)
    oras = Column(String(200), nullable=False)
    capacitate = Column(Integer, nullable=False)
    ateliere = relationship("Atelier", back_populates="locatie")
    __table_args__ = (
        UniqueConstraint("nume", "adresa", "oras", name="uq_locatie"),
        CheckConstraint("capacitate BETWEEN 1 AND 5000", name="ck_locatie_capacitate"),
    )


class Categorie(Base):
    __tablename__ = "categorie"
    idcategorie = Column(BigInteger, primary_key=True, autoincrement=True)
    denumire = Column(String(200), nullable=False, unique=True)
    teme = relationship("Tema", back_populates="categorie")


class Tema(Base):
    __tablename__ = "tema"
    idtema = Column(BigInteger, primary_key=True, autoincrement=True)
    denumire = Column(String(200), nullable=False)
    idcategorie = Column(BigInteger, ForeignKey("categorie.idcategorie", ondelete="RESTRICT"), nullable=False)
    categorie = relationship("Categorie", back_populates="teme")
    ateliere = relationship("Atelier", back_populates="tema")
    __table_args__ = (
        UniqueConstraint("denumire", "idcategorie", name="uq_tema"),
    )


class Materiale(Base):
    __tablename__ = "materiale"
    idmaterial = Column(BigInteger, primary_key=True, autoincrement=True)
    denumire = Column(String(200), nullable=False)
    pret = Column(Numeric(10, 2), nullable=False)
    idinstructor = Column(BigInteger, ForeignKey("instructor.idinstructor", ondelete="CASCADE"), nullable=True)
    utilizari = relationship("Utilizare", back_populates="material")
    __table_args__ = (
        CheckConstraint("pret >= 0", name="ck_materiale_pret"),
    )


class Atelier(Base):
    __tablename__ = "atelier"
    idatelier = Column(BigInteger, primary_key=True, autoincrement=True)
    denumire = Column(String(200), nullable=False)
    descriere = Column(String(1000), nullable=True)
    pret = Column(Numeric(10, 2), nullable=False)
    varstamin = Column(Integer, nullable=False)
    varstamax = Column(Integer, nullable=False)
    durata = Column(Integer, nullable=False)
    data = Column(Date, nullable=False)
    ora = Column(Time, nullable=False)
    nrparticipanti = Column(Integer, nullable=False, default=0)
    idtema = Column(BigInteger, ForeignKey("tema.idtema", ondelete="RESTRICT"), nullable=False)
    idlocatie = Column(BigInteger, ForeignKey("locatie.idlocatie", ondelete="RESTRICT"), nullable=False)
    idinstructor = Column(BigInteger, ForeignKey("instructor.idinstructor", ondelete="RESTRICT"), nullable=False)
    tema = relationship("Tema", back_populates="ateliere")
    locatie = relationship("Locatie", back_populates="ateliere")
    instructor = relationship("Instructor", back_populates="ateliere")
    nivel = Column(String(20), nullable=False, default="Incepator")
    materiale_salvate = Column(Boolean, nullable=False, default=False)
    inregistrari = relationship("Inregistrare", back_populates="atelier")
    utilizari = relationship("Utilizare", back_populates="atelier")
    __table_args__ = (
        CheckConstraint("pret >= 0", name="ck_atelier_pret"),
        CheckConstraint("varstamin BETWEEN 1 AND 120 AND varstamax BETWEEN 1 AND 120 AND varstamin <= varstamax", name="ck_atelier_varste"),
        CheckConstraint("durata BETWEEN 15 AND 1440", name="ck_atelier_durata"),
        CheckConstraint("nrparticipanti >= 0", name="ck_atelier_nrparticipanti"),
        UniqueConstraint("denumire", "data", "ora", "idlocatie", name="uq_atelier_semantic"),
    )


class Inregistrare(Base):
    __tablename__ = "inregistrare"
    idinregistrare = Column(BigInteger, primary_key=True, autoincrement=True)
    datainscriere = Column(TIMESTAMP, nullable=False, server_default=func.now())
    status = Column(String(20), nullable=False)
    idparticipant = Column(BigInteger, ForeignKey("participant.idparticipant", ondelete="CASCADE"), nullable=False)
    idatelier = Column(BigInteger, ForeignKey("atelier.idatelier", ondelete="CASCADE"), nullable=False)
    participant = relationship("Participant", back_populates="inregistrari")
    atelier = relationship("Atelier", back_populates="inregistrari")
    recenzie = relationship("Recenzie", back_populates="inregistrare", uselist=False)
    __table_args__ = (
        UniqueConstraint("idparticipant", "idatelier", name="uq_inregistrare"),
        CheckConstraint("status IN ('Inscriere', 'Participare', 'Anulare')", name="ck_inregistrare_status"),
    )


class Recenzie(Base):
    __tablename__ = "recenzie"
    idrecenzie = Column(BigInteger, primary_key=True, autoincrement=True)
    rating = Column(Integer, nullable=False)
    comentariu = Column(Text, nullable=True)
    dataora = Column(TIMESTAMP, nullable=False, server_default=func.now())
    idinregistrare = Column(BigInteger, ForeignKey("inregistrare.idinregistrare", ondelete="CASCADE"), nullable=False, unique=True)
    inregistrare = relationship("Inregistrare", back_populates="recenzie")
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_recenzie_rating"),
    )


class Utilizare(Base):
    __tablename__ = "utilizare"
    idutilizare = Column(BigInteger, primary_key=True, autoincrement=True)
    cantitate = Column(Integer, nullable=False)
    idatelier = Column(BigInteger, ForeignKey("atelier.idatelier", ondelete="CASCADE"), nullable=False)
    idmaterial = Column(BigInteger, ForeignKey("materiale.idmaterial", ondelete="RESTRICT"), nullable=False)
    atelier = relationship("Atelier", back_populates="utilizari")
    material = relationship("Materiale", back_populates="utilizari")

class Administrator(Base):
    __tablename__ = "administrator"
    idadministrator = Column(BigInteger, primary_key=True, autoincrement=True)
    idutilizator = Column(BigInteger, ForeignKey("utilizator.idutilizator", ondelete="CASCADE"), nullable=False, unique=True)
    utilizator = relationship("Utilizator", back_populates="administrator")


class MesajContact(Base):
    __tablename__ = "mesaj_contact"
    idmesaj = Column(BigInteger, primary_key=True, autoincrement=True)
    nume = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    subiect = Column(String(200), nullable=False)
    mesaj = Column(String(1000), nullable=False)
    dataora = Column(TIMESTAMP, nullable=False, server_default=func.now())
    citit = Column(Boolean, nullable=False, default=False)

class RezumatFeedback(Base):
    __tablename__ = "rezumat_feedback"
    idrezumat = Column(BigInteger, primary_key=True, autoincrement=True)
    idatelier = Column(BigInteger, ForeignKey("atelier.idatelier", ondelete="CASCADE"), nullable=False)
    rezumat_general = Column(String(2000), nullable=False)
    puncte_forte = Column(String(1000), nullable=False)
    puncte_slabe = Column(String(1000), nullable=False)
    sugestii = Column(String(1000), nullable=False)
    generat_la = Column(TIMESTAMP, nullable=False, server_default=func.now())
