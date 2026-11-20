# Task API

REST API za zadatke (Node.js + Express + PostgreSQL). Služi kao demonstracija
alata za testiranje, kontrolu kvaliteta koda, kontejnerizaciju i CI/CD.

## Struktura
- `public/index.html` - web stranica (tabela zadataka i statistika)
- `db/seed.sql` - početni podaci (učitavaju se samo pri prvom pravljenju baze)
- `src/app.js` - Express aplikacija (rute)
- `src/memoryRepository.js` - čuvanje u memoriji (unit testovi, rad bez baze)
- `src/postgresRepository.js` - čuvanje u PostgreSQL-u
- `tests/` - unit testovi, `tests/integration/` - integracioni testovi (PostgreSQL)

## Pokretanje bez baze (podaci u memoriji)
```bash
npm install
npm start          # http://localhost:3000
npm run lint       # ESLint
npm test           # unit testovi + pokrivenost koda
```

## Pokretanje sa bazom (Docker)
```bash
docker compose up --build
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Prvi zadatak"}'
curl http://localhost:3000/tasks
docker compose down        # dodaj -v da obrišeš i podatke
```
Podaci ostaju sačuvani u volume-u `pgdata` između restartovanja. Pri prvom pokretanju baza se popunjava iz `db/seed.sql`; da bi se početni podaci ponovo učitali, obriši volume: `docker compose down -v`.
Web stranica: http://localhost:3000

## Integracioni testovi (potrebna PostgreSQL baza)
```bash
# bazu možeš pokrenuti sa: docker compose up -d db  (i dodati ports: "5432:5432" servisu db)
DATABASE_URL=postgres://taskuser:taskpass@localhost:5432/tasks npm run test:integration
```
(U Windows CMD: `set DATABASE_URL=...` pa `npm run test:integration`.)
U CI-ju ih automatski pokreće Postgres servis.

## Endpointi
| Metoda | Putanja | Opis |
|--------|---------|------|
| GET | /health | provera rada servisa |
| GET | / | web stranica sa pregledom zadataka i statistikom |
| GET | /stats | broj ukupnih, završenih i zadataka u toku |
| GET | /tasks | lista zadataka |
| GET | /tasks/:id | jedan zadatak |
| POST | /tasks | novi zadatak (`{"title": "..."}`) |
| PUT | /tasks/:id | izmena (`title`, `done`) |
| DELETE | /tasks/:id | brisanje |

## CI/CD (GitHub Actions)
Pri svakom pushu na `main` i pri pull request-u:
1. **test** - lint, `npm audit` (ranjivosti produkcionih zavisnosti), unit testovi uz prag pokrivenosti 80%, integracioni testovi na pravoj PostgreSQL bazi
2. **docker** - `docker compose up`, smoke test (health, kreiranje i čitanje zadatka)
3. **publish** (samo push na `main`) - build i objavljivanje Docker image-a na GitHub Container Registry (`ghcr.io`)
