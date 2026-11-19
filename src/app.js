const express = require("express");

const MAX_ID = 2147483647; // najveci INTEGER u PostgreSQL-u

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 && id <= MAX_ID ? id : null;
}

// Express 4 ne hvata greske iz async handlera, pa ih prosledjujemo dalje.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function createApp(repo) {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get(
    "/tasks",
    wrap(async (req, res) => {
      res.json(await repo.list());
    })
  );

  app.get(
    "/tasks/:id",
    wrap(async (req, res) => {
      const id = parseId(req.params.id);
      const task = id && (await repo.get(id));
      if (!task) return res.status(404).json({ error: "Zadatak nije pronadjen" });
      res.json(task);
    })
  );

  app.post(
    "/tasks",
    wrap(async (req, res) => {
      const { title } = req.body || {};
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "Polje 'title' je obavezno" });
      }
      const task = await repo.create(title.trim());
      res.status(201).json(task);
    })
  );

  app.put(
    "/tasks/:id",
    wrap(async (req, res) => {
      const id = parseId(req.params.id);
      if (!id || !(await repo.get(id))) {
        return res.status(404).json({ error: "Zadatak nije pronadjen" });
      }

      const { title, done } = req.body || {};
      if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(400).json({ error: "Neispravan 'title'" });
      }
      if (done !== undefined && typeof done !== "boolean") {
        return res.status(400).json({ error: "Polje 'done' mora biti boolean" });
      }

      const updated = await repo.update(id, {
        title: title === undefined ? undefined : title.trim(),
        done,
      });
      res.json(updated);
    })
  );

  app.delete(
    "/tasks/:id",
    wrap(async (req, res) => {
      const id = parseId(req.params.id);
      const removed = id && (await repo.remove(id));
      if (!removed) return res.status(404).json({ error: "Zadatak nije pronadjen" });
      res.status(204).send();
    })
  );

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Interna greska servera" });
  });

  return app;
}

module.exports = { createApp };
