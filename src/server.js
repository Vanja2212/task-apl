const { createApp } = require("./app");
const { createMemoryRepository } = require("./memoryRepository");
const { createPostgresRepository } = require("./postgresRepository");

const PORT = process.env.PORT || 3000;

async function main() {
  const repo = process.env.DATABASE_URL
    ? createPostgresRepository(process.env.DATABASE_URL)
    : createMemoryRepository();

  await repo.init();
  console.log(process.env.DATABASE_URL ? "Koristi se PostgreSQL" : "Koristi se memorija (nema DATABASE_URL)");

  const server = createApp(repo).listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await repo.close();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Pokretanje nije uspelo:", err);
  process.exit(1);
});
