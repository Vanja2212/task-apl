const express = require("express");

function createApp() {
  const app = express();
  app.use(express.json());

  let tasks = [];
  let nextId = 1;

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/tasks", (req, res) => {
    res.json(tasks);
  });

  app.get("/tasks/:id", (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Zadatak nije pronadjen" });
    res.json(task);
  });

  app.post("/tasks", (req, res) => {
    const { title } = req.body || {};
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Polje 'title' je obavezno" });
    }
    const task = { id: nextId++, title: title.trim(), done: false };
    tasks.push(task);
    res.status(201).json(task);
  });

  app.put("/tasks/:id", (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Zadatak nije pronadjen" });

    const { title, done } = req.body || {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "Neispravan 'title'" });
      }
      task.title = title.trim();
    }
    if (done !== undefined) {
      if (typeof done !== "boolean") {
        return res.status(400).json({ error: "Polje 'done' mora biti boolean" });
      }
      task.done = done;
    }
    res.json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const index = tasks.findIndex((t) => t.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Zadatak nije pronadjen" });
    tasks.splice(index, 1);
    res.status(204).send();
  });

  return app;
}

module.exports = { createApp };
