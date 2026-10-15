--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4 (Postgres.app)
-- Dumped by pg_dump version 18.4 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrator (
    idadministrator bigint NOT NULL,
    idutilizator bigint NOT NULL
);


--
-- Name: administrator_idadministrator_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.administrator_idadministrator_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: administrator_idadministrator_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.administrator_idadministrator_seq OWNED BY public.administrator.idadministrator;


--
-- Name: atelier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atelier (
    idatelier bigint NOT NULL,
    denumire character varying(200) NOT NULL,
    descriere character varying(1000),
    pret numeric(10,2) NOT NULL,
    varstamin integer NOT NULL,
    varstamax integer NOT NULL,
    durata integer NOT NULL,
    data date NOT NULL,
    ora time without time zone NOT NULL,
    nrparticipanti integer DEFAULT 0 NOT NULL,
    idtema bigint NOT NULL,
    idlocatie bigint NOT NULL,
    idinstructor bigint NOT NULL,
    materiale_salvate boolean DEFAULT false NOT NULL,
    nivel character varying(20) DEFAULT 'Incepator'::character varying NOT NULL,
    CONSTRAINT atelier_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['Incepator'::character varying, 'Mediu'::character varying, 'Avansat'::character varying])::text[]))),
    CONSTRAINT ck_atelier_durata CHECK (((durata >= 15) AND (durata <= 1440))),
    CONSTRAINT ck_atelier_nrparticipanti CHECK ((nrparticipanti >= 0)),
    CONSTRAINT ck_atelier_pret CHECK ((pret >= (0)::numeric)),
    CONSTRAINT ck_atelier_varste CHECK ((((varstamin >= 1) AND (varstamin <= 120)) AND ((varstamax >= 1) AND (varstamax <= 120)) AND (varstamin <= varstamax)))
);


--
-- Name: atelier_idatelier_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atelier_idatelier_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atelier_idatelier_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atelier_idatelier_seq OWNED BY public.atelier.idatelier;


--
-- Name: categorie; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorie (
    idcategorie bigint NOT NULL,
    denumire character varying(200) NOT NULL
);


--
-- Name: categorie_idcategorie_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorie_idcategorie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorie_idcategorie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorie_idcategorie_seq OWNED BY public.categorie.idcategorie;


--
-- Name: inregistrare; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inregistrare (
    idinregistrare bigint NOT NULL,
    datainscriere timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(20) NOT NULL,
    idparticipant bigint NOT NULL,
    idatelier bigint NOT NULL,
    CONSTRAINT ck_inregistrare_status CHECK (((status)::text = ANY ((ARRAY['Inscriere'::character varying, 'Participare'::character varying, 'Anulare'::character varying])::text[])))
);


--
-- Name: inregistrare_idinregistrare_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inregistrare_idinregistrare_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inregistrare_idinregistrare_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inregistrare_idinregistrare_seq OWNED BY public.inregistrare.idinregistrare;


--
-- Name: instructor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instructor (
    idinstructor bigint NOT NULL,
    bio character varying(500),
    specializare character varying(200),
    idutilizator bigint NOT NULL
);


--
-- Name: instructor_idinstructor_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.instructor_idinstructor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instructor_idinstructor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.instructor_idinstructor_seq OWNED BY public.instructor.idinstructor;


--
-- Name: locatie; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locatie (
    idlocatie bigint NOT NULL,
    nume character varying(200) NOT NULL,
    adresa character varying(300) NOT NULL,
    oras character varying(200) NOT NULL,
    capacitate integer NOT NULL,
    CONSTRAINT ck_locatie_capacitate CHECK (((capacitate >= 1) AND (capacitate <= 5000)))
);


--
-- Name: locatie_idlocatie_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locatie_idlocatie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locatie_idlocatie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locatie_idlocatie_seq OWNED BY public.locatie.idlocatie;


--
-- Name: materiale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materiale (
    idmaterial bigint NOT NULL,
    denumire character varying(200) NOT NULL,
    pret numeric(10,2) NOT NULL,
    idinstructor bigint,
    CONSTRAINT ck_materiale_pret CHECK ((pret >= (0)::numeric))
);


--
-- Name: materiale_idmaterial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.materiale_idmaterial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materiale_idmaterial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.materiale_idmaterial_seq OWNED BY public.materiale.idmaterial;


--
-- Name: mesaj_contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesaj_contact (
    idmesaj bigint NOT NULL,
    nume character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    subiect character varying(200) NOT NULL,
    mesaj character varying(1000) NOT NULL,
    dataora timestamp without time zone DEFAULT now() NOT NULL,
    citit boolean DEFAULT false NOT NULL
);


--
-- Name: mesaj_contact_idmesaj_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mesaj_contact_idmesaj_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mesaj_contact_idmesaj_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mesaj_contact_idmesaj_seq OWNED BY public.mesaj_contact.idmesaj;


--
-- Name: participant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participant (
    idparticipant bigint NOT NULL,
    varsta integer NOT NULL,
    idutilizator bigint NOT NULL,
    CONSTRAINT ck_participant_varsta CHECK (((varsta >= 1) AND (varsta <= 120)))
);


--
-- Name: participant_idparticipant_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.participant_idparticipant_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: participant_idparticipant_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.participant_idparticipant_seq OWNED BY public.participant.idparticipant;


--
-- Name: recenzie; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recenzie (
    idrecenzie bigint NOT NULL,
    rating integer NOT NULL,
    comentariu character varying(1000),
    dataora timestamp without time zone DEFAULT now() NOT NULL,
    idinregistrare bigint NOT NULL,
    CONSTRAINT ck_recenzie_rating CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: recenzie_idrecenzie_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recenzie_idrecenzie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recenzie_idrecenzie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recenzie_idrecenzie_seq OWNED BY public.recenzie.idrecenzie;


--
-- Name: rezumat_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rezumat_feedback (
    idrezumat bigint NOT NULL,
    idatelier bigint NOT NULL,
    rezumat_general character varying(2000) NOT NULL,
    puncte_forte character varying(1000) NOT NULL,
    puncte_slabe character varying(1000) NOT NULL,
    sugestii character varying(1000) NOT NULL,
    generat_la timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rezumat_feedback_idrezumat_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rezumat_feedback_idrezumat_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rezumat_feedback_idrezumat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rezumat_feedback_idrezumat_seq OWNED BY public.rezumat_feedback.idrezumat;


--
-- Name: tema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tema (
    idtema bigint NOT NULL,
    denumire character varying(200) NOT NULL,
    idcategorie bigint NOT NULL
);


--
-- Name: tema_idtema_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tema_idtema_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tema_idtema_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tema_idtema_seq OWNED BY public.tema.idtema;


--
-- Name: utilizare; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilizare (
    idutilizare bigint NOT NULL,
    cantitate numeric(10,3) NOT NULL,
    idatelier bigint NOT NULL,
    idmaterial bigint NOT NULL,
    CONSTRAINT ck_utilizare_cantitate CHECK ((cantitate > (0)::numeric))
);


--
-- Name: utilizare_idutilizare_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utilizare_idutilizare_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utilizare_idutilizare_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utilizare_idutilizare_seq OWNED BY public.utilizare.idutilizare;


--
-- Name: utilizator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilizator (
    idutilizator bigint NOT NULL,
    nume character varying(200) NOT NULL,
    prenume character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    parola character varying(200) NOT NULL,
    nrtelefon character varying(15),
    datacrearii timestamp without time zone DEFAULT now() NOT NULL,
    sters boolean DEFAULT false NOT NULL,
    CONSTRAINT ck_utilizator_email_format CHECK ((POSITION(('@'::text) IN (email)) > 1)),
    CONSTRAINT ck_utilizator_nrtelefon_len CHECK (((nrtelefon IS NULL) OR ((char_length((nrtelefon)::text) >= 10) AND (char_length((nrtelefon)::text) <= 15)))),
    CONSTRAINT ck_utilizator_parola_len CHECK ((char_length((parola)::text) >= 8))
);


--
-- Name: utilizator_idutilizator_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utilizator_idutilizator_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utilizator_idutilizator_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utilizator_idutilizator_seq OWNED BY public.utilizator.idutilizator;


--
-- Name: administrator idadministrator; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator ALTER COLUMN idadministrator SET DEFAULT nextval('public.administrator_idadministrator_seq'::regclass);


--
-- Name: atelier idatelier; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier ALTER COLUMN idatelier SET DEFAULT nextval('public.atelier_idatelier_seq'::regclass);


--
-- Name: categorie idcategorie; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie ALTER COLUMN idcategorie SET DEFAULT nextval('public.categorie_idcategorie_seq'::regclass);


--
-- Name: inregistrare idinregistrare; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inregistrare ALTER COLUMN idinregistrare SET DEFAULT nextval('public.inregistrare_idinregistrare_seq'::regclass);


--
-- Name: instructor idinstructor; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instructor ALTER COLUMN idinstructor SET DEFAULT nextval('public.instructor_idinstructor_seq'::regclass);


--
-- Name: locatie idlocatie; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locatie ALTER COLUMN idlocatie SET DEFAULT nextval('public.locatie_idlocatie_seq'::regclass);


--
-- Name: materiale idmaterial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiale ALTER COLUMN idmaterial SET DEFAULT nextval('public.materiale_idmaterial_seq'::regclass);


--
-- Name: mesaj_contact idmesaj; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesaj_contact ALTER COLUMN idmesaj SET DEFAULT nextval('public.mesaj_contact_idmesaj_seq'::regclass);


--
-- Name: participant idparticipant; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant ALTER COLUMN idparticipant SET DEFAULT nextval('public.participant_idparticipant_seq'::regclass);


--
-- Name: recenzie idrecenzie; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recenzie ALTER COLUMN idrecenzie SET DEFAULT nextval('public.recenzie_idrecenzie_seq'::regclass);


--
-- Name: rezumat_feedback idrezumat; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rezumat_feedback ALTER COLUMN idrezumat SET DEFAULT nextval('public.rezumat_feedback_idrezumat_seq'::regclass);


--
-- Name: tema idtema; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tema ALTER COLUMN idtema SET DEFAULT nextval('public.tema_idtema_seq'::regclass);


--
-- Name: utilizare idutilizare; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizare ALTER COLUMN idutilizare SET DEFAULT nextval('public.utilizare_idutilizare_seq'::regclass);


--
-- Name: utilizator idutilizator; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizator ALTER COLUMN idutilizator SET DEFAULT nextval('public.utilizator_idutilizator_seq'::regclass);


--
-- Data for Name: administrator; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.administrator (idadministrator, idutilizator) FROM stdin;
1	5
\.


--
-- Data for Name: atelier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.atelier (idatelier, denumire, descriere, pret, varstamin, varstamax, durata, data, ora, nrparticipanti, idtema, idlocatie, idinstructor, materiale_salvate, nivel) FROM stdin;
7	Desen realist - portret in creion	Tehnici profesionale de desen al portretului. De la proportii corecte la umbre si lumini expresive.	100.00	15	60	180	2026-07-10	16:00:00	0	2	15	1	f	Incepator
8	Fotografie de peisaj la mare	Iesi in natura si invata sa surprinzi peisaje spectaculoase. Sesiune practica la malul marii.	160.00	16	65	300	2026-08-15	07:00:00	0	6	17	1	f	Incepator
9	Acuarela - flori de primavara	Descopera magia acuarelei pictand aranjamente florale delicate. Toate materialele sunt incluse in pret.	95.00	16	65	150	2026-07-02	14:00:00	0	8	15	1	f	Incepator
10	Scriere creativa - povestiri scurte	Descopera tehnici de scriere creativa si pleaca acasa cu prima ta povestire scrisa si finalizata.	85.00	16	70	150	2026-09-25	15:00:00	0	11	17	1	f	Incepator
11	Mindfulness si meditatie	Sesiune introductiva de mindfulness si tehnici de relaxare pentru reducerea stresului zilnic.	80.00	18	70	120	2026-08-20	18:00:00	0	12	17	1	f	Incepator
12	Decor din lemn - tablou rustic	Creeaza un tablou decorativ din lemn reciclat folosind tehnici simple si accesibile oricui.	125.00	16	70	180	2026-09-15	10:00:00	0	13	15	1	f	Incepator
13	Macrame - tablou decorativ	Creeaza un tablou macrame din sfoara naturala. Toate materialele sunt incluse in pret.	110.00	14	70	180	2026-07-25	14:00:00	0	14	14	1	f	Incepator
14	Bijuterii handmade din argint	Atelier de creare a bijuteriilor din argint 925. Vei pleca cu propriul inel sau pandantiv creat de tine.	200.00	18	70	300	2026-07-20	10:00:00	0	15	15	1	f	Incepator
15	Ceramica pe roata olarului	O experienta unica de modelare a lutului pe roata olarului. Vei crea propriul bol sau vaza.	150.00	16	60	240	2026-07-15	11:00:00	0	16	14	1	f	Incepator
16	Brutarie artizanala - paine cu maia	De la starter de maia la paine perfecta. Vei pleca acasa cu propria paine coapta!	130.00	18	70	210	2026-08-08	09:00:00	0	17	16	1	f	Incepator
2	Pictura acrilica pentru incepatori	Un atelier relaxant in care vei invata tehnici de baza ale picturii acrilice. Vei crea propria ta lucrare de arta ghidat de un instructor cu experienta.	80.00	16	60	120	2026-04-01	10:00:00	1	1	7	1	f	Incepator
6	Pictura acrilica pentru incepatori	Invata tehnicile de baza ale picturii acrilice intr-o atmosfera relaxanta. Vei pleca acasa cu propria ta capodopera!	120.00	14	70	180	2026-04-20	10:00:00	1	1	14	1	t	Incepator
17	Bucataria italiana de la zero	Paste proaspete, risotto si tiramisu autentic impreuna cu tehnici profesionale de gatit.	145.00	18	65	210	2026-09-05	11:00:00	0	18	16	1	f	Incepator
18	Tort artistic - tehnici de decorare	Invata sa decorezi torturi ca un profesionist: fondant, flori din zahar si tehnici de pictare.	180.00	16	55	240	2026-08-02	10:00:00	0	19	16	1	f	Incepator
19	Dans salsa pentru incepatori	Invata pasii de baza ai salsei intr-o atmosfera vesela. Nu este nevoie de partener sau experienta!	75.00	16	55	90	2026-09-20	19:00:00	0	20	16	1	f	Incepator
20	Chitara pentru incepatori	Primii pasi cu chitara acustica: acorduri de baza, ritmuri simple si primele melodii.	90.00	12	60	120	2026-09-10	17:00:00	0	21	17	1	f	Incepator
21	Olarit - atelier cu lut	Atelierul „Olarit - atelier cu lut” este un eveniment creativ și educativ destinat persoanelor de toate vârstele, între 10 și 60 ani. În cadrul acestui workshop, participanții vor învăța să lucreze cu lutul și să creeze obiecte ceramice unice și personale. Ei vor fi îndrumați de experți și vor avea oportunitatea să exerseze tehnici și tehnicile necesare pentru a crea obiectele lor. Atelierul este conceput astfel încât participanții să poată descoperi noi abilități și să se bucură de creativitate și exprimarea artistică. Descrierea atelierului este completată de o atmosferă relaxată și prietenoasă, care permite participanților să se simtă bine și să se concentreze pe activitățile creative.\n\nObiective:\n• a învăța tehnici de lucru cu lutul\n• a exersa creativitatea și exprimarea artistică\n• a crea obiecte ceramice unice și personale\n\nPublic țintă: Persoanele între 10 și 60 ani	119.00	10	60	120	2026-05-21	18:00:00	0	16	14	1	f	Incepator
22	Olarit - atelier cu lut	Atelierul „Olarit - atelier cu lut” este un eveniment creativ și educativ destinat persoanelor de toate vârstele, între 10 și 60 ani. În cadrul acestui workshop, participanții vor învăța să lucreze cu lutul și să creeze obiecte ceramice unice și personale. Ei vor fi îndrumați de experți și vor avea oportunitatea să exerseze tehnici și tehnicile necesare pentru a crea obiectele lor. Atelierul este conceput astfel încât participanții să poată descoperi noi abilități și să se bucură de creativitate și exprimarea artistică. Descrierea atelierului este completată de o atmosferă relaxată și prietenoasă, care permite participanților să se simtă bine și să se concentreze pe activitățile creative.\n\nObiective:\n• a învăța tehnici de lucru cu lutul\n• a exersa creativitatea și exprimarea artistică\n• a crea obiecte ceramice unice și personale\n\nPublic țintă: Persoanele între 10 și 60 ani	119.00	10	60	120	2026-05-23	20:00:00	0	16	14	1	f	Incepator
23	Introducere în dezvoltare web	În era digitală, dezvoltarea web este o disciplină fundamentală pentru orice persoană care dorește să se facă remarcată în lumea online. Învățând să creezi și să menții un site web, poți să îmbunătățești abilitățile tale de comunicare și să ajungi la o audiență largă. De asemenea, dezvoltarea web este o cale sigură pentru a-ți dezvolta cariera în domeniul tehnic. În workshop-ul nostru, vom explora temele fundamentale ale dezvoltării web, inclusiv structura unui site web, limbajele de programare și tehnologiile necesare pentru a crea o pagină web funcțională. Vom învăța împreună cum să creăm un site web simplu și să-l menținem actualizat.\n\nObiective:\n• a invata notiuni de baza despre dezvoltarea web\n• a exersa folosirea limbajelor de programare pentru a crea un site web\n• a realiza o lucrare simplă în cadrul workshop-ului\n\nPublic țintă: Persoanele cu vârsta cuprinsă între 10 și 30 de ani care doresc să învețe despre dezvoltarea web și să îmbunătățească abilitățile lor de comunicare onli	120.00	10	30	120	2026-06-19	15:00:00	0	23	22	1	f	Incepator
24	Atelier pictură acrilică	Tehnici de pictură acrilică pentru începători.	80.00	16	60	120	2026-09-15	10:00:00	0	1	1	2	f	Incepator
25	Pictura acrilica - curs rapid	Atelier demonstrativ de pictura acrilica pentru incepatori.	80.00	16	60	120	2026-06-14	10:00:00	0	1	7	1	f	Incepator
26	Ceramica pentru incepatori	Atelier practic de ceramica cu locuri limitate.	60.00	16	60	90	2026-06-24	11:00:00	0	1	23	1	f	Incepator
37	Bijuterii handmade din margele	Confectioneaza bratari si coliere unice, numai bune de daruit.	100.00	10	99	90	2026-07-18	11:00:00	0	15	16	2	f	Incepator
38	Ceramica la roata olarului	Modeleaza primul tau vas pe roata olarului, sub indrumarea instructorului.	180.00	16	99	180	2026-07-06	11:00:00	0	16	8	2	f	Mediu
40	Origami pentru copii si parinti	O activitate creativa potrivita pentru intreaga familie.	70.00	6	99	90	2026-06-30	11:00:00	0	4	14	1	f	Incepator
42	Decor din lemn rustic	Realizeaza un obiect decorativ din lemn, de la slefuit la finisaj.	130.00	16	99	150	2026-05-29	11:00:00	5	13	15	2	f	Mediu
43	Brutarie artizanala - paine cu maia	Secretele painii cu maia, de la framantat la copt.	110.00	16	99	180	2026-05-14	11:00:00	5	17	16	2	f	Incepator
47	Olarit - atelier cu lut		30.00	3	33	333	2026-07-01	09:08:00	0	2	27	1	f	Incepator
56	Acuarela pentru incepatori	Invata tehnicile de baza ale picturii in acuarela intr-o atmosfera relaxanta.	120.00	12	99	120	2026-07-18	11:00:00	0	8	14	1	f	Incepator
57	Ceramica la roata olarului	Modeleaza primul tau vas pe roata olarului, sub indrumarea instructorului.	180.00	14	99	150	2026-07-28	11:00:00	0	16	8	1	f	Mediu
58	Bijuterii handmade din margele	Confectioneaza bratari si coliere unice, numai bune de daruit.	100.00	10	99	90	2026-07-25	12:00:00	0	15	16	1	f	Incepator
59	Macrame - decoratiuni de perete	Creeaza propriile decoratiuni din snur, pas cu pas.	150.00	14	99	150	2026-08-02	11:00:00	0	14	23	1	f	Mediu
60	Tricotat pentru incepatori	Primii pasi in tricotat: ochiuri, fes si primul fular.	90.00	14	99	120	2026-08-10	10:00:00	0	3	20	1	f	Incepator
61	Cofetarie - torturi creative	Tehnici moderne de decorare a torturilor, de la glazura la flori din crema.	220.00	18	99	180	2026-08-16	15:00:00	0	19	18	1	f	Avansat
65	Pictura acrilica - curs intensiv	Un curs complet de pictura acrilica, de la schita la tablou finit.	140.00	12	99	180	2026-06-28	11:00:00	6	1	16	1	f	Mediu
62	Desen in creion - portret	Notiuni de proportii, umbre si tehnici pentru un portret realist.	100.00	12	99	120	2026-06-25	11:00:00	4	2	15	1	f	Incepator
63	Fotografie de portret	Compozitie, lumina si pozare pentru portrete reusite.	160.00	16	99	150	2026-06-22	11:00:00	6	6	19	1	f	Mediu
64	Origami - figuri 3D	O activitate creativa potrivita pentru intreaga familie.	70.00	6	99	90	2026-06-20	10:00:00	0	4	14	1	f	Incepator
\.


--
-- Data for Name: categorie; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorie (idcategorie, denumire) FROM stdin;
1	Arte vizuale
2	Craft & DIY
3	Dezvoltare personala
4	Tehnologie
5	Literara
8	Mestesugarit
9	Gastronomie
11	Muzica si dans
\.


--
-- Data for Name: inregistrare; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inregistrare (idinregistrare, datainscriere, status, idparticipant, idatelier) FROM stdin;
5	2026-05-04 00:05:28.856258	Participare	3	2
6	2026-05-12 23:24:32.422412	Participare	3	6
8	2026-05-20 19:48:14.250305	Inscriere	3	21
9	2026-05-22 20:43:05.596547	Participare	4	2
10	2026-05-22 20:43:05.596547	Participare	5	2
11	2026-05-22 20:43:05.596547	Participare	6	2
12	2026-05-22 20:43:05.596547	Participare	7	2
13	2026-05-22 20:43:05.596547	Participare	8	2
14	2026-05-22 20:43:05.596547	Participare	9	2
15	2026-05-22 20:43:05.596547	Participare	10	2
16	2026-05-22 20:43:05.600288	Participare	4	21
17	2026-05-22 20:43:05.600288	Participare	5	21
18	2026-05-22 20:43:05.600288	Participare	6	21
19	2026-05-22 20:43:05.600288	Participare	7	21
20	2026-05-22 20:43:05.600288	Participare	8	21
21	2026-05-22 20:43:05.600288	Participare	11	21
22	2026-06-02 18:39:34.757067	Inscriere	12	24
23	2026-06-02 19:01:28.03073	Inscriere	13	24
24	2026-06-09 13:04:43.292625	Inscriere	3	23
25	2026-06-09 15:49:50.329711	Inscriere	3	25
26	2026-06-09 16:02:29.693667	Inscriere	2	26
27	2026-06-09 16:02:29.693667	Inscriere	3	26
28	2026-06-09 16:02:29.693667	Inscriere	4	26
29	2026-06-09 16:37:47.156122	Inscriere	5	25
46	2026-06-18 19:20:04.288208	Inscriere	6	37
47	2026-06-18 19:20:04.288208	Inscriere	7	37
48	2026-06-18 19:20:04.288208	Inscriere	8	37
49	2026-06-18 19:20:04.288208	Inscriere	10	37
50	2026-06-18 19:20:04.288208	Inscriere	11	37
51	2026-06-18 19:20:04.288208	Inscriere	8	38
52	2026-06-18 19:20:04.288208	Inscriere	10	38
53	2026-06-18 19:20:04.288208	Inscriere	11	38
54	2026-06-18 19:20:04.288208	Inscriere	12	38
55	2026-06-18 19:20:04.288208	Inscriere	13	38
60	2026-06-18 19:20:04.288208	Inscriere	13	40
61	2026-06-18 19:20:04.288208	Inscriere	14	40
68	2026-06-18 19:20:04.288208	Anulare	4	42
69	2026-06-18 19:20:04.288208	Participare	5	42
70	2026-06-18 19:20:04.288208	Participare	6	42
71	2026-06-18 19:20:04.288208	Participare	7	42
72	2026-06-18 19:20:04.288208	Participare	8	42
73	2026-06-18 19:20:04.288208	Participare	10	42
74	2026-06-18 19:20:04.288208	Anulare	6	43
75	2026-06-18 19:20:04.288208	Participare	7	43
76	2026-06-18 19:20:04.288208	Participare	8	43
77	2026-06-18 19:20:04.288208	Participare	10	43
78	2026-06-18 19:20:04.288208	Participare	11	43
79	2026-06-18 19:20:04.288208	Participare	12	43
86	2026-06-22 18:33:33.488783	Inscriere	3	40
7	2026-05-12 23:45:54.571336	Inscriere	3	7
93	2026-07-03 19:37:01.391475	Inscriere	3	56
94	2026-07-03 19:37:01.391475	Inscriere	2	56
95	2026-07-03 19:37:01.391475	Inscriere	4	56
96	2026-07-03 19:37:01.391475	Inscriere	5	56
97	2026-07-03 19:37:01.391475	Inscriere	6	56
98	2026-07-03 19:37:01.391475	Inscriere	3	57
99	2026-07-03 19:37:01.391475	Inscriere	7	57
100	2026-07-03 19:37:01.391475	Inscriere	8	57
101	2026-07-03 19:37:01.391475	Inscriere	10	57
102	2026-07-03 19:37:01.391475	Inscriere	2	58
103	2026-07-03 19:37:01.391475	Inscriere	4	58
104	2026-07-03 19:37:01.391475	Inscriere	5	58
105	2026-07-03 19:37:01.391475	Inscriere	6	58
106	2026-07-03 19:37:01.391475	Inscriere	7	58
107	2026-07-03 19:37:01.391475	Inscriere	8	58
108	2026-07-03 19:37:01.391475	Inscriere	2	59
109	2026-07-03 19:37:01.391475	Inscriere	4	59
110	2026-07-03 19:37:01.391475	Inscriere	5	59
111	2026-07-03 19:37:01.391475	Inscriere	2	60
112	2026-07-03 19:37:01.391475	Inscriere	4	60
113	2026-07-03 19:37:01.391475	Inscriere	10	61
114	2026-07-03 19:37:01.391475	Inscriere	11	61
115	2026-07-03 19:37:01.391475	Participare	3	62
116	2026-07-03 19:37:01.391475	Participare	2	62
117	2026-07-03 19:37:01.391475	Participare	4	62
118	2026-07-03 19:37:01.391475	Participare	5	62
119	2026-07-03 19:37:01.391475	Participare	3	63
120	2026-07-03 19:37:01.391475	Participare	2	63
121	2026-07-03 19:37:01.391475	Participare	4	63
122	2026-07-03 19:37:01.391475	Participare	5	63
123	2026-07-03 19:37:01.391475	Participare	6	63
124	2026-07-03 19:37:01.391475	Participare	7	63
125	2026-07-03 19:37:01.391475	Inscriere	3	64
126	2026-07-03 19:37:01.391475	Inscriere	8	64
127	2026-07-03 19:37:01.391475	Inscriere	10	64
128	2026-07-03 19:37:01.391475	Inscriere	11	64
129	2026-07-03 19:37:01.391475	Participare	2	65
130	2026-07-03 19:37:01.391475	Participare	4	65
131	2026-07-03 19:37:01.391475	Participare	5	65
132	2026-07-03 19:37:01.391475	Participare	6	65
133	2026-07-03 19:37:01.391475	Participare	7	65
134	2026-07-03 19:37:01.391475	Participare	8	65
\.


--
-- Data for Name: instructor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.instructor (idinstructor, bio, specializare, idutilizator) FROM stdin;
1	Instructor cu experienta in arte vizuale	Pictura	3
2	Expert în pictură	Pictură	16
\.


--
-- Data for Name: locatie; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locatie (idlocatie, nume, adresa, oras, capacitate) FROM stdin;
1	Atelier Creativ Central	Str. Artelor 10	Bucuresti	20
2	Studio Handmade	Bd. Unirii 5	Cluj-Napoca	15
7	Atelier Creativ Central	Str. Artelor 10	Constanta	20
8	Olarim	Str. Brad Pitt 20	Constanta	40
11	Olarariuuu	Str. Brad Pitt 20	Constanta	40
12	Olarariuuuuu	Str. Brad Pitt 20	Constanta	50
13	Olarariu	Str. Brad Pitt 20	Constanta	50
14	Studio Creativ Constanta	Str. Mihai Eminescu 12	Constanta	15
15	Atelier Arte Constanta	Bd. Tomis 45	Constanta	20
16	Casa Culturii	Str. Stefan cel Mare 8	Constanta	30
17	Studio Zen	Str. Independentei 22	Constanta	12
18	Atelier Central Bucuresti	Calea Victoriei 88	Bucuresti	25
19	Hub Creativ Bucuresti	Str. Doamnei 15	Bucuresti	20
20	Spatiu Craft Cluj	Str. Memorandumului 10	Cluj-Napoca	18
21	Casa Artelor Iasi	Bd. Stefan cel Mare 5	Iasi	22
22	TechHub Constanța	Str. Traian nr. 5	Constanta	20
23	Studio Craft	Str. Artelor 5	Constanta	3
27	Studio Craft	Str. Traian nr. 5	Constanta	22
\.


--
-- Data for Name: materiale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.materiale (idmaterial, denumire, pret, idinstructor) FROM stdin;
37	Culori tempera set 12	18.50	1
38	Bloc desen A4 50 file	12.00	1
39	Creion grafit 6B	4.50	1
2	Vopsele acrilice 500ml	32.50	\N
40	Carbune desen artistic	8.00	1
41	Guma de sters profesionala	3.50	1
5	Glazura transparenta 250ml	28.50	\N
6	Hartie acuarela A3	12.00	\N
42	Marker permanent negru	5.00	1
8	Spatula modelare	8.00	\N
43	Markere acrilice set 10	45.00	1
10	Foarfece profesionale	35.00	\N
11	Carton colorat A4 set 50	15.00	\N
44	Pasta polimerica colorata 100g	22.00	1
45	Folie termoretractabila	15.00	1
46	Snur macrame 3mm 100m	35.00	1
47	Inele metalice 20mm set 50	12.50	1
48	Clesti bijuterii set 3	28.00	1
49	Fir de cupru 0.8mm 10m	18.00	1
50	Cristale Swarovski mix 100buc	55.00	1
51	Creioane colorate set 24	32.00	1
52	Pasteluri set 24	48.00	1
53	Pensula evantai nr 10	16.00	1
54	Vopsea structurala alba 200ml	27.00	1
55	Pigmenti perlati 10g	19.00	1
56	Hartie satin A4 set 20	11.00	1
57	Banda washi decorativa	7.50	1
58	Adeziv termic batoane 20buc	13.00	1
59	Paleta mixare plastic	5.50	1
60	Suport canvas reglabil	42.00	1
61	Lac fixativ spray 400ml	23.00	1
62	Hartie origami set 100 file	16.00	1
63	Sclipici fin set 6 culori	14.50	1
64	Pensule degete set 10	9.50	1
65	Folie aluminiu modelaj	8.50	1
66	Dantela broderie 2m	6.50	1
67	Nasturi decorativi set 50	10.00	1
4	Argila ceramica 1kg	25.00	\N
68	Vopsele acrilice set	45.00	1
69	Hartie foto A4	25.00	1
70	Lut ceramic 5kg	30.00	1
3	Panza canvas 30x40	18.00	\N
9	Pensule acuarela set 6	22.00	\N
1	Pensule acrilice set 12	45.00	\N
13	Acuarele profesionale	45.00	1
14	Pensule set 12 bucati	28.50	1
15	Panza canvas 30x40cm	18.00	1
16	Argila polimerica 500g	32.00	1
17	Foarfece decupaj	12.00	1
18	Hartie creponata colorata	8.50	1
19	Lipici PVA 500ml	15.00	1
20	Vopsea acrilica set 6 culori	55.00	1
21	Sarma aluminiu 2mm	22.00	1
22	Margele mixte 200g	19.90	1
\.


--
-- Data for Name: mesaj_contact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mesaj_contact (idmesaj, nume, email, subiect, mesaj, dataora, citit) FROM stdin;
4	Popescu Maria	adresa@gmail.com	Intrebare despre inscriere	Buna ziua, as dori sa stiu daca mai sunt locuri disponibile la orice atelier de ceramica in luna iunie.	2026-06-02 15:19:11.384551	t
\.


--
-- Data for Name: participant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.participant (idparticipant, varsta, idutilizator) FROM stdin;
2	25	2
3	22	4
4	24	6
5	28	7
6	31	8
7	22	9
8	27	10
9	33	11
10	25	12
11	29	13
12	25	15
13	22	17
14	31	18
\.


--
-- Data for Name: recenzie; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recenzie (idrecenzie, rating, comentariu, dataora, idinregistrare) FROM stdin;
1	5	\N	2026-05-12 23:22:45.394486	5
2	5	Atelierul a fost fantastic! Instructorul a explicat tehnicile de acuarela pas cu pas, iar atmosfera a fost relaxanta si prietenoasa. Am plecat cu o lucrare de care sunt foarte mandru.	2026-05-22 20:43:36.673743	9
3	4	Mi-a placut foarte mult, dar cred ca doua ore nu au fost suficiente. As fi vrut mai mult timp pentru a exersa tehnicile predate. In rest, totul a fost bine organizat.	2026-05-22 20:43:36.676288	10
4	5	Explicatiile au fost clare si bine structurate. Instructorul a acordat atentie fiecarui participant. Spatiul a fost curat si dotat corespunzator. Recomand cu caldura!	2026-05-22 20:43:36.676564	11
5	3	Atelierul a fost interesant, dar mi-as fi dorit mai multe exemple practice. Teoria a ocupat prea mult timp. De asemenea, materialele puse la dispozitie au fost putine.	2026-05-22 20:43:36.67678	12
6	4	Atmosfera a fost calda si primitoare. Instructorul are pasiune pentru ceea ce face si asta se simte. As vrea o sesiune mai lunga data viitoare, poate 3-4 ore.	2026-05-22 20:43:36.676971	13
7	5	Unul dintre cele mai bune ateliere la care am participat! Tehnicile predate sunt accesibile si rezultatele sunt surprinzatoare. Grupul mic de participanti a facut experienta mai personala.	2026-05-22 20:43:36.677157	14
8	3	M-am simtit putin pierduta la inceput, instructiunile puteau fi mai clare pentru cei fara experienta. Insa pe masura ce atelierul a avansat, lucrurile s-au clarificat. Mai multa rabdare pentru incepatori ar fi binevenita.	2026-05-22 20:43:36.677346	15
9	5	O experienta absolut minunata! Lucrul cu lutul este terapeutic si relaxant. Instructorul ne-a ghidat cu rabdare prin fiecare pas. Am creat un bol pe care il folosesc acasa.	2026-05-22 20:44:39.732753	16
10	4	Foarte interesant, dar atelierul a fost prea scurt. Abia am apucat sa facem ceva inainte sa se termine. As recomanda extinderea la cel putin 3 ore. Instructorul a fost profesionist.	2026-05-22 20:44:39.73442	17
11	5	Am descoperit o noua pasiune! Nu stiam ca mi-ar placea olaritul pana la acest atelier. Explicatiile au fost excelente si ambiantul a fost placut. Revin cu siguranta.	2026-05-22 20:44:39.734677	18
12	3	Atelierul a fost ok, dar spatiul era putin inghesuit pentru numarul de participanti. Lutul era de calitate, insa uneltele lipseau si a trebuit sa asteptam. Potential mare, dar organizarea mai slaba.	2026-05-22 20:44:39.734949	19
13	4	Mi-a placut ca am putut lucra in ritmul propriu. Instructorul a fost disponibil sa ajute pe toata lumea. As fi vrut mai multe informatii despre tehnici avansate de ardere a lutului.	2026-05-22 20:44:39.735161	20
14	4	Experienta placuta. Atmosfera relaxanta, instructor prietenos. Singurul minus a fost ca nu am putut lua acasa piesa terminata in aceeasi zi, trebuie sa astept arderea. Dar inteleg ca asa este procesul.	2026-05-22 20:44:39.735346	21
22	5	Mi-a placut enorm, atmosfera a fost relaxanta si prietenoasa.	2026-06-18 19:20:04.288208	69
23	4	Recomand cu incredere, am invatat lucruri noi si utile.	2026-06-18 19:20:04.288208	71
24	5	Perfect pentru incepatori, m-am simtit in largul meu.	2026-06-18 19:20:04.288208	73
25	4	Foarte fain, dar as fi vrut putin mai mult timp pentru exercitii.	2026-06-18 19:20:04.288208	75
26	3	A fost ok, insa grupul a fost cam mare pentru spatiul disponibil.	2026-06-18 19:20:04.288208	77
27	4	Instructorul are rabdare si pasiune pentru ceea ce face.	2026-06-18 19:20:04.288208	79
33	5	Atelier excelent, instructorul a explicat totul foarte clar!	2026-07-03 19:37:01.391475	115
34	5	Mi-a placut enorm, atmosfera relaxanta si prietenoasa.	2026-07-03 19:37:01.391475	116
35	4	Foarte fain, as fi vrut putin mai mult timp de exercitiu.	2026-07-03 19:37:01.391475	117
36	4	Recomand cu incredere, am invatat lucruri noi si utile.	2026-07-03 19:37:01.391475	118
37	5	Atelier excelent, instructorul a explicat totul foarte clar!	2026-07-03 19:37:01.391475	120
38	5	Mi-a placut enorm, atmosfera relaxanta si prietenoasa.	2026-07-03 19:37:01.391475	121
39	4	Foarte fain, as fi vrut putin mai mult timp de exercitiu.	2026-07-03 19:37:01.391475	122
40	4	Recomand cu incredere, am invatat lucruri noi si utile.	2026-07-03 19:37:01.391475	123
41	5	Perfect pentru incepatori, m-am simtit in largul meu.	2026-07-03 19:37:01.391475	124
42	5	Atelier excelent, instructorul a explicat totul foarte clar!	2026-07-03 19:37:01.391475	129
43	5	Mi-a placut enorm, atmosfera relaxanta si prietenoasa.	2026-07-03 19:37:01.391475	130
44	4	Foarte fain, as fi vrut putin mai mult timp de exercitiu.	2026-07-03 19:37:01.391475	131
45	4	Recomand cu incredere, am invatat lucruri noi si utile.	2026-07-03 19:37:01.391475	132
46	5	Perfect pentru incepatori, m-am simtit in largul meu.	2026-07-03 19:37:01.391475	133
47	3	A fost ok, dar grupul a fost cam mare pentru spatiu.	2026-07-03 19:37:01.391475	134
\.


--
-- Data for Name: rezumat_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rezumat_feedback (idrezumat, idatelier, rezumat_general, puncte_forte, puncte_slabe, sugestii, generat_la) FROM stdin;
1	21	Experiențele au fost în general pozitive, cu aprecieri pentru instructor și atmosferă relaxantă. Participanții au descoperit noi pasiuni și au creat obiecte personale.	["Lucrul cu lutul este terapeutic si relaxant", "Instructorul a fost profesionist și disponibil", "Atmosfera a fost placută și relaxantă"]	["Atelierul a fost prea scurt", "Spatiul era putin inghesuit pentru numarul de participanti"]	["Extinderea la cel puțin 3 ore", "Mai multe informatii despre tehnici avansate de ardere a lutului"]	2026-05-22 20:47:40.533787
2	2	Atelierul a fost apreciat de majoritatea participanților, care au menționat atmosfera relaxanta și instructorul pasionat. Unele sugestii pentru îmbunătățirea atelierului includ mai mult timp pentru exerciții și exemple practice.	["instructorul a explicat tehnicile de acuarela pas cu pas", "atmosfera a fost relaxanta si prietenoasa", "explicatiile au fost clare si bine structurate"]	["doua ore nu au fost suficiente pentru exerciții", "teoria a ocupat prea mult timp"]	["o sesiune mai lunga data viitoare, poate 3-4 ore", "mai multa rabdare pentru incepatori ar fi binevenita", "materialele puse la dispozitie au fost putine"]	2026-05-23 19:51:13.561412
\.


--
-- Data for Name: tema; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tema (idtema, denumire, idcategorie) FROM stdin;
1	Pictura acrilica	1
2	Desen in creion	1
3	Tricotat	2
4	Origami	2
5	Public speaking	3
6	Fotografie	1
8	Acuarela	1
11	Scriere creativa	3
12	Mindfulness	3
13	Decor din lemn	8
14	Macrame	8
15	Bijuterii handmade	8
16	Ceramica	8
17	Brutarie artizanala	9
18	Gatit international	9
19	Cofetarie	9
20	Dans salsa	11
21	Chitara pentru incepatori	11
22	Poezie	5
23	Programare	4
\.


--
-- Data for Name: utilizare; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utilizare (idutilizare, cantitate, idatelier, idmaterial) FROM stdin;
8	2.000	6	1
9	4.000	6	3
10	1.000	6	9
13	1.000	2	1
18	3.000	2	13
24	5.000	63	68
25	5.000	63	69
26	6.000	65	68
27	6.000	65	69
\.


--
-- Data for Name: utilizator; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utilizator (idutilizator, nume, prenume, email, parola, nrtelefon, datacrearii, sters) FROM stdin;
2	Test	User	test@test.com	$2b$12$lB0aW30ts/T7W6PVWkB/ZOAF3J1hsEJYKnm8nQvsgc7Fdq3Yi9Bwy	\N	2026-05-02 20:42:01.621098	f
6	Ionescu	Maria	maria.ionescu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
7	Popescu	Andrei	andrei.popescu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
8	Georgescu	Elena	elena.georgescu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
9	Mihai	Vlad	vlad.mihai@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
10	Stancu	Ioana	ioana.stancu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
12	Niculescu	Catalina	cata.niculescu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
13	Florescu	Alex	alex.florescu@test.com	$2b$12$b6vzOm8T.yOnOOZWSQQJg.gkdwQDN98LDdVM5O1vyexlNUzy5x/WG	\N	2026-05-22 20:42:56.659713	f
15	Ana	Test	ana.test@gmail.com	$2b$12$MI05TT3J4QQjELVAVdF.VeroF1H/EFDx7ntXQNLV6Gixtqd0Tym0a	\N	2026-06-02 18:38:16.122001	f
17	Maria	Ionescu	maria.ionescu@gmail.com	$2b$12$cVqlg.WyXHISHFmLWJhweeofEwbO0u5izHGDzDIByj94gwrm8TQKO	\N	2026-06-02 18:49:56.688364	f
16	Dumitrescu	Ion	ion.instructor@gmail.com	$2b$12$RyZV0BSUczVZd/3CnEkwQO8dOpTHWAFqUCgZ.cwClUgjMTNuuCnGK	\N	2026-06-02 18:38:16.372078	f
18	Popescu	Maria	mariapopescu@gmail.com	$2b$12$4.IOiNzsW2mRYcH7SJFaq.PBE/vwaZgpD8UD6q3oejy1nIfMhNhPi	0736254388	2026-06-18 18:01:52.311858	f
11	sters	Utilizator	sters_11@craftmanager.local	$2b$12$tngkFYehWbj4IsDKiYWPWOUk2x/SIiDD2FHYmitbL1HFvA7pskeRG	\N	2026-05-22 20:42:56.659713	t
3	Popescu	Maria	instructor@test.com	$2b$12$58vWoDi1jeNYlYa1qtOEBeO3PozuMiG6hXFZSemRXLXTXA10Lz.v6	\N	2026-05-02 23:52:49.979516	f
4	Chiru	Silviana	adresa@gmail.com	$2b$12$JVdUyV85qBlSBXl1uk0Abez8qtLBrjBiLHNQopvKY3W4L4.HWOZo6	0789322744	2026-05-03 23:40:26.177845	f
5	Admin	CraftManager	admin@craftmanager.ro	$2b$12$CJmho89b8Ej2nrC53iqrc.bRBfTCNQz9e2P2Cj35XaHBv7fmmapCq	\N	2026-05-20 16:01:41.744962	f
\.


--
-- Name: administrator_idadministrator_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.administrator_idadministrator_seq', 5, true);


--
-- Name: atelier_idatelier_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.atelier_idatelier_seq', 65, true);


--
-- Name: categorie_idcategorie_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categorie_idcategorie_seq', 16, true);


--
-- Name: inregistrare_idinregistrare_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inregistrare_idinregistrare_seq', 134, true);


--
-- Name: instructor_idinstructor_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.instructor_idinstructor_seq', 10, true);


--
-- Name: locatie_idlocatie_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locatie_idlocatie_seq', 29, true);


--
-- Name: materiale_idmaterial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.materiale_idmaterial_seq', 70, true);


--
-- Name: mesaj_contact_idmesaj_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mesaj_contact_idmesaj_seq', 4, true);


--
-- Name: participant_idparticipant_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.participant_idparticipant_seq', 26, true);


--
-- Name: recenzie_idrecenzie_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recenzie_idrecenzie_seq', 47, true);


--
-- Name: rezumat_feedback_idrezumat_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rezumat_feedback_idrezumat_seq', 2, true);


--
-- Name: tema_idtema_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tema_idtema_seq', 28, true);


--
-- Name: utilizare_idutilizare_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utilizare_idutilizare_seq', 27, true);


--
-- Name: utilizator_idutilizator_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utilizator_idutilizator_seq', 42, true);


--
-- Name: administrator administrator_idutilizator_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator
    ADD CONSTRAINT administrator_idutilizator_key UNIQUE (idutilizator);


--
-- Name: administrator administrator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator
    ADD CONSTRAINT administrator_pkey PRIMARY KEY (idadministrator);


--
-- Name: atelier atelier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier
    ADD CONSTRAINT atelier_pkey PRIMARY KEY (idatelier);


--
-- Name: categorie categorie_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_pkey PRIMARY KEY (idcategorie);


--
-- Name: inregistrare inregistrare_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inregistrare
    ADD CONSTRAINT inregistrare_pkey PRIMARY KEY (idinregistrare);


--
-- Name: instructor instructor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT instructor_pkey PRIMARY KEY (idinstructor);


--
-- Name: locatie locatie_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locatie
    ADD CONSTRAINT locatie_pkey PRIMARY KEY (idlocatie);


--
-- Name: materiale materiale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiale
    ADD CONSTRAINT materiale_pkey PRIMARY KEY (idmaterial);


--
-- Name: mesaj_contact mesaj_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesaj_contact
    ADD CONSTRAINT mesaj_contact_pkey PRIMARY KEY (idmesaj);


--
-- Name: participant participant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT participant_pkey PRIMARY KEY (idparticipant);


--
-- Name: recenzie recenzie_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recenzie
    ADD CONSTRAINT recenzie_pkey PRIMARY KEY (idrecenzie);


--
-- Name: rezumat_feedback rezumat_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rezumat_feedback
    ADD CONSTRAINT rezumat_feedback_pkey PRIMARY KEY (idrezumat);


--
-- Name: tema tema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT tema_pkey PRIMARY KEY (idtema);


--
-- Name: atelier uq_atelier_semantic; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier
    ADD CONSTRAINT uq_atelier_semantic UNIQUE (denumire, data, ora, idlocatie);


--
-- Name: categorie uq_categorie_denumire; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT uq_categorie_denumire UNIQUE (denumire);


--
-- Name: inregistrare uq_inregistrare; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inregistrare
    ADD CONSTRAINT uq_inregistrare UNIQUE (idparticipant, idatelier);


--
-- Name: instructor uq_instructor_idutilizator; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT uq_instructor_idutilizator UNIQUE (idutilizator);


--
-- Name: locatie uq_locatie; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locatie
    ADD CONSTRAINT uq_locatie UNIQUE (nume, adresa, oras);


--
-- Name: materiale uq_materiale_denumire; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiale
    ADD CONSTRAINT uq_materiale_denumire UNIQUE (denumire);


--
-- Name: participant uq_participant_idutilizator; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT uq_participant_idutilizator UNIQUE (idutilizator);


--
-- Name: recenzie uq_recenzie_inregistrare; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recenzie
    ADD CONSTRAINT uq_recenzie_inregistrare UNIQUE (idinregistrare);


--
-- Name: tema uq_tema; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT uq_tema UNIQUE (denumire, idcategorie);


--
-- Name: utilizare uq_utilizare; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizare
    ADD CONSTRAINT uq_utilizare UNIQUE (idatelier, idmaterial);


--
-- Name: utilizator uq_utilizator_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizator
    ADD CONSTRAINT uq_utilizator_email UNIQUE (email);


--
-- Name: utilizare utilizare_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizare
    ADD CONSTRAINT utilizare_pkey PRIMARY KEY (idutilizare);


--
-- Name: utilizator utilizator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizator
    ADD CONSTRAINT utilizator_pkey PRIMARY KEY (idutilizator);


--
-- Name: administrator administrator_idutilizator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrator
    ADD CONSTRAINT administrator_idutilizator_fkey FOREIGN KEY (idutilizator) REFERENCES public.utilizator(idutilizator) ON DELETE CASCADE;


--
-- Name: atelier fk_atelier_instructor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier
    ADD CONSTRAINT fk_atelier_instructor FOREIGN KEY (idinstructor) REFERENCES public.instructor(idinstructor) ON DELETE RESTRICT;


--
-- Name: atelier fk_atelier_locatie; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier
    ADD CONSTRAINT fk_atelier_locatie FOREIGN KEY (idlocatie) REFERENCES public.locatie(idlocatie) ON DELETE RESTRICT;


--
-- Name: atelier fk_atelier_tema; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atelier
    ADD CONSTRAINT fk_atelier_tema FOREIGN KEY (idtema) REFERENCES public.tema(idtema) ON DELETE RESTRICT;


--
-- Name: inregistrare fk_inregistrare_atelier; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inregistrare
    ADD CONSTRAINT fk_inregistrare_atelier FOREIGN KEY (idatelier) REFERENCES public.atelier(idatelier) ON DELETE CASCADE;


--
-- Name: inregistrare fk_inregistrare_participant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inregistrare
    ADD CONSTRAINT fk_inregistrare_participant FOREIGN KEY (idparticipant) REFERENCES public.participant(idparticipant) ON DELETE CASCADE;


--
-- Name: instructor fk_instructor_utilizator; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT fk_instructor_utilizator FOREIGN KEY (idutilizator) REFERENCES public.utilizator(idutilizator) ON DELETE CASCADE;


--
-- Name: participant fk_participant_utilizator; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT fk_participant_utilizator FOREIGN KEY (idutilizator) REFERENCES public.utilizator(idutilizator) ON DELETE CASCADE;


--
-- Name: recenzie fk_recenzie_inregistrare; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recenzie
    ADD CONSTRAINT fk_recenzie_inregistrare FOREIGN KEY (idinregistrare) REFERENCES public.inregistrare(idinregistrare) ON DELETE CASCADE;


--
-- Name: tema fk_tema_categorie; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT fk_tema_categorie FOREIGN KEY (idcategorie) REFERENCES public.categorie(idcategorie) ON DELETE RESTRICT;


--
-- Name: utilizare fk_utilizare_atelier; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizare
    ADD CONSTRAINT fk_utilizare_atelier FOREIGN KEY (idatelier) REFERENCES public.atelier(idatelier) ON DELETE CASCADE;


--
-- Name: utilizare fk_utilizare_material; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilizare
    ADD CONSTRAINT fk_utilizare_material FOREIGN KEY (idmaterial) REFERENCES public.materiale(idmaterial) ON DELETE RESTRICT;


--
-- Name: materiale materiale_idinstructor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiale
    ADD CONSTRAINT materiale_idinstructor_fkey FOREIGN KEY (idinstructor) REFERENCES public.instructor(idinstructor) ON DELETE CASCADE;


--
-- Name: rezumat_feedback rezumat_feedback_idatelier_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rezumat_feedback
    ADD CONSTRAINT rezumat_feedback_idatelier_fkey FOREIGN KEY (idatelier) REFERENCES public.atelier(idatelier) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


