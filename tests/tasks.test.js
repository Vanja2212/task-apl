const request = require("supertest");
const { createApp } = require("../src/app");
const { createMemoryRepository } = require("../src/memoryRepository");

describe("Task API", () => {
  let app;
  beforeEach(() => {
    app = createApp(createMemoryRepository());
  });

  test("GET /health vraca status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("GET /tasks na pocetku vraca praznu listu", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("POST /tasks kreira zadatak", async () => {
    const res = await request(app).post("/tasks").send({ title: "  Nauci Docker " });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: "Nauci Docker", done: false });
  });

  test("POST /tasks bez naslova vraca 400", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.status).toBe(400);
  });

  test("POST /tasks sa praznim naslovom vraca 400", async () => {
    const res = await request(app).post("/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
  });

  test("GET /tasks/:id vraca zadatak", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).get("/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("A");
  });

  test("GET /tasks/:id nepostojeci vraca 404", async () => {
    const res = await request(app).get("/tasks/99");
    expect(res.status).toBe(404);
  });

  test("PUT /tasks/:id azurira naslov i status", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    const res = await request(app).put("/tasks/1").send({ title: "B", done: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "B", done: true });
  });

  test("PUT /tasks/:id sa neispravnim podacima vraca 400", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    const badTitle = await request(app).put("/tasks/1").send({ title: "" });
    const badDone = await request(app).put("/tasks/1").send({ done: "da" });
    expect(badTitle.status).toBe(400);
    expect(badDone.status).toBe(400);
  });

  test("PUT /tasks/:id nepostojeci vraca 404", async () => {
    const res = await request(app).put("/tasks/99").send({ done: true });
    expect(res.status).toBe(404);
  });

  test("DELETE /tasks/:id brise zadatak", async () => {
    await request(app).post("/tasks").send({ title: "A" });
    const del = await request(app).delete("/tasks/1");
    expect(del.status).toBe(204);
    const list = await request(app).get("/tasks");
    expect(list.body).toEqual([]);
  });

  test("DELETE /tasks/:id nepostojeci vraca 404", async () => {
    const res = await request(app).delete("/tasks/99");
    expect(res.status).toBe(404);
  });
});

describe("Task API - dodatni slucajevi", () => {
  test("neispravan id vraca 404", async () => {
    const app = createApp(createMemoryRepository());
    expect((await request(app).get("/tasks/abc")).status).toBe(404);
    expect((await request(app).get("/tasks/-1")).status).toBe(404);
    expect((await request(app).put("/tasks/abc").send({ done: true })).status).toBe(404);
    expect((await request(app).delete("/tasks/abc")).status).toBe(404);
  });

  test("greska u repozitorijumu vraca 500", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const brokenRepo = {
      list: async () => {
        throw new Error("baza ne radi");
      },
    };
    const res = await request(createApp(brokenRepo)).get("/tasks");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Interna greska servera" });
    spy.mockRestore();
  });
});
