// Repozitorijum koji cuva zadatke u memoriji (koristi se u unit testovima
// i kada DATABASE_URL nije podesen).
function createMemoryRepository() {
  let tasks = [];
  let nextId = 1;

  return {
    async init() {},
    async close() {},

    async list() {
      return tasks.map((t) => ({ ...t }));
    },

    async get(id) {
      const task = tasks.find((t) => t.id === id);
      return task ? { ...task } : null;
    },

    async stats() {
      const done = tasks.filter((t) => t.done).length;
      return { total: tasks.length, done, open: tasks.length - done };
    },

    async create(title) {
      const task = { id: nextId++, title, done: false };
      tasks.push(task);
      return { ...task };
    },

    async update(id, { title, done }) {
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      if (title !== undefined) task.title = title;
      if (done !== undefined) task.done = done;
      return { ...task };
    },

    async remove(id) {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}

module.exports = { createMemoryRepository };
