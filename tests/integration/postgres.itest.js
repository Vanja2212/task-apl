// Integracioni testovi: pokrecu se samo kada je podesen DATABASE_URL
// (u CI-ju ga obezbedjuje Postgres servis, lokalno: npm run test:integration).
const request = require("supertest");
const { Pool } = require("pg");
const { createApp } = require("../../src/app");
const { createPostgresRepository } = require("../../src/postgresRepository");

const url = process.env.DATABASE_URL;
const describeIfDb = url ? describe : describe.skip;

describeIfDb("PostgreSQL repozitorijum + API", () => {
  let repo;
  let app;
  let pool;

  beforeAll(async () => {
    repo = createPostgresRepository(url);
    await repo.init();
    pool = new Pool({ connectionString: url });
    app = createApp(repo);
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE tasks RESTART IDENTITY");
  });

  afterAll(async () => {
    await pool.end();
    await repo.close();
  });

  test("kreira i vraca zadatak iz baze", async () => {
    const created = await request(app).post("/tasks").send({ title: "Zadatak iz baze" });
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: 1, title: "Zadatak iz baze", done: false });

    const list = await request(app).get("/tasks");
    expect(list.body).toHaveLength(1);
  });

  test("azurira zadatak", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).put("/tasks/1").send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "A", done: true });
  });

  test("brise zadatak", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    expect((await request(app).delete("/tasks/1")).status).toBe(204);
    expect((await request(app).get("/tasks/1")).status).toBe(404);
  });

  test("statistika se racuna u bazi", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    await request(app).post("/tasks").send({ title: "B" });
    await request(app).put("/tasks/1").send({ done: true });
    const res = await request(app).get("/stats");
    expect(res.body).toEqual({ total: 2, done: 1, open: 1 });
  });

  test("veoma veliki id vraca 404, a ne gresku baze", async () => {
    const res = await request(app).get("/tasks/99999999999");
    expect(res.status).toBe(404);
  });
});
