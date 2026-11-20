const { Pool } = require("pg");

// Repozitorijum koji cuva zadatke u PostgreSQL bazi.
// Ima isti interfejs kao memoryRepository.
function createPostgresRepository(connectionString) {
  const pool = new Pool({ connectionString });

  return {
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);
    },

    async close() {
      await pool.end();
    },

    async list() {
      const { rows } = await pool.query("SELECT id, title, done FROM tasks ORDER BY id");
      return rows;
    },

    async get(id) {
      const { rows } = await pool.query("SELECT id, title, done FROM tasks WHERE id = $1", [id]);
      return rows[0] || null;
    },

    async stats() {
      const { rows } = await pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE done)::int AS done,
               COUNT(*) FILTER (WHERE NOT done)::int AS open
        FROM tasks
      `);
      return rows[0];
    },

    async create(title) {
      const { rows } = await pool.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done",
        [title]
      );
      return rows[0];
    },

    async update(id, { title, done }) {
      const { rows } = await pool.query(
        `UPDATE tasks
           SET title = COALESCE($2, title),
               done = COALESCE($3, done)
         WHERE id = $1
         RETURNING id, title, done`,
        [id, title ?? null, done ?? null]
      );
      return rows[0] || null;
    },

    async remove(id) {
      const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
      return result.rowCount > 0;
    },
  };
}

module.exports = { createPostgresRepository };
