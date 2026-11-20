-- Pocetni podaci. Postgres ovaj fajl izvrsava samo prvi put, kada se pravi
-- prazna baza (docker-entrypoint-initdb.d).
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title, done) VALUES
  ('Podesi Git repozitorijum', true),
  ('Napisi API rute', true),
  ('Napisi unit testove', true),
  ('Podesi ESLint', true),
  ('Napravi Dockerfile', true),
  ('Dodaj docker-compose', true),
  ('Dodaj PostgreSQL bazu', true),
  ('Napisi integracione testove', true),
  ('Podesi GitHub Actions pipeline', true),
  ('Dodaj proveru ranjivosti (npm audit)', true),
  ('Objavi Docker image na ghcr.io', true),
  ('Dodaj monitoring (Prometheus, Grafana)', false),
  ('Dodaj migracije baze', false),
  ('Podesi automatski deploy na server', false),
  ('Dodaj autentifikaciju korisnika', false),
  ('Napisi dokumentaciju API-ja', false),
  ('Uradi load test', false),
  ('Podesi rotaciju logova', false),
  ('Dodaj backup baze', false),
  ('Pripremi prezentaciju za ispit', false);
