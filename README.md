# Task API

Mali REST API za zadatke (Node.js + Express). Služi kao demonstracija alata za
testiranje, kontrolu kvaliteta koda, kontejnerizaciju i CI/CD.

## Pokretanje lokalno
```bash
npm install
npm start          # http://localhost:3000
npm run lint       # ESLint
npm test           # Jest + izveštaj o pokrivenosti koda
```

## Docker
```bash
docker compose up --build
curl http://localhost:3000/health
```

## Endpointi
| Metoda | Putanja | Opis |
|--------|---------|------|
| GET | /health | provera rada servisa |
| GET | /tasks | lista zadataka |
| GET | /tasks/:id | jedan zadatak |
| POST | /tasks | novi zadatak (`{"title": "..."}`) |
| PUT | /tasks/:id | izmena (`title`, `done`) |
| DELETE | /tasks/:id | brisanje |

## CI/CD (GitHub Actions)
Pri svakom pushu na `main` i pri pull request-u:
1. `lint` - provera stila i grešaka (ESLint)
2. `test` - Jest testovi uz prag pokrivenosti 80%
3. `docker` - build Docker image-a i smoke test (`/health`)
